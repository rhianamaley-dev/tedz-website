"use client";
import { useState, useRef, useEffect } from "react";

/* ────────────────────────────────────────────
   ASSISTANT IDENTITY
   ──────────────────────────────────────────── */
const ASSISTANT = {
  name: "Jordan",
  role: "AI Assistant",
  // Brief first contact (per change request 5).
  greeting: "Hi, I'm Jordan, the AI assistant for TEDZ Integrative Systems. What's your name and best phone number?",
};

/* Quick reply suggestions shown after the greeting.
   Improves first-tap conversion vs. an empty input box. */
const STARTER_QUICK_REPLIES = [
  "I want to capture more leads",
  "How does it work?",
  "I'm just browsing",
];

/* ────────────────────────────────────────────
   ILLUSTRATED AVATAR
   ──────────────────────────────────────────── */
function AssistantAvatar({ size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "#1B2C5C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #F5B82E",
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#F5DEB3" />
        <path d="M14 30 Q14 14 32 14 Q50 14 50 30 L50 38 Q48 32 44 32 L20 32 Q16 32 14 38 Z" fill="#3E2A1F"/>
        <ellipse cx="32" cy="36" rx="13" ry="15" fill="#E8C39E"/>
        <path d="M19 26 Q24 22 32 22 Q40 22 45 26 Q42 28 38 27 Q35 30 32 28 Q29 30 26 27 Q22 28 19 26 Z" fill="#3E2A1F"/>
        <ellipse cx="27" cy="36" rx="1.4" ry="1.8" fill="#1B2C5C"/>
        <ellipse cx="37" cy="36" rx="1.4" ry="1.8" fill="#1B2C5C"/>
        <circle cx="27.4" cy="35.5" r="0.5" fill="#fff"/>
        <circle cx="37.4" cy="35.5" r="0.5" fill="#fff"/>
        <path d="M24 33 Q27 32 30 33" stroke="#3E2A1F" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M34 33 Q37 32 40 33" stroke="#3E2A1F" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M32 39 L31 42 L33 42" stroke="#C4936B" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
        <path d="M28 45 Q32 48 36 45" stroke="#8B4A38" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <path d="M14 64 Q14 52 24 50 Q28 54 32 54 Q36 54 40 50 Q50 52 50 64 Z" fill="#1B2C5C"/>
        <path d="M28 53 L32 56 L36 53" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.5"/>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   HELPER: Render assistant message content with clickable booking links
   ──────────────────────────────────────────── */
function renderMessageContent(content) {
  return content.split(/(https?:\/\/[^\s]+)/g).map((part, idx) => {
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#D49E0F",
            textDecoration: "underline",
            fontWeight: 600,
            display: "inline-block",
            marginTop: 4,
          }}
        >
          Click here to book
        </a>
      );
    }
    return part;
  });
}

/* ────────────────────────────────────────────
   TEDZ CHAT WIDGET
   ──────────────────────────────────────────── */
function ChatWidget({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: ASSISTANT.greeting },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  // Quick replies are shown until the user sends their first message
  const [quickReplies, setQuickReplies] = useState(STARTER_QUICK_REPLIES);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (overrideText) => {
    const msg = (overrideText ?? input).trim();
    if (!msg) return;
    setInput("");
    setQuickReplies([]); // hide chips after first send
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
        }),
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
        aria-label={`Open chat with ${ASSISTANT.name}`}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1B2C5C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <AssistantAvatar size={44} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
            {ASSISTANT.name}
            <span className="online-dot" />
          </div>
          <div style={{ color: "#F5B82E", fontSize: 12 }}>
            {ASSISTANT.role}
          </div>
        </div>
        <button onClick={onToggle} className="chat-close" aria-label="Close chat">×</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            {m.role === "assistant" && (
              <div style={{ marginRight: 8, alignSelf: "flex-end" }}>
                <AssistantAvatar size={28} />
              </div>
            )}
            <div className={`msg-bubble ${m.role}`}>
              {m.role === "assistant" ? renderMessageContent(m.content) : m.content}
            </div>
          </div>
        ))}

        {/* Quick reply chips, shown only before the user has typed anything */}
        {quickReplies.length > 0 && !typing && (
          <div className="quick-reply-row">
            {quickReplies.map((q, i) => (
              <button
                key={i}
                className="quick-reply-chip"
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {typing && (
          <div className="msg-row assistant">
            <div style={{ marginRight: 8, alignSelf: "flex-end" }}>
              <AssistantAvatar size={28} />
            </div>
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
              sendMessage();
            }
          }}
          placeholder={`Message ${ASSISTANT.name}...`}
          className="chat-input"
        />
        <button
          onClick={() => sendMessage()}
          className={`chat-send ${input.trim() ? "active" : ""}`}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#1B2C5C" : "#A0A8B4"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Powered by TEDZ */}
      <div style={{ padding: "6px 14px", background: "#F8FAFB", borderTop: "1px solid #EEF0F4", textAlign: "center" }}>
        <a href="https://tedzintegrativesystems.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94A3B8", fontSize: 11, textDecoration: "none", fontWeight: 500 }}>
          Powered by <span style={{ color: "#F5B82E", fontWeight: 700 }}>TEDZ</span>
        </a>
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

        /* ============ Custom branded scrollbar (item 3) ============ */
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #0D0D1A; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(145deg, #F5B82E, #D49E0F);
          border-radius: 6px;
          border: 3px solid #0D0D1A;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(145deg, #FFD86B, #F5B82E);
        }
        html { scrollbar-color: #F5B82E #0D0D1A; scrollbar-width: thin; }

        /* Chat FAB */
        .chat-fab {
          position: fixed; bottom: 28px; right: 28px; width: 68px; height: 68px;
          border-radius: 50%; background: linear-gradient(145deg, #F5B82E, #D49E0F);
          border: 3px solid rgba(255,255,255,0.15); cursor: pointer;
          box-shadow: 0 8px 32px rgba(212,158,15,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
          animation: pulse-ring 2.5s ease-out infinite;
          transition: transform 0.2s;
        }
        .chat-fab:hover { transform: scale(1.08); }
        @keyframes pulse-ring {
          0% { box-shadow: 0 8px 32px rgba(212,158,15,0.35), 0 0 0 0 rgba(245,184,46,0.4); }
          70% { box-shadow: 0 8px 32px rgba(212,158,15,0.35), 0 0 0 14px rgba(245,184,46,0); }
          100% { box-shadow: 0 8px 32px rgba(212,158,15,0.35), 0 0 0 0 rgba(245,184,46,0); }
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
          background: linear-gradient(135deg, #1B2C5C, #243A78);
          padding: 18px 20px; display: flex; align-items: center;
        }
        .online-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;
          display: inline-block; box-shadow: 0 0 6px rgba(74,222,128,0.5);
        }
        .chat-close {
          background: none; border: none; color: #94A3B8; cursor: pointer;
          font-size: 26px; padding: 4px; line-height: 1; transition: color 0.2s;
        }
        .chat-close:hover { color: #fff; }

        .chat-messages { flex: 1; overflow-y: auto; padding: 18px 16px 8px; background: #F8FAFC; }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .msg-row { display: flex; margin-bottom: 14px; align-items: flex-end; }
        .msg-row.user { justify-content: flex-end; }
        .msg-row.assistant { justify-content: flex-start; }
        .msg-bubble {
          max-width: 78%; padding: 11px 15px; border-radius: 16px;
          font-size: 14px; line-height: 1.55; white-space: pre-line;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #1B2C5C, #243A78);
          color: #fff; border-bottom-right-radius: 4px;
        }
        .msg-bubble.assistant {
          background: #fff; color: #1E293B; border: 1px solid #E8ECF0;
          border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }

        /* Quick reply chips (item 2) */
        .quick-reply-row {
          display: flex; flex-direction: column; gap: 8px;
          margin: 6px 0 14px; padding-left: 36px;
        }
        .quick-reply-chip {
          align-self: flex-start;
          padding: 10px 16px; border-radius: 16px;
          background: #fff; border: 1.5px solid #F5B82E;
          color: #1B2C5C; font-weight: 600; font-size: 13.5px;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.2s; max-width: 78%; text-align: left;
        }
        .quick-reply-chip:hover {
          background: #F5B82E; color: #1B2C5C;
          transform: translateX(2px);
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
        .chat-input:focus { border-color: #F5B82E; }
        .chat-send {
          width: 42px; height: 42px; border-radius: 12px; border: none;
          background: #E8ECF0; cursor: default;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .chat-send.active {
          background: linear-gradient(145deg, #F5B82E, #D49E0F);
          cursor: pointer;
        }

        /* Sections */
        .section-badge {
          display: inline-block; padding: 5px 14px; border-radius: 20px;
          background: rgba(245,184,46,0.1); color: #F5B82E;
          font-size: 12px; font-weight: 700; letter-spacing: 1.2px;
          margin-bottom: 14px; text-transform: uppercase;
          border: 1px solid rgba(245,184,46,0.15);
        }

        .card {
          padding: 32px; border-radius: 18px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }
        .card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(245,184,46,0.2);
        }

        .btn-primary {
          padding: 14px 32px; border-radius: 12px; border: none;
          background: linear-gradient(145deg, #F5B82E, #D49E0F);
          color: #1B2C5C; font-weight: 700; font-size: 16px; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 20px rgba(212,158,15,0.3);
          display: inline-flex; align-items: center; gap: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(212,158,15,0.4); }

        .btn-secondary {
          padding: 14px 32px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
          color: #C8CDD5; font-weight: 600; font-size: 16px;
          font-family: 'Outfit', sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s; cursor: pointer;
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
            background: "#1B2C5C",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(27,44,92,0.4)",
            border: "1.5px solid #F5B82E",
          }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#F5B82E" }}>T</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>TEDZ</span>
            <span style={{ fontWeight: 400, fontSize: 17, color: "#94A3B8", marginLeft: 6 }}>Integrative Systems</span>
          </div>
        </div>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#services" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>Services</a>
          <a href="#how" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>How It Works</a>
          <a href="#contact" style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8 }}>Contact</a>
          <button onClick={() => setChatOpen(true)} className="btn-primary" style={{ padding: "9px 20px", fontSize: 14, marginLeft: 8 }}>
            Get a Demo
          </button>
        </div>
      </nav>

      {/* ===== HERO (Item 1: updated copy) ===== */}
      <section style={{ padding: "100px 36px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,184,46,0.06) 0%, transparent 70%)",
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
              background: "linear-gradient(135deg, #F5B82E, #FFD86B)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>While You Sleep</span>
          </h1>
          <p style={{ fontSize: 19, color: "#8892A0", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.65 }}>
            TEDZ Integrative Systems puts an AI assistant on your website that knows your business inside and out. It will capture leads, book appointments, and answer questions 24/7.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setChatOpen(true)} className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2C5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Try the Live Demo
            </button>
            <a href="#how" className="btn-secondary">See How It Works</a>
          </div>

          <div className="trust-bar" style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            {[
              { num: "24/7", label: "always online" },
              { num: "< 1 hr", label: "setup time" },
              { num: "100%", label: "tailored to you" },
              { num: "2 sec", label: "average response" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#F5B82E" }}>{s.num}</div>
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
              desc: "Your customers need help right now. At 10 PM when the AC breaks, on Sunday when the pipe bursts. Our AI catches those leads while you are off the clock.",
              tagColor: "#F5B82E",
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
          { step: "01", title: "We learn your business", desc: "We pull your website content. Services, pricing, hours, service area. Everything your customers ask about.", time: "10 min" },
          { step: "02", title: "We train the AI on you", desc: "The AI gets loaded with your information. It does not guess. It knows your exact prices, your hours, your service area.", time: "15 min" },
          { step: "03", title: "We install the widget", desc: "One line of code on your website. Works on WordPress, Wix, Squarespace, Shopify. Anything.", time: "5 min" },
          { step: "04", title: "You start getting leads", desc: "Customers chat, the AI answers, and you get a text or email with every qualified lead. Even at 2 AM.", time: "Immediate" },
        ].map((item, i) => (
          <div key={i} className="card" style={{ display: "flex", gap: 24, marginBottom: 16, padding: "24px 28px", alignItems: "flex-start" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(145deg, rgba(245,184,46,0.15), rgba(245,184,46,0.05))",
              border: "1px solid rgba(245,184,46,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#F5B82E", fontSize: 18, fontWeight: 800,
            }}>{item.step}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#fff", fontSize: 17, margin: "0 0 6px", fontWeight: 700 }}>{item.title}</h4>
              <p style={{ color: "#8892A0", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
            <div style={{
              padding: "6px 12px", borderRadius: 8, background: "rgba(245,184,46,0.08)",
              color: "#F5B82E", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
            }}>{item.time}</div>
          </div>
        ))}
      </section>

      {/* ===== CONTACT / GET A QUOTE (Items 6 + 7: pricing replaced with quote section) ===== */}
      <section id="contact" style={{ padding: "80px 36px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="section-badge">Get a Quote</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: -1.5 }}>
            An always-on teammate for your business.
          </h2>
          <p style={{ color: "#7A8494", fontSize: 16, maxWidth: 580, margin: "0 auto" }}>
            Every business is different, so we tailor the platform to fit yours. Tell us what you need and we will build a quote that works for you.
          </p>
        </div>

        <div className="card" style={{
          padding: "44px 36px", textAlign: "center",
          background: "linear-gradient(160deg, rgba(245,184,46,0.08), rgba(245,184,46,0.02))",
          borderColor: "rgba(245,184,46,0.25)",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24, marginBottom: 32,
          }}>
            {[
              { num: "1", title: "Tell us about your business", desc: "What you do, who you serve, where you are." },
              { num: "2", title: "We design the AI agent", desc: "Trained on your services, your pricing, your hours." },
              { num: "3", title: "You get a custom quote", desc: "No hidden fees. No long contracts. Cancel anytime." },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "left" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(245,184,46,0.12)", border: "1px solid rgba(245,184,46,0.25)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: "#F5B82E", fontWeight: 800, fontSize: 14, marginBottom: 12,
                }}>{step.num}</div>
                <h4 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{step.title}</h4>
                <p style={{ color: "#8892A0", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setChatOpen(true)} className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2C5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Start the Conversation
            </button>
            <a href="https://cal.com/rhiana-maley-zd0c7u/service-appointment" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Book a 15-min Call
            </a>
          </div>
        </div>
      </section>

      {/* ===== PRIVACY BAR (Item 8: simplified) ===== */}
      <section style={{
        padding: "48px 36px", maxWidth: 1000, margin: "0 auto 60px",
        borderRadius: 20, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🔒", text: "Your data stays yours" },
            { icon: "🚫", text: "We never sell your info" },
            { icon: "🛡️", text: "Secure end to end" },
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
            background: "#1B2C5C",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid #F5B82E",
          }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#F5B82E" }}>T</span>
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