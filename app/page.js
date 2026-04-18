"use client";
import { useState, useRef, useEffect } from "react";

// ========== DEMO CHAT WIDGET ==========
const DEMO_RESPONSES = [
  { triggers: ["price", "cost", "how much", "pricing", "quote", "estimate", "charge"], response: "Great question! Pricing depends on your business type and what features you need. Our plans start at $149/month for trades like HVAC and plumbing, and $399/month for healthcare with HIPAA compliance.\n\nWant me to set up a free demo customized for your business? I just need your name and what kind of business you run!" },
  { triggers: ["how", "work", "what do", "explain", "tell me"], response: "Here's the simple version — we put an AI chat widget on your website that knows everything about YOUR business. It answers customer questions 24/7, captures leads, and sends them straight to your phone.\n\nThe best part? It takes less than an hour to set up. Want to see a live demo for your business?" },
  { triggers: ["hvac", "plumb", "roof", "contract", "electric", "trade"], response: "We work with a ton of trades businesses! HVAC, plumbing, roofing, electrical, general contractors — you name it.\n\nOne HVAC company we work with caught 12 extra leads in their first month just from after-hours chats. That's over $60K in potential revenue.\n\nWant me to build a free demo for your company?" },
  { triggers: ["dental", "doctor", "clinic", "health", "medical", "derm", "laser", "patient"], response: "We love working with healthcare businesses! Our healthcare plan includes full HIPAA compliance, insurance verification, and appointment booking.\n\nThe AI never gives medical advice — it just answers the routine questions your front desk gets all day (hours, insurance, booking) so your staff can focus on patients.\n\nWant to see how it'd work for your practice?" },
  { triggers: ["demo", "try", "test", "see", "show"], response: "Absolutely! Here's how our demo works — I'll scrape your website tonight, load all your business info into the AI, and by tomorrow morning you'll have a working chat that already knows your services, pricing, and hours.\n\nJust drop your website URL and your name, and I'll get it set up!" },
  { triggers: ["competitor", "other", "different", "why you", "better", "vs"], response: "Three big things set us apart:\n\n1️⃣ Privacy — your data is 100% isolated. We never mix client data or use it to train other models.\n\n2️⃣ Speed — we go live in under an hour, not weeks.\n\n3️⃣ Industry expertise — we already know what your customers ask. No setup headaches.\n\nPlus we're way cheaper than hiring another employee!" },
  { triggers: ["privacy", "secure", "data", "safe", "hipaa"], response: "Security is our #1 thing. Every client's data is completely isolated — your info never touches another business. We encrypt everything, we never use your data to train models for anyone else, and you can delete your data anytime.\n\nFor healthcare clients, we're fully HIPAA compliant with signed BAAs and audit logging.\n\nWant the full security breakdown?" },
  { triggers: ["hi", "hello", "hey", "sup", "yo", "start", "help"], response: "Hey there! 👋 Welcome to TEDZ Integrative Systems!\n\nI'm here to show you how our AI chat widget can capture more leads for your business — 24/7, even while you sleep.\n\nAre you a trades business (HVAC, plumbing, roofing) or in healthcare (dental, clinic, derm)? I'll tailor the info for you!" },
  { triggers: ["setup", "install", "hard", "complicated", "technical", "code"], response: "Super easy — it's literally one line of code pasted into your website. Takes about 5 minutes.\n\nIf you're on WordPress, Wix, Squarespace, or basically any platform, we can do it. We handle all the technical stuff.\n\nYou don't need to be technical at all. Want me to walk you through it?" },
];

function getResponse(msg) {
  const lower = msg.toLowerCase();
  for (const item of DEMO_RESPONSES) {
    if (item.triggers.some(t => lower.includes(t))) return item.response;
  }
  return "Thanks for reaching out! I'd love to help you capture more leads with AI.\n\nCould you tell me what kind of business you run? That way I can show you exactly how our chat widget would work for your industry!";
}

function ChatWidget({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm the AI assistant for TEDZ Integrative Systems. I can show you how we help businesses capture more leads 24/7.\n\nWhat kind of business do you run?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 1000));
    setTyping(false);
    setMessages(p => [...p, { role: "assistant", content: getResponse(msg) }]);
  };

  if (!isOpen) return (
    <button onClick={onToggle} aria-label="Open chat" style={{
      position: "fixed", bottom: 28, right: 28, width: 68, height: 68, borderRadius: "50%",
      background: "linear-gradient(145deg, #D4A853, #B8922E)", border: "3px solid rgba(255,255,255,0.15)",
      cursor: "pointer", boxShadow: "0 8px 32px rgba(180,130,30,0.35), 0 0 0 0 rgba(212,168,83,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      animation: "pulse-ring 2.5s ease-out infinite",
    }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  );

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, width: 390, height: 540,
      borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
      zIndex: 9999, fontFamily: "'Outfit', sans-serif", background: "#fff",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
        padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: "linear-gradient(145deg, #D4A853, #B8922E)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(180,130,30,0.3)",
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>T</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>TEDZ Integrative Systems</div>
          <div style={{ color: "#D4A853", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block", boxShadow: "0 0 6px rgba(74,222,128,0.5)" }}/>
            Online — replies instantly
          </div>
        </div>
        <button onClick={onToggle} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 24, padding: 4, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 8px", background: "#F8FAFC" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
            <div style={{
              maxWidth: "82%", padding: "11px 15px", borderRadius: 16, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-line",
              ...(m.role === "user"
                ? { background: "linear-gradient(135deg, #1A1A2E, #16213E)", color: "#fff", borderBottomRightRadius: 4 }
                : { background: "#fff", color: "#1E293B", border: "1px solid #E8ECF0", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }
              ),
            }}>{m.content}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", marginBottom: 14 }}>
            <div style={{ padding: "12px 20px", borderRadius: 16, background: "#fff", border: "1px solid #E8ECF0", borderBottomLeftRadius: 4, display: "flex", gap: 5 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#B0B8C4", animation: `tBounce 1.2s ease-in-out ${i*0.15}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #EEF0F4", background: "#fff", display: "flex", gap: 10 }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about our AI chat service..."
          style={{ flex: 1, padding: "11px 15px", borderRadius: 12, border: "1px solid #E2E5EA", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#D4A853"} onBlur={e => e.target.style.borderColor = "#E2E5EA"}
        />
        <button onClick={send} style={{
          width: 42, height: 42, borderRadius: 12, border: "none",
          background: input.trim() ? "linear-gradient(145deg, #D4A853, #B8922E)" : "#E8ECF0",
          cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#A0A8B4"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes tBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes pulse-ring { 0%{box-shadow:0 8px 32px rgba(180,130,30,0.35),0 0 0 0 rgba(212,168,83,0.4)} 70%{box-shadow:0 8px 32px rgba(180,130,30,0.35),0 0 0 12px rgba(212,168,83,0)} 100%{box-shadow:0 8px 32px rgba(180,130,30,0.35),0 0 0 0 rgba(212,168,83,0)} }
      `}</style>
    </div>
  );
}

// ========== MAIN LANDING PAGE ==========
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const SectionBadge = ({ children }) => (
    <div style={{
      display: "inline-block", padding: "5px 14px", borderRadius: 20,
      background: "rgba(212,168,83,0.1)", color: "#D4A853",
      fontSize: 12, fontWeight: 700, letterSpacing: 1.2, marginBottom: 14,
      textTransform: "uppercase", border: "1px solid rgba(212,168,83,0.15)",
    }}>{children}</div>
  );

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#0D0D1A", color: "#C8CDD5", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* ===== NAV ===== */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 36px", position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,13,26,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(145deg, #D4A853, #B8922E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(180,130,30,0.25)",
          }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>T</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -0.5 }}>TEDZ</span>
            <span style={{ fontWeight: 400, fontSize: 17, color: "#94A3B8", marginLeft: 6 }}>Integrative Systems</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#services" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8, transition: "color 0.2s" }}>Services</a>
          <a href="#pricing" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8, transition: "color 0.2s" }}>Pricing</a>
          <a href="#how" style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8, transition: "color 0.2s" }}>How It Works</a>
          <button onClick={() => setChatOpen(true)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(145deg, #D4A853, #B8922E)",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", boxShadow: "0 2px 12px rgba(180,130,30,0.25)",
            marginLeft: 8,
          }}>Get a Demo</button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        padding: "100px 36px 80px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <SectionBadge>AI-Powered Lead Capture</SectionBadge>
          <h1 style={{
            fontSize: 58, fontWeight: 900, color: "#fff", lineHeight: 1.1,
            margin: "0 0 22px", letterSpacing: -2.5,
          }}>
            Stop Losing Leads<br/>
            <span style={{ 
              background: "linear-gradient(135deg, #D4A853, #F0D68A)", 
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>While You Sleep</span>
          </h1>
          <p style={{ fontSize: 19, color: "#8892A0", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65, fontWeight: 400 }}>
            TEDZ Integrative Systems puts an AI chat agent on your website that knows your business inside and out. It captures leads, books appointments, and answers questions — 24/7.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setChatOpen(true)} style={{
              padding: "14px 32px", borderRadius: 12, border: "none",
              background: "linear-gradient(145deg, #D4A853, #B8922E)",
              color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 20px rgba(180,130,30,0.3)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Try the Live Demo
            </button>
            <a href="#how" style={{
              padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
              color: "#C8CDD5", fontWeight: 600, fontSize: 16, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              See How It Works →
            </a>
          </div>

          {/* Trust bar */}
          <div style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            {[
              { num: "< 1¢", label: "per conversation" },
              { num: "24/7", label: "always online" },
              { num: "< 1 hr", label: "setup time" },
              { num: "10x", label: "ROI first month" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#D4A853" }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" style={{ padding: "80px 36px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionBadge>What We Do</SectionBadge>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Two Industries. One Platform.
          </h2>
          <p style={{ color: "#7A8494", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Whether you're fixing ACs or fixing smiles, our AI handles the front door.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            {
              title: "Trades & Home Services",
              icon: "🔧",
              items: ["HVAC Companies", "Plumbers", "Roofers", "Electricians", "General Contractors"],
              desc: "Your customers need help NOW — at 10 PM when the AC breaks, on Sunday when the pipe bursts. Our AI catches those leads while you're off the clock.",
              color: "#D4A853",
            },
            {
              title: "Healthcare & Medical",
              icon: "🏥",
              items: ["Dental Offices", "Dermatologists", "Med Spas & Laser", "Clinics", "Chiropractors"],
              desc: "HIPAA compliant. Handles insurance questions, books appointments, and never gives medical advice. Your front desk will thank you.",
              color: "#5EEAD4",
            }
          ].map((card, i) => (
            <div key={i} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
              style={{
                padding: 32, borderRadius: 18,
                background: hoveredCard === i ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${hoveredCard === i ? card.color + "30" : "rgba(255,255,255,0.05)"}`,
                transition: "all 0.3s ease",
              }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{card.icon}</div>
              <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>{card.title}</h3>
              <p style={{ color: "#8892A0", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px" }}>{card.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {card.items.map((item, j) => (
                  <span key={j} style={{
                    padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: card.color + "12", color: card.color, border: `1px solid ${card.color}20`,
                  }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" style={{ padding: "80px 36px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionBadge>How It Works</SectionBadge>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Live in Under an Hour
          </h2>
        </div>

        {[
          { step: "01", title: "We learn your business", desc: "We pull your website content — services, pricing, hours, service area. Everything your customers ask about.", time: "10 min" },
          { step: "02", title: "We train the AI on you", desc: "The AI gets loaded with YOUR information. It doesn't guess — it knows your exact prices, your hours, your service area.", time: "15 min" },
          { step: "03", title: "We install the widget", desc: "One line of code on your website. Works on WordPress, Wix, Squarespace, Shopify — anything. We handle it for you.", time: "5 min" },
          { step: "04", title: "You start getting leads", desc: "Customers chat, the AI answers, and you get a text or email with every qualified lead. Even at 2 AM on a Tuesday.", time: "Immediate" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 24, marginBottom: 24, padding: "24px 28px",
            borderRadius: 16, background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(145deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))",
              border: "1px solid rgba(212,168,83,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D4A853", fontSize: 18, fontWeight: 800,
            }}>{item.step}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#fff", fontSize: 17, margin: "0 0 6px", fontWeight: 700 }}>{item.title}</h4>
              <p style={{ color: "#8892A0", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
            <div style={{
              padding: "6px 12px", borderRadius: 8, background: "rgba(212,168,83,0.08)",
              color: "#D4A853", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, marginTop: 4,
            }}>{item.time}</div>
          </div>
        ))}
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: "80px 36px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionBadge>Simple Pricing</SectionBadge>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Cheaper Than Your Cheapest Employee
          </h2>
          <p style={{ color: "#7A8494", fontSize: 16 }}>No contracts. No setup fees. Cancel anytime.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[
            { name: "Starter", price: "$149", per: "/month", audience: "Perfect for single-location trades", features: ["24/7 AI chat widget", "Lead capture + SMS alerts", "Up to 100 chats/month", "Basic analytics dashboard", "Email support"], featured: false },
            { name: "Professional", price: "$249", per: "/month", audience: "For growing businesses", features: ["Everything in Starter", "Unlimited conversations", "CRM integration", "Custom branding", "Priority support"], featured: true },
            { name: "Healthcare", price: "$449", per: "/month", audience: "HIPAA compliant for medical", features: ["Full HIPAA compliance", "Signed BAA included", "Insurance verification", "PHI encryption + audit logs", "Dedicated onboarding"], featured: false },
          ].map((plan, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: 18, position: "relative",
              background: plan.featured ? "linear-gradient(160deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))" : "rgba(255,255,255,0.02)",
              border: `1px solid ${plan.featured ? "rgba(212,168,83,0.25)" : "rgba(255,255,255,0.05)"}`,
            }}>
              {plan.featured && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "4px 16px", borderRadius: 20,
                  background: "linear-gradient(145deg, #D4A853, #B8922E)",
                  color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{plan.name}</h3>
              <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 16px" }}>{plan.audience}</p>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: plan.featured ? "#D4A853" : "#fff" }}>{plan.price}</span>
                <span style={{ color: "#64748B", fontSize: 15 }}>{plan.per}</span>
              </div>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: plan.featured ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "#D4A853" : "#5EEAD4"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ color: "#A0A8B8", fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => setChatOpen(true)} style={{
                width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 12, border: "none",
                background: plan.featured ? "linear-gradient(145deg, #D4A853, #B8922E)" : "rgba(255,255,255,0.06)",
                color: plan.featured ? "#fff" : "#C8CDD5", fontWeight: 700, fontSize: 15,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: plan.featured ? "0 4px 16px rgba(180,130,30,0.25)" : "none",
              }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRIVACY BAR ===== */}
      <section style={{
        padding: "48px 36px", maxWidth: 1000, margin: "0 auto 60px",
        borderRadius: 20, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🔒", text: "Your data is isolated" },
            { icon: "🚫", text: "We never sell your data" },
            { icon: "🛡️", text: "Encrypted at rest + transit" },
            { icon: "🏥", text: "HIPAA compliant" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ color: "#94A3B8", fontSize: 14, fontWeight: 600 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: "32px 36px", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1000, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(145deg, #D4A853, #B8922E)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>T</span>
          </div>
          <span style={{ color: "#4A5060", fontSize: 13 }}>© 2026 TEDZ Integrative Systems LLC. All rights reserved.</span>
        </div>
        <div style={{ color: "#4A5060", fontSize: 13 }}>
          Privacy-first AI for small business.
        </div>
      </footer>

      {/* ===== CHAT WIDGET ===== */}
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}