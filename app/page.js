"use client";
import { useState, useRef, useEffect } from "react";

/* ────────────────────────────────────────────
   DEMO CHAT WIDGET
   In production you'd call your Claude API backend.
   For now this uses canned responses so the demo works
   without any backend at all.
   ──────────────────────────────────────────── */

const DEMO_RESPONSES = [
  { triggers: ["price", "cost", "how much", "pricing", "quote", "estimate", "charge"], response: "Great question! Pricing depends on your business type and what features you need. Our plans start at $149/month for trades like HVAC and plumbing, and $449/month for healthcare with HIPAA compliance.\n\nWant me to set up a free demo customized for your business? I just need your name and what kind of business you run!" },
  { triggers: ["how", "work", "what do", "explain", "tell me"], response: "Here's the simple version — we put an AI chat widget on your website that knows everything about YOUR business. It answers customer questions 24/7, captures leads, and sends them straight to your phone.\n\nThe best part? It takes less than an hour to set up. Want to see a live demo for your business?" },
  { triggers: ["hvac", "plumb", "roof", "contract", "electric", "trade"], response: "We work with a ton of trades businesses! HVAC, plumbing, roofing, electrical, general contractors — you name it.\n\nOne HVAC company we work with caught 12 extra leads in their first month just from after-hours chats. That's over $60K in potential revenue.\n\nWant me to build a free demo for your company?" },
  { triggers: ["dental", "doctor", "clinic", "health", "medical", "derm", "laser", "patient"], response: "We love working with healthcare businesses! Our healthcare plan includes full HIPAA compliance, insurance verification, and appointment booking.\n\nThe AI never gives medical advice — it just answers the routine questions your front desk gets all day (hours, insurance, booking) so your staff can focus on patients.\n\nWant to see how it'd work for your practice?" },
  { triggers: ["demo", "try", "test", "see", "show"], response: "Absolutely! Here's how our demo works — I'll pull your website info, load it into the AI, and by tomorrow you'll have a working chat that already knows your services, pricing, and hours.\n\nJust drop your website URL and your name, and I'll get it set up!" },
  { triggers: ["privacy", "secure", "data", "safe", "hipaa"], response: "Security is our #1 thing. Every client's data is completely isolated — your info never touches another business. We encrypt everything, never use your data to train models for anyone else, and you can delete your data anytime.\n\nFor healthcare clients, we're fully HIPAA compliant with signed BAAs and audit logging." },
  { triggers: ["hi", "hello", "hey", "sup", "yo", "start", "help"], response: "Hey there! Welcome to TEDZ Integrative Systems!\n\nI'm here to show you how our AI chat widget can capture more leads for your business — 24/7, even while you sleep.\n\nAre you a trades business (HVAC, plumbing, roofing) or in healthcare (dental, clinic, derm)?" },
  { triggers: ["setup", "install", "hard", "complicated", "technical", "code"], response: "Super easy — it's literally one line of code pasted into your website. Takes about 5 minutes.\n\nWorks on WordPress, Wix, Squarespace, or basically any platform. We handle all the technical stuff. You don't need to be technical at all.\n\nWant me to walk you through it?" },
];

function getResponse(msg) {
  const lower = msg.toLowerCase();
  for (const item of DEMO_RESPONSES) {
    if (item.triggers.some((t) => lower.includes(t))) return item.response;
  }
  return "Thanks for reaching out! I'd love to help you capture more leads with AI.\n\nCould you tell me what kind of business you run? That way I can show you exactly how our chat widget would work for your industry!";
}

function ChatWidget({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! I'm the AI assistant for TEDZ Integrative Systems. I can show you how we help businesses capture more leads 24/7.\n\nWhat kind of business do you run?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setTyping(false);
      setMessages((p) => [...p, { role: "assistant", content: data.reply || "Sorry, something went wrong. Please try again." }]);
    } catch (error) {
      setTyping(false);
      setMessages((p) => [...p, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={onToggle}
        className="chat-fab"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">T</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>TEDZ Integrative Systems</div>
          <div style={{ color: "#D4A853", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="online-dot" />
            Online — replies instantly
          </div>
        </div>
        <button onClick={onToggle} className="chat-close">×</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            <div className={`msg-bubble ${m.role}`}>{m.content}</div>
          </div>
        ))}
        {typing && (
          <div className="msg-row assistant">
            <div className="msg-bubble assistant" style={{ display: "flex", gap: 5, padding: "12px 20px" }}>
              <span className="dot" style={{ animationDelay: "0s" }} />
              <span className="dot" style={{ animationDelay: "0.15s" }} />
              <span className="dot" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about our AI chat service..."
          className="chat-input"
        />
        <button onClick={send} className={`chat-send ${input.trim() ? "active" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#A0A8B4"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────── */

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; background: #0D0D1A; color: #C8CDD5; }
        a { text-decoration: none; color: inherit; }

        /* Chat FAB */
        .chat-fab {
          position: fixed; bottom: 28px; right: 28px; width: 68px; height: 68px;
          border-radius: 50%; background: linear-gradient(145deg, #D4A853, #B8922E);
          border: 3px solid rgba(255,255,255,0.15); cursor: pointer;
          box-shadow: 0 8px 32px rgba(180,130,30,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
          animation: pulse-ring 2.5s ease-out infinite;
          transition: transform 0.2s;
        }
        .chat-fab:hover { transform: scale(1.08); }
        @keyframes pulse-ring {
          0% { box-shadow: 0 8px 32px rgba(180,130,30,0.35), 0 0 0 0 rgba(212,168,83,0.4); }
          70% { box-shadow: 0 8px 32px rgba(180,130,30,0.35), 0 0 0 14px rgba(212,168,83,0); }
          100% { box-shadow: 0 8px 32px rgba(180,130,30,0.35), 0 0 0 0 rgba(212,168,83,0); }
        }

        /* Chat Window */
        .chat-window {
          position: fixed; bottom: 28px; right: 28px; width: 390px; height: 540px;
          border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 9999; background: #fff;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) {
          .chat-window { width: calc(100vw - 16px); height: calc(100vh - 80px); bottom: 8px; right: 8px; border-radius: 16px; }
        }

        .chat-header {
          background: linear-gradient(135deg, #1A1A2E, #16213E);
          padding: 18px 20px; display: flex; align-items: center; gap: 14;
        }
        .chat-avatar {
          width: 44px; height: 44px; border-radius: 14px;
          background: linear-gradient(145deg, #D4A853, #B8922E);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .online-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;
          display: inline-block; box-shadow: 0 0 6px rgba(74,222,128,0.5);
        }
        .chat-close {
          background: none; border: none; color: #64748B; cursor: pointer;
          font-size: 26px; padding: 4px; line-height: 1; transition: color 0.2s;
        }
        .chat-close:hover { color: #fff; }

        .chat-messages { flex: 1; overflow-y: auto; padding: 18px 16px 8px; background: #F8FAFC; }
        .msg-row { display: flex; margin-bottom: 14px; }
        .msg-row.user { justify-content: flex-end; }
        .msg-row.assistant { justify-content: flex-start; }
        .msg-bubble {
          max-width: 82%; padding: 11px 15px; border-radius: 16px;
          font-size: 14px; line-height: 1.55; white-space: pre-line;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #1A1A2E, #16213E);
          color: #fff; border-bottom-right-radius: 4px;
        }
        .msg-bubble.assistant {
          background: #fff; color: #1E293B; border: 1px solid #E8ECF0;
          border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }

        .dot {
          width: 7px; height: 7px; border-radius: 50%; background: #B0B8C4;
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

        .chat-input-bar {
          padding: 12px 16px; border-top: 1px solid #EEF0F4; background: #fff;
          display: flex; gap: 10px;
        }
        .chat-input {
          flex: 1; padding: 11px 15px; border-radius: 12px; border: 1px solid #E2E5EA;
          font-size: 14px; outline: none; font-family: 'Outfit', sans-serif;
          transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: #D4A853; }
        .chat-send {
          width: 42px; height: 42px; border-radius: 12px; border: none;
          background: #E8ECF0; cursor: default;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .chat-send.active {
          background: linear-gradient(145deg, #D4A853, #B8922E);
          cursor: pointer;
        }

        /* Sections */
        .section-badge {
          display: inline-block; padding: 5px 14px; border-radius: 20px;
          background: rgba(212,168,83,0.1); color: #D4A853;
          font-size: 12px; font-weight: 700; letter-spacing: 1.2px;
          margin-bottom: 14px; text-transform: uppercase;
          border: 1px solid rgba(212,168,83,0.15);
        }

        .card {
          padding: 32px; border-radius: 18px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }
        .card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(212,168,83,0.2);
        }

        .btn-primary {
          padding: 14px 32px; border-radius: 12px; border: none;
          background: linear-gradient(145deg, #D4A853, #B8922E);
          color: #fff; font-weight: 700; font-size: 16px; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 20px rgba(180,130,30,0.3);
          display: inline-flex; align-items: center; gap: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(180,130,30,0.4); }

        .btn-secondary {
          padding: 14px 32px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
          color: #C8CDD5; font-weight: 600; font-size: 16px;
          font-family: 'Outfit', sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.06); }

        .tag {
          padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
          display: inline-block;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 36px !important; }
          .trust-bar { gap: 20px !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* ===== NAV ===== */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 36px", position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,13,26,0.92)", backdropFilter: "blur(16px)",
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
            <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>TEDZ</span>
            <span style={{ fontWeight: 400, fontSize: 17, color: "#94A3B8", marginLeft: 6 }}>Integrative Systems</span>
          </div>
        </div>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#services" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>Services</a>
          <a href="#pricing" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>Pricing</a>
          <a href="#how" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>How It Works</a>
          <button onClick={() => setChatOpen(true)} className="btn-primary" style={{ padding: "9px 20px", fontSize: 14, marginLeft: 8 }}>
            Get a Demo
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ padding: "100px 36px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div className="section-badge">AI-Powered Lead Capture</div>
          <h1 className="hero-title" style={{
            fontSize: 58, fontWeight: 900, color: "#fff", lineHeight: 1.1,
            margin: "0 0 22px", letterSpacing: -2.5,
          }}>
            Stop Losing Leads<br />
            <span style={{
              background: "linear-gradient(135deg, #D4A853, #F0D68A)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>While You Sleep</span>
          </h1>
          <p style={{ fontSize: 19, color: "#8892A0", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65 }}>
            TEDZ Integrative Systems puts an AI chat agent on your website that knows your business inside and out.
            It captures leads, books appointments, and answers questions — 24/7.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setChatOpen(true)} className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Try the Live Demo
            </button>
            <a href="#how" className="btn-secondary">See How It Works →</a>
          </div>

          <div className="trust-bar" style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
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
          <div className="section-badge">What We Do</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Two Industries. One Platform.
          </h2>
          <p style={{ color: "#7A8494", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Whether you&apos;re fixing ACs or fixing smiles, our AI handles the front door.
          </p>
        </div>

        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            {
              title: "Trades & Home Services", icon: "🔧",
              items: ["HVAC Companies", "Plumbers", "Roofers", "Electricians", "General Contractors"],
              desc: "Your customers need help NOW — at 10 PM when the AC breaks, on Sunday when the pipe bursts. Our AI catches those leads while you're off the clock.",
              tagColor: "#D4A853",
            },
            {
              title: "Healthcare & Medical", icon: "🏥",
              items: ["Dental Offices", "Dermatologists", "Med Spas & Laser", "Clinics", "Chiropractors"],
              desc: "HIPAA compliant. Handles insurance questions, books appointments, and never gives medical advice. Your front desk will thank you.",
              tagColor: "#5EEAD4",
            },
          ].map((card, i) => (
            <div key={i} className="card">
              <div style={{ fontSize: 36, marginBottom: 14 }}>{card.icon}</div>
              <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>{card.title}</h3>
              <p style={{ color: "#8892A0", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px" }}>{card.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {card.items.map((item, j) => (
                  <span key={j} className="tag" style={{
                    background: card.tagColor + "12", color: card.tagColor,
                    border: `1px solid ${card.tagColor}20`,
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
          <div className="section-badge">How It Works</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Live in Under an Hour
          </h2>
        </div>

        {[
          { step: "01", title: "We learn your business", desc: "We pull your website content — services, pricing, hours, service area. Everything your customers ask about.", time: "10 min" },
          { step: "02", title: "We train the AI on you", desc: "The AI gets loaded with YOUR information. It doesn't guess — it knows your exact prices, your hours, your service area.", time: "15 min" },
          { step: "03", title: "We install the widget", desc: "One line of code on your website. Works on WordPress, Wix, Squarespace, Shopify — anything.", time: "5 min" },
          { step: "04", title: "You start getting leads", desc: "Customers chat, the AI answers, and you get a text or email with every qualified lead. Even at 2 AM.", time: "Immediate" },
        ].map((item, i) => (
          <div key={i} className="card" style={{ display: "flex", gap: 24, marginBottom: 16, padding: "24px 28px", alignItems: "flex-start" }}>
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
              color: "#D4A853", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
            }}>{item.time}</div>
          </div>
        ))}
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: "80px 36px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-badge">Simple Pricing</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            Cheaper Than Your Cheapest Employee
          </h2>
          <p style={{ color: "#7A8494", fontSize: 16 }}>No contracts. No setup fees. Cancel anytime.</p>
        </div>

        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[
            { name: "Starter", price: "$149", audience: "Single-location trades", features: ["24/7 AI chat widget", "Lead capture + SMS alerts", "Up to 100 chats/month", "Basic analytics", "Email support"], featured: false },
            { name: "Professional", price: "$249", audience: "Growing businesses", features: ["Everything in Starter", "Unlimited conversations", "CRM integration", "Custom branding", "Priority support"], featured: true },
            { name: "Healthcare", price: "$449", audience: "HIPAA compliant", features: ["Full HIPAA compliance", "Signed BAA included", "Insurance verification", "PHI encryption + audit logs", "Dedicated onboarding"], featured: false },
          ].map((plan, i) => (
            <div key={i} className="card" style={{
              position: "relative",
              background: plan.featured ? "linear-gradient(160deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))" : undefined,
              borderColor: plan.featured ? "rgba(212,168,83,0.25)" : undefined,
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
                <span style={{ color: "#64748B", fontSize: 15 }}>/month</span>
              </div>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: plan.featured ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "#D4A853" : "#5EEAD4"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ color: "#A0A8B8", fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => setChatOpen(true)} style={{
                width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 12, border: "none",
                background: plan.featured ? "linear-gradient(145deg, #D4A853, #B8922E)" : "rgba(255,255,255,0.06)",
                color: plan.featured ? "#fff" : "#C8CDD5", fontWeight: 700, fontSize: 15,
                cursor: "pointer", fontFamily: "'Outfit', sans-serif",
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
        maxWidth: 1000, margin: "0 auto", flexWrap: "wrap", gap: 16,
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
        <div style={{ color: "#4A5060", fontSize: 13 }}>Privacy-first AI for small business.</div>
      </footer>

      {/* ===== CHAT WIDGET ===== */}
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </>
  );
}