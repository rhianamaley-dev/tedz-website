"use client";
import { useState, useRef, useEffect } from "react";

/* ────────────────────────────────────────────
   ASSISTANT IDENTITY
   ──────────────────────────────────────────── */
const ASSISTANT = {
  name: "Jordan",
  role: "AI Assistant",
  greeting: "Hi, I'm Jordan, the AI assistant for TEDZ Integrative Systems. What's your name and best phone number?",
};

const STARTER_QUICK_REPLIES = [
  "I want to capture more leads",
  "How does it work?",
  "I'm just browsing",
];

/* ────────────────────────────────────────────
   ILLUSTRATED AVATAR — recolored for dark theme
   ──────────────────────────────────────────── */
function AssistantAvatar({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      flexShrink: 0, background: "#1c1f26",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "2px solid #ff5c1a",
    }}>
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#F5DEB3" />
        <path d="M14 30 Q14 14 32 14 Q50 14 50 30 L50 38 Q48 32 44 32 L20 32 Q16 32 14 38 Z" fill="#3E2A1F"/>
        <ellipse cx="32" cy="36" rx="13" ry="15" fill="#E8C39E"/>
        <path d="M19 26 Q24 22 32 22 Q40 22 45 26 Q42 28 38 27 Q35 30 32 28 Q29 30 26 27 Q22 28 19 26 Z" fill="#3E2A1F"/>
        <ellipse cx="27" cy="36" rx="1.4" ry="1.8" fill="#0a0a0a"/>
        <ellipse cx="37" cy="36" rx="1.4" ry="1.8" fill="#0a0a0a"/>
        <circle cx="27.4" cy="35.5" r="0.5" fill="#fff"/>
        <circle cx="37.4" cy="35.5" r="0.5" fill="#fff"/>
        <path d="M24 33 Q27 32 30 33" stroke="#3E2A1F" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M34 33 Q37 32 40 33" stroke="#3E2A1F" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M32 39 L31 42 L33 42" stroke="#C4936B" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
        <path d="M28 45 Q32 48 36 45" stroke="#8B4A38" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <path d="M14 64 Q14 52 24 50 Q28 54 32 54 Q36 54 40 50 Q50 52 50 64 Z" fill="#1c1f26"/>
        <path d="M28 53 L32 56 L36 53" stroke="#ff5c1a" strokeWidth="0.8" fill="none" opacity="0.6"/>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   RENDER MESSAGE CONTENT — booking links
   ──────────────────────────────────────────── */
function renderMessageContent(content) {
  return content.split(/(https?:\/\/[^\s]+)/g).map((part, idx) => {
    if (part.match(/^https?:\/\//)) {
      return (
        <a key={idx} href={part} target="_blank" rel="noopener noreferrer"
          style={{ color: "#ff5c1a", textDecoration: "underline", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
          Click here to book
        </a>
      );
    }
    return part;
  });
}

/* ────────────────────────────────────────────
   CHAT WIDGET — dark theme, orange accents
   ──────────────────────────────────────────── */
function ChatWidget({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: ASSISTANT.greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(STARTER_QUICK_REPLIES);
  const [leadAlertSent, setLeadAlertSent] = useState(false);
  const [finalTranscriptSent, setFinalTranscriptSent] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const idleTimerRef = useRef(null);
  const messagesRef = useRef(messages);
  const leadAlertSentRef = useRef(leadAlertSent);
  const finalTranscriptSentRef = useRef(finalTranscriptSent);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { leadAlertSentRef.current = leadAlertSent; }, [leadAlertSent]);
  useEffect(() => { finalTranscriptSentRef.current = finalTranscriptSent; }, [finalTranscriptSent]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  // Listen for industry tag clicks from the "Who It's For" section
  useEffect(() => {
    const handleNiche = (e) => {
      const industry = e.detail;
      if (industry && isOpen) {
        setQuickReplies([]);
        sendMessage(`I run a ${industry.toLowerCase()} business`);
      }
    };
    window.addEventListener('nicheSelected', handleNiche);
    return () => window.removeEventListener('nicheSelected', handleNiche);
  }, [isOpen, messages, leadAlertSent, finalTranscriptSent]);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(async () => {
      if (!leadAlertSentRef.current || finalTranscriptSentRef.current) return;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finalize: true,
            history: messagesRef.current.slice(1).map(m => ({ role: m.role, content: m.content })),
            leadAlertSent: leadAlertSentRef.current,
            finalTranscriptSent: finalTranscriptSentRef.current,
          }),
        });
        const data = await res.json();
        if (data.finalTranscriptSent) setFinalTranscriptSent(true);
      } catch (err) { console.error("Idle finalize failed:", err); }
    }, 120000);
  };

  useEffect(() => {
    if (!isOpen && idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isOpen]);

  const sendMessage = async (overrideText) => {
    const msg = (overrideText ?? input).trim();
    if (!msg) return;
    setInput("");
    setQuickReplies([]);
    const updatedMessages = [...messages, { role: "user", content: msg }];
    setMessages(updatedMessages);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          leadAlertSent,
          finalTranscriptSent,
        }),
      });
      const data = await res.json();
      setTyping(false);
      if (data.leadAlertSent) setLeadAlertSent(true);
      if (data.finalTranscriptSent) setFinalTranscriptSent(true);
      setMessages(p => [...p, { role: "assistant", content: data.reply || "Sorry, something went wrong. Please try again." }]);
      resetIdleTimer();
    } catch {
      setTyping(false);
      setMessages(p => [...p, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    }
  };

  /* FAB */
  if (!isOpen) return (
    <button onClick={onToggle} aria-label={`Open chat with ${ASSISTANT.name}`} style={{
      position: "fixed", bottom: 28, right: 28, width: 68, height: 68,
      borderRadius: "50%", background: "linear-gradient(145deg,#ff5c1a,#cc4a15)",
      border: "3px solid rgba(255,255,255,0.12)", cursor: "pointer",
      boxShadow: "0 8px 32px rgba(255,92,26,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      animation: "tdzPulse 2.5s ease-out infinite",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  );

  /* Window */
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, width: 390, height: 580,
      borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
      boxShadow: "0 24px 64px rgba(0,0,0,0.6)", zIndex: 9999,
      background: "#0f1117", border: "1px solid rgba(255,92,26,0.25)",
      animation: "tdzSlideUp 0.3s ease-out",
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0a0a0a,#1c1f26)", padding: "16px 18px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,92,26,0.2)" }}>
        <AssistantAvatar size={42} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ color: "#f5f3ee", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
            {ASSISTANT.name}
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block", boxShadow: "0 0 6px rgba(74,222,128,0.5)" }} />
          </div>
          <div style={{ color: "#ff5c1a", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "1px", textTransform: "uppercase" }}>{ASSISTANT.role} — TEDZ</div>
        </div>
        <button onClick={onToggle} aria-label="Close chat" style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 26, padding: 4, lineHeight: 1 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", background: "#0a0a0a" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", marginBottom: 12, alignItems: "flex-end", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && <div style={{ marginRight: 8, alignSelf: "flex-end" }}><AssistantAvatar size={26} /></div>}
            <div style={{
              maxWidth: "78%", padding: "10px 14px", borderRadius: 12,
              fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-line", fontFamily: "'DM Sans', sans-serif",
              ...(m.role === "user"
                ? { background: "#ff5c1a", color: "#fff", borderBottomRightRadius: 3 }
                : { background: "#1c1f26", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.07)", borderBottomLeftRadius: 3 }),
            }}>
              {m.role === "assistant" ? renderMessageContent(m.content) : m.content}
            </div>
          </div>
        ))}

        {quickReplies.length > 0 && !typing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "6px 0 12px", paddingLeft: 34 }}>
            {quickReplies.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{
                alignSelf: "flex-start", padding: "9px 14px", borderRadius: 10,
                background: "transparent", border: "1px solid rgba(255,92,26,0.4)",
                color: "#ff5c1a", fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ff5c1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff5c1a"; }}
              >{q}</button>
            ))}
          </div>
        )}

        {typing && (
          <div style={{ display: "flex", marginBottom: 12, alignItems: "flex-end" }}>
            <div style={{ marginRight: 8 }}><AssistantAvatar size={26} /></div>
            <div style={{ background: "#1c1f26", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 18px", borderRadius: 12, display: "flex", gap: 5 }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6b7280", display: "inline-block", animation: `tdzBounce 1.2s ${d}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0f1117", display: "flex", gap: 8 }}>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={`Message ${ASSISTANT.name}...`}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#1c1f26", color: "#f5f3ee", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
        />
        <button onClick={() => sendMessage()} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: input.trim() ? "#ff5c1a" : "#1c1f26",
          cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {/* Powered by */}
      <div style={{ padding: "5px 14px", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <a href="https://tedzintegrativesystems.com" target="_blank" rel="noopener noreferrer"
          style={{ color: "#6b7280", fontSize: 11, textDecoration: "none", fontFamily: "'DM Mono', monospace", letterSpacing: "0.5px" }}>
          Powered by <span style={{ color: "#ff5c1a", fontWeight: 700 }}>TEDZ</span>
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   APPLE-STYLE SECTION NAV
   ──────────────────────────────────────────── */
const NAV_SECTIONS = [
  { label: "Overview",       id: "s-hero"     },
  { label: "How It Works",   id: "s-how"      },
  { label: "Live Demo",      id: "s-demo"     },
  { label: "What's Included",id: "s-includes" },
  { label: "Who It's For",   id: "s-who"      },
  { label: "Plans",          id: "s-plans"    },
  { label: "Get Started",    id: "s-contact"  },
];

function SectionNav({ setChatOpen }) {
  const [active, setActive] = useState("s-hero");

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.3 }
    );
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 48px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: "#ff5c1a" }}>TEDZ INTEGRATIVE</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Systems for Local Business</div>
        </div>
        <button onClick={() => scrollTo("s-demo")} style={{ background: "#ff5c1a", color: "#0a0a0a", padding: "10px 24px", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#cc4a15"}
          onMouseLeave={e => e.currentTarget.style.background = "#ff5c1a"}
        >See Live Demo</button>
      </div>
      <div style={{ display: "flex", overflowX: "auto", padding: "0 48px", scrollbarWidth: "none" }}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)} style={{
            padding: "11px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: active === s.id ? "2px solid #ff5c1a" : "2px solid transparent",
            color: active === s.id ? "#ff5c1a" : "#6b7280",
            whiteSpace: "nowrap", transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (active !== s.id) e.currentTarget.style.color = "#f5f3ee"; }}
            onMouseLeave={e => { if (active !== s.id) e.currentTarget.style.color = "#6b7280"; }}
          >{s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────── */
export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [otherExpanded, setOtherExpanded] = useState(false);
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const includes = [
    { icon: "🌐", title: "Custom Domain Site",        desc: "Fully designed, mobile-first website branded to your business. Fast, secure, and built to convert visitors into booked jobs from day one.",                                                           tag: "Your Brand"  },
    { icon: "🤖", title: "AI Chat Assistant",          desc: "Captures leads, answers questions, qualifies jobs, and books appointments 24/7. Even when you are on the job site or off the clock.",                                                                  tag: "Always On"   },
    { icon: "📅", title: "Online Booking",             desc: "Customers book estimates and service calls directly from your site. No missed calls, no phone tag. Jobs land on your calendar automatically.",                                                          tag: "Pro & Elite" },
    { icon: "📧", title: "Instant Lead Alerts",        desc: "Every chatbot lead fires an immediate notification. Name, number, what they need. Hits your inbox within seconds.",                                                                                    tag: "Every Plan"  },
    { icon: "📈", title: "Local SEO Setup",            desc: "Built to be found. Google Business integration, structured data, sitemap, and meta optimization. Everything local search requires from day one.",                                                       tag: "Every Plan"  },
    { icon: "🛡️", title: "Managed Hosting & Security", desc: "Enterprise-grade hosting, SSL certificate, DDoS protection, and 99.9% uptime. Fully managed so you never have to think about it.",                                                                    tag: "Every Plan"  },
  ];

  const plans = [
    {
      badge: "Plan 01", name: "Starter", tagline: "Get online. Start capturing.",
      features: ["Custom branded website, up to 5 pages", "Mobile-first, fast-loading design", "AI chatbot, 24/7 lead capture", "Instant lead email alerts", "Google Business profile setup", "Managed hosting & SSL", "Monthly performance report"],
      off: ["Online booking system", "SEO content writing", "Priority support"],
      best: "Just getting online",
    },
    {
      badge: "Most Popular — Plan 02", name: "Pro", featured: true, tagline: "Leads in. Jobs booked. You're busy.",
      features: ["Everything in Starter", "AI chatbot with online booking", "Appointment scheduling built in", "Lead alerts, email & SMS", "Local SEO content (2 pages/month)", "Automated Google review requests", "Competitor visibility report", "Priority 24-hour support", "Quarterly strategy call"],
      off: [],
      best: "Growing service businesses",
    },
    {
      badge: "Plan 03", name: "Elite", tagline: "Full automation. Maximum scale.",
      features: ["Everything in Pro", "Fully custom AI automation", "Software & CRM integration", "Unlimited SEO content", "Ad campaign management", "Multi-location support", "Custom AI personality & voice", "White-glove onboarding", "Monthly 1-on-1 strategy call", "Dedicated account manager"],
      off: [],
      best: "Established businesses scaling fast",
    },
  ];

  const niches = ["HVAC Companies","Roofing Contractors","Plumbers","Electricians","General Contractors","Landscapers","Pest Control","Dental Offices","Med Spas","Chiropractors","Auto Body Shops","Pool Service"];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0a; color: #f5f3ee; font-family: 'DM Sans', sans-serif; font-size: 16px; line-height: 1.6; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }

        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #ff5c1a; border-radius: 5px; border: 3px solid #0a0a0a; }
        html { scrollbar-color: #ff5c1a #0a0a0a; scrollbar-width: thin; }

        @keyframes tdzPulse {
          0%   { box-shadow: 0 8px 32px rgba(255,92,26,0.4), 0 0 0 0   rgba(255,92,26,0.4); }
          70%  { box-shadow: 0 8px 32px rgba(255,92,26,0.4), 0 0 0 14px rgba(255,92,26,0);   }
          100% { box-shadow: 0 8px 32px rgba(255,92,26,0.4), 0 0 0 0   rgba(255,92,26,0);   }
        }
        @keyframes tdzSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tdzBounce  { 0%,60%,100% { transform:translateY(0);  } 30% { transform:translateY(-5px); } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }

        .tdz-a1 { opacity:0; animation:fadeUp 0.65s 0.10s forwards; }
        .tdz-a2 { opacity:0; animation:fadeUp 0.65s 0.25s forwards; }
        .tdz-a3 { opacity:0; animation:fadeUp 0.65s 0.40s forwards; }
        .tdz-a4 { opacity:0; animation:fadeUp 0.65s 0.55s forwards; }
        .tdz-a5 { opacity:0; animation:fadeUp 0.65s 0.70s forwards; }

        .tdz-btn-primary { background:#ff5c1a; color:#0a0a0a; padding:16px 36px; font-weight:700; font-size:14px; letter-spacing:1px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background 0.2s,transform 0.15s; }
        .tdz-btn-primary:hover { background:#cc4a15; transform:translateY(-1px); }
        .tdz-btn-ghost   { color:#f5f3ee; padding:16px 36px; font-weight:500; font-size:14px; letter-spacing:0.5px; border:1px solid rgba(255,255,255,0.1); background:transparent; cursor:pointer; font-family:'DM Sans',sans-serif; transition:border-color 0.2s,color 0.2s; }
        .tdz-btn-ghost:hover { border-color:#ff5c1a; color:#ff5c1a; }

        .tdz-inc-card { background:#0a0a0a; padding:40px 36px; transition:background 0.2s; cursor:default; }
        .tdz-inc-card:hover { background:#1c1f26; }

        .tdz-plan-btn      { display:block; width:100%; padding:14px 28px; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border:2px solid #ff5c1a; color:#ff5c1a; background:transparent; cursor:pointer; font-family:'DM Sans',sans-serif; white-space:nowrap; transition:all 0.2s; }
        .tdz-plan-btn:hover { background:#ff5c1a; color:#0a0a0a; }
        .tdz-plan-btn-feat      { display:block; width:100%; padding:14px 28px; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border:2px solid #0a0a0a; color:#0a0a0a; background:transparent; cursor:pointer; font-family:'DM Sans',sans-serif; white-space:nowrap; transition:all 0.2s; }
        .tdz-plan-btn-feat:hover { background:#0a0a0a; color:#ff5c1a; }

        .tdz-niche-tag   { padding:10px 20px; border:1px solid rgba(255,92,26,0.3); font-family:'DM Mono',monospace; font-size:12px; letter-spacing:1px; color:#9ca3af; background:rgba(255,92,26,0.04); transition:all 0.2s; cursor:pointer; }
        .tdz-niche-tag:hover { border-color:#ff5c1a; color:#ff5c1a; background:rgba(255,92,26,0.08); }
        .tdz-niche-other { padding:10px 20px; border:1px solid #ff5c1a; font-family:'DM Mono',monospace; font-size:12px; letter-spacing:1px; color:#ff5c1a; background:rgba(255,92,26,0.06); cursor:pointer; font-weight:700; transition:all 0.2s; }
        .tdz-niche-other:hover { background:#ff5c1a; color:#0a0a0a; }

        @media (max-width:900px) {
          .tdz-hide-mob   { display:none !important; }
          .tdz-hero-h     { font-size:68px !important; }
          .tdz-inc-grid   { grid-template-columns:1fr !important; }
          .tdz-plan-row   { grid-template-columns:1fr !important; gap:24px !important; }
          .tdz-demo-split { grid-template-columns:1fr !important; }
          .tdz-demo-r     { display:none !important; }
          .tdz-how-grid   { grid-template-columns:1fr 1fr !important; }
          .tdz-nav-pad    { padding:14px 24px !important; }
          .tdz-sec-pad    { padding:60px 24px !important; }
        }
      `}</style>

      {/* ── UTILITY BAR ── */}
      <div style={{ background:"#1c1f26", borderBottom:"1px solid rgba(255,92,26,0.15)", padding:"8px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13, color:"#9ca3af" }}>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <a href="mailto:info@tedzintegrativesystems.com"
            style={{ display:"flex", alignItems:"center", gap:6, color:"#9ca3af", transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color="#ff5c1a"}
            onMouseLeave={e => e.currentTarget.style.color="#9ca3af"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Us
          </a>
          <span style={{ display:"flex", alignItems:"center", gap:6, color:"#6b7280" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", display:"inline-block", boxShadow:"0 0 6px rgba(74,222,128,0.5)" }} />
            Available now
          </span>
        </div>
        <button onClick={() => scrollTo("s-plans")} style={{ background:"#ff5c1a", color:"#0a0a0a", padding:"5px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase", border:"none", transition:"background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background="#cc4a15"}
          onMouseLeave={e => e.currentTarget.style.background="#ff5c1a"}
        >See Plans</button>
      </div>

      {/* ── SECTION NAV ── */}
      <SectionNav setChatOpen={setChatOpen} />

      {/* ── HERO — Ready to Stop Missing Jobs ── */}
      <section id="s-hero" className="tdz-sec-pad" style={{ minHeight:"90vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"120px 48px 80px", position:"relative", overflow:"hidden", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,92,26,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,92,26,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:-200, left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,92,26,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:900, margin:"0 auto" }}>
          <div className="tdz-a1" style={{ fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:24 }}>Get Started</div>
          <h1 className="tdz-a2 tdz-hero-h" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:120, lineHeight:0.92, letterSpacing:2, textTransform:"uppercase", marginBottom:32 }}>
            Ready to Stop<br /><span style={{ color:"#ff5c1a" }}>Missing Jobs?</span>
          </h1>
          <p className="tdz-a3" style={{ maxWidth:580, fontSize:18, color:"#9ca3af", fontWeight:300, lineHeight:1.7, marginBottom:48, margin:"0 auto 48px" }}>
            Talk to Jordan right now. In two minutes we&apos;ll know what your business needs. Custom quote within 24 hours. Site live in 48.
          </p>
          <div className="tdz-a4" style={{ display:"flex", gap:16, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
            <button className="tdz-btn-primary" onClick={() => setChatOpen(true)}>Talk to Jordan Now</button>
            <a href="https://cal.com/tedz-integrative-systems/service-appointment" target="_blank" rel="noopener noreferrer">
              <button className="tdz-btn-ghost">Book a 15-Min Call</button>
            </a>
          </div>
          <div className="tdz-a5" style={{ display:"flex", gap:48, marginTop:80, flexWrap:"wrap", justifyContent:"center" }}>
            {["Your Domain Stays Yours","No Long-Term Contracts","Live in 48 Hours","HIPAA Compliant","Real Humans Behind the AI"].map((label,i) => (
              <div key={i}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:"#ff5c1a", letterSpacing:1, marginBottom:4 }}>—</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:"1.5px", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STRIP ── */}
      <div style={{ background:"#ff5c1a", padding:"28px 48px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:16, textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#0a0a0a", letterSpacing:1 }}>
            The average missed call costs a service business $400 to $800 in lost revenue. Or more.
          </div>
          <button onClick={() => setChatOpen(true)} style={{ background:"#0a0a0a", color:"#ff5c1a", padding:"14px 32px", fontWeight:700, fontSize:14, letterSpacing:1, textTransform:"uppercase", border:"2px solid #0a0a0a", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0, whiteSpace:"nowrap", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#0a0a0a"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#0a0a0a";    e.currentTarget.style.color="#ff5c1a"; }}
          >Stop Losing Jobs</button>
        </div>
      </div>

      {/* ── YOUR BRAND. OUR ENGINE. (moved from hero to secondary brand section) ── */}
      <section className="tdz-sec-pad" style={{ padding:"100px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Done-For-You AI Websites</div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:80, lineHeight:0.92, letterSpacing:2, textTransform:"uppercase", marginBottom:32 }}>
            Your Brand.<br /><span style={{ color:"#ff5c1a" }}>Our Engine.</span>
          </h2>
          <p style={{ maxWidth:580, fontSize:18, color:"#9ca3af", fontWeight:300, lineHeight:1.7, marginBottom:48, margin:"0 auto 48px" }}>
            We build, deploy, and manage AI-powered websites for local businesses. So you stop losing leads while you&apos;re on the job.
          </p>
          <div style={{ display:"flex", gap:48, flexWrap:"wrap", justifyContent:"center" }}>
            {[{ num:"48H", label:"Launch Time" },{ num:"100%", label:"Trained on Your Business" },{ num:"24/7", label:"AI Assistant Active" },{ num:"2 sec", label:"Response Time" }].map((s,i) => (
              <div key={i}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, color:"#ff5c1a", lineHeight:1 }}>{s.num}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#6b7280", textTransform:"uppercase", letterSpacing:"1.5px", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="s-how" className="tdz-sec-pad" style={{ padding:"100px 48px", background:"#1c1f26", textAlign:"center" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>How It Works</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, textTransform:"uppercase", lineHeight:1, marginBottom:20 }}>Live in 48 Hours.</h2>
        <p style={{ fontSize:16, color:"#9ca3af", maxWidth:520, lineHeight:1.7, marginBottom:64, margin:"0 auto 64px" }}>
          We handle every part of the build. You hand us your logo, service area, and phone number. We hand you back a fully running AI-powered website. Ready to capture leads.
        </p>
        <div className="tdz-how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.06)", maxWidth:1000, margin:"0 auto", textAlign:"left" }}>
          {[
            { step:"01", title:"We Learn Your Business", desc:"Services, service area, hours, and pricing. We do the rest. No forms, no spreadsheets. Just a quick conversation." },
            { step:"02", title:"We Build the AI",        desc:"The AI assistant is trained on your exact business. It knows your prices, hours, and service area. It does not guess. It knows." },
            { step:"03", title:"We Launch the Site",     desc:"A fully branded, mobile-first website goes live in 48 hours on your domain. We handle every technical step." },
            { step:"04", title:"Leads Hit Your Phone",   desc:"Every time the AI captures a lead, you get an instant alert. Name, number, what they need. The job is practically yours." },
          ].map((s,i) => (
            <div key={i} style={{ background:"#0a0a0a", padding:"40px 36px" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:"#ff5c1a", lineHeight:1, marginBottom:16, opacity:0.3 }}>{s.step}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:1, marginBottom:12 }}>{s.title}</div>
              <div style={{ fontSize:14, color:"#9ca3af", lineHeight:1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="s-demo" className="tdz-sec-pad" style={{ padding:"100px 48px", background:"#1c1f26", textAlign:"center" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Live Demo</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, textTransform:"uppercase", lineHeight:1, marginBottom:20 }}>What You Get.</h2>
        <p style={{ fontSize:16, color:"#9ca3af", maxWidth:560, lineHeight:1.7, marginBottom:48, margin:"0 auto 48px" }}>
          Every site we build looks like this. Your colors, your name, your AI chatbot. Built on our infrastructure. Live in 48 hours.
        </p>
        <div style={{ background:"#111318", border:"1px solid rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.5)", maxWidth:1100, margin:"0 auto", textAlign:"left" }}>
          <div style={{ background:"#1a1d24", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", gap:6 }}>{["#ff5f57","#febc2e","#28c840"].map((c,i)=><div key={i} style={{ width:11, height:11, borderRadius:"50%", background:c }} />)}</div>
            <div style={{ flex:1, background:"#0f1117", padding:"5px 14px", borderRadius:3, fontFamily:"'DM Mono',monospace", fontSize:12, color:"#6b7280", marginLeft:8 }}>🔒 sunriseroofingdfw.com</div>
          </div>
          <div className="tdz-demo-split" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:480 }}>
            <div style={{ padding:"60px 48px", background:"linear-gradient(135deg,#0f1117 0%,#1c1f26 100%)", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:4, color:"#ea580c", marginBottom:16 }}>SUNRISE ROOFING DFW</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, lineHeight:0.95, color:"#f0f0f0", textTransform:"uppercase", marginBottom:20 }}>Storm<br /><span style={{ color:"#ea580c" }}>Damage?</span><br />We Fix It.</div>
              <p style={{ fontSize:14, color:"#9ca3af", marginBottom:28, lineHeight:1.6 }}>Serving the DFW metroplex since 2011. Free inspections, insurance claims handled. Call now or chat below. We respond in seconds.</p>
              <button style={{ background:"#ea580c", color:"white", padding:"12px 28px", fontWeight:600, fontSize:13, border:"none", cursor:"pointer", letterSpacing:"0.5px", alignSelf:"flex-start" }}>Get a Free Roof Inspection</button>
            </div>
            <div className="tdz-demo-r" style={{ background:"#161920", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:24, borderLeft:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ background:"#0f1117", border:"1px solid rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden" }}>
                <div style={{ background:"#ea580c", padding:"10px 16px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, background:"#4ade80", borderRadius:"50%" }} />
                  Sunrise Roofing Assistant — Online
                </div>
                <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ background:"#1c2033", color:"#d1d5db", padding:"10px 14px", borderRadius:4, fontSize:13, lineHeight:1.5, maxWidth:"85%", alignSelf:"flex-start" }}>Hi! I'm the Sunrise Roofing assistant. Did your roof take any storm damage recently?</div>
                  <div style={{ background:"#ea580c", color:"white", padding:"10px 14px", borderRadius:4, fontSize:13, lineHeight:1.5, maxWidth:"85%", alignSelf:"flex-end" }}>Yes, hail hit my roof last week</div>
                  <div style={{ background:"#1c2033", color:"#d1d5db", padding:"10px 14px", borderRadius:4, fontSize:13, lineHeight:1.5, maxWidth:"85%", alignSelf:"flex-start" }}>
                    We can get an inspector out today. What's your best phone number? We'll call you shortly. Or you can{" "}
                    <a href="https://cal.com/tedz-integrative-systems/service-appointment" target="_blank" rel="noopener noreferrer" style={{ color:"#ea580c", textDecoration:"underline", fontWeight:600 }}>book an appointment now</a>.
                  </div>
                </div>
                <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 16px", gap:8, alignItems:"center" }}>
                  <span style={{ flex:1, fontSize:12, color:"#6b7280", fontFamily:"'DM Sans',sans-serif" }}>Type a message...</span>
                  <button style={{ background:"#ea580c", color:"white", border:"none", padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:"2px", textTransform:"uppercase", textAlign:"center", marginTop:20 }}>↑ Every site we build. Fully branded. AI-powered. Bookings integrated.</div>
        </div>
      </section>

      {/* ── EVERY PLAN / INCLUDES ── */}
      <section id="s-includes" className="tdz-sec-pad" style={{ padding:"100px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Every Plan</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, textTransform:"uppercase", lineHeight:1, marginBottom:20 }}>Built for the <span style={{ color:"#ff5c1a" }}>Trades.</span></h2>
        <p style={{ fontSize:16, color:"#9ca3af", maxWidth:580, lineHeight:1.7, marginBottom:0, margin:"0 auto" }}>Everything a local service business needs to capture leads, book jobs, and look credible online. We handle the tech. You handle the work.</p>
        <div className="tdz-inc-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.08)", marginTop:60, textAlign:"left" }}>
          {includes.map((card,i) => (
            <div key={i} className="tdz-inc-card">
              <div style={{ fontSize:28, marginBottom:20 }}>{card.icon}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:1, marginBottom:10 }}>{card.title}</div>
              <div style={{ fontSize:14, color:"#9ca3af", lineHeight:1.7 }}>{card.desc}</div>
              <span style={{ display:"inline-block", marginTop:16, fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"1.5px", color:"#ff5c1a", background:"rgba(255,92,26,0.08)", padding:"4px 10px", textTransform:"uppercase" }}>{card.tag}</span>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="s-who" className="tdz-sec-pad" style={{ padding:"80px 48px", background:"#1c1f26", textAlign:"center" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Who It&apos;s For</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, textTransform:"uppercase", lineHeight:1, marginBottom:20 }}>If You Book Jobs,<br /><span style={{ color:"#ff5c1a" }}>We&apos;re For You.</span></h2>
        <p style={{ fontSize:16, color:"#9ca3af", maxWidth:520, lineHeight:1.7, marginBottom:40, margin:"0 auto 40px" }}>From HVAC to roofing to medical. If your business runs on booked appointments and inbound calls, we built this for you.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center" }}>
          {niches.map((tag,i) => <button key={i} className="tdz-niche-tag" onClick={() => { setChatOpen(true); setTimeout(() => { const event = new CustomEvent('nicheSelected', { detail: tag }); window.dispatchEvent(event); }, 300); }}>{tag}</button>)}
          <button className="tdz-niche-other" onClick={() => setOtherExpanded(o => !o)}>
            {otherExpanded ? "Any service business that books appointments or takes inbound calls" : "+ Other Industries"}
          </button>
        </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="s-plans" className="tdz-sec-pad" style={{ padding:"100px 48px", background:"#1c1f26", textAlign:"center" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Pricing Plans</div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, textTransform:"uppercase", lineHeight:1, marginBottom:20 }}>Simple. Scalable. Profitable.</h2>
        <p style={{ fontSize:16, color:"#9ca3af", maxWidth:580, lineHeight:1.7, marginBottom:60, margin:"0 auto 60px" }}>Three plans built to match where your business is. From just getting online to full AI automation. Every plan is custom-quoted to your business size and goals.</p>
        <div style={{ border:"1px solid rgba(255,255,255,0.08)", maxWidth:1100, textAlign:"left" }}>
          {plans.map((plan,i) => (
            <div key={i} className="tdz-plan-row" style={{ display:"grid", gridTemplateColumns:"240px 1fr auto", alignItems:"start", padding:"48px 40px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none", gap:"48px", background: plan.featured ? "#ff5c1a" : "transparent", color: plan.featured ? "#0a0a0a" : "#f5f3ee" }}>
              <div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"2px", textTransform:"uppercase", marginBottom:10, color: plan.featured ? "rgba(0,0,0,0.55)" : "#6b7280" }}>{plan.badge}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{plan.name}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color: plan.featured ? "rgba(0,0,0,0.65)" : "#ff5c1a", letterSpacing:"0.5px", marginBottom:20 }}>{plan.tagline}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:1, color: plan.featured ? "#0a0a0a" : "#f5f3ee", lineHeight:1 }}>Custom Quoted</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color: plan.featured ? "rgba(0,0,0,0.45)" : "#6b7280", marginTop:4 }}>Tailored to your business</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 28px" }}>
                {plan.features.map((f,j) => (
                  <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:14, lineHeight:1.45, color: plan.featured ? "#0a0a0a" : "#f5f3ee" }}>
                    <span style={{ color: plan.featured ? "#0a0a0a" : "#ff5c1a", fontWeight:700, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
                {plan.off.map((f,j) => (
                  <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:14, lineHeight:1.45, color: plan.featured ? "rgba(0,0,0,0.3)" : "#4a5060" }}>
                    <span style={{ flexShrink:0 }}>✗</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12, minWidth:160 }}>
                {plan.featured
                  ? <button className="tdz-plan-btn-feat" onClick={() => setChatOpen(true)}>Get a Quote</button>
                  : <button className="tdz-plan-btn"      onClick={() => setChatOpen(true)}>Get a Quote</button>
                }
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color: plan.featured ? "rgba(0,0,0,0.4)" : "#6b7280", letterSpacing:"1px", textAlign:"right" }}>Best for: {plan.best}</div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── CONTACT (simplified repeat CTA) ── */}
      <section id="s-contact" className="tdz-sec-pad" style={{ padding:"100px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, color:"#ff5c1a", textTransform:"uppercase", marginBottom:16 }}>Get Started</div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:72, textTransform:"uppercase", lineHeight:0.92, marginBottom:32 }}>Ready to Stop<br /><span style={{ color:"#ff5c1a" }}>Missing Jobs?</span></h2>
          <p style={{ fontSize:16, color:"#9ca3af", maxWidth:520, lineHeight:1.7, margin:"0 auto 48px" }}>
            Talk to Jordan right now. In two minutes we&apos;ll know what your business needs. Custom quote within 24 hours. Site live in 48.
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
            <button className="tdz-btn-primary" onClick={() => setChatOpen(true)}>Talk to Jordan Now</button>
            <a href="https://cal.com/tedz-integrative-systems/service-appointment" target="_blank" rel="noopener noreferrer">
              <button className="tdz-btn-ghost">Book a 15-Min Call</button>
            </a>
          </div>
          <div style={{ display:"flex", gap:48, marginTop:64, flexWrap:"wrap", justifyContent:"center" }}>
            {["Your Domain Stays Yours","No Long-Term Contracts","Live in 48 Hours","HIPAA Compliant","Real Humans Behind the AI"].map((label,i) => (
              <div key={i}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:"#ff5c1a", letterSpacing:1, marginBottom:4 }}>—</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:"1.5px", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#0a0a0a", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"40px 48px", display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:16, textAlign:"center" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, color:"#ff5c1a" }}>TEDZ INTEGRATIVE SYSTEMS</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:"1px", marginTop:4 }}>© 2026 TEDZ Integrative Systems LLC. All rights reserved.</div>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
          <a href="mailto:info@tedzintegrativesystems.com"
            style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#6b7280", letterSpacing:"0.5px", transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color="#ff5c1a"}
            onMouseLeave={e => e.currentTarget.style.color="#6b7280"}>
            Email Us
          </a>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#4a5060", letterSpacing:"0.5px" }}>Privacy-first AI for local business.</span>
        </div>
      </footer>

      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </>
  );
}