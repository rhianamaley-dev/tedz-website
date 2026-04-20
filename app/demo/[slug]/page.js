"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

// ============================================================
// CLIENT DATABASE
// Add new clients here to create instant demos
// URL: tedzintegrativesystems.com/demo/[client-key]
// ============================================================
const CLIENTS = {
  "comfort-pro-hvac": {
    name: "Comfort Pro HVAC",
    tagline: "Dallas-Fort Worth's Trusted Heating & Cooling Experts",
    phone: "(972) 555-0147",
    industry: "HVAC",
    color: "#1E6B5A",
    colorLight: "#2EC4A0",
    colorDark: "#0B3D2E",
    logo: "❄️",
    hours: "Mon-Fri 7AM-7PM, Sat 8AM-4PM, 24/7 Emergency",
    address: "4521 Commerce St, Dallas, TX 75201",
    rating: "4.8 stars on Google (340+ reviews)",
    services: ["AC Repair & Installation", "Furnace Repair", "Duct Cleaning", "Maintenance Plans", "Indoor Air Quality", "24/7 Emergency Service"],
    details: `Company: Comfort Pro HVAC
Phone: (972) 555-0147
Hours: Mon-Fri 7AM-7PM, Sat 8AM-4PM, 24/7 Emergency
Service Area: Dallas, Fort Worth, Plano, Frisco, McKinney, Allen, Richardson, Garland
Rating: 4.8 stars on Google (340+ reviews)
Financing: 0% financing for 12 months on systems over $3,000

Services & Pricing:
- AC Tune-Up: $89
- Diagnostic Fee: $79 (waived with repair)
- Duct Cleaning: Starting at $299
- New AC System: $4,500 - $12,000 depending on size
- Furnace Install: $3,200 - $8,500
- Maintenance Plan: $14.99/month (includes 2 tune-ups per year, 15% off repairs)`,
  },

  "bright-smile-dental": {
    name: "Bright Smile Dental",
    tagline: "Family & Cosmetic Dentistry in Plano, TX",
    phone: "(469) 555-2200",
    industry: "Dental",
    color: "#2563EB",
    colorLight: "#60A5FA",
    colorDark: "#1E3A5F",
    logo: "🦷",
    hours: "Mon-Thu 8AM-5PM, Fri 8AM-2PM, Sat by appointment",
    address: "789 Legacy Dr, Suite 200, Plano, TX 75024",
    rating: "4.9 stars on Google (280+ reviews)",
    services: ["Cleanings & Exams", "Teeth Whitening", "Invisalign", "Dental Implants", "Crowns & Veneers", "Emergency Dental"],
    details: `Company: Bright Smile Dental
Phone: (469) 555-2200
Hours: Mon-Thu 8AM-5PM, Fri 8AM-2PM, Sat by appointment
Location: 789 Legacy Dr, Suite 200, Plano, TX 75024
Rating: 4.9 stars on Google (280+ reviews)

Services & Pricing:
- Cleaning & Exam: $150 (often covered by insurance)
- Teeth Whitening: $299
- Invisalign: Starting at $3,500
- Dental Implants: $2,500 - $4,500 per tooth
- New Patient Special: $99 (comprehensive exam, full X-rays, cleaning)

Insurance: Delta Dental, Cigna, Aetna, Blue Cross Blue Shield, United Healthcare, MetLife
Payment Plans: Available through CareCredit`,
  },

  "lone-star-plumbing": {
    name: "Lone Star Plumbing",
    tagline: "Fast, Reliable Plumbing for DFW Homes",
    phone: "(214) 555-7890",
    industry: "Plumbing",
    color: "#B45309",
    colorLight: "#F59E0B",
    colorDark: "#78350F",
    logo: "🔧",
    hours: "Mon-Sat 7AM-6PM, 24/7 Emergency",
    address: "2100 Main St, Fort Worth, TX 76102",
    rating: "4.7 stars on Google (210+ reviews)",
    services: ["Drain Cleaning", "Water Heater Repair", "Leak Detection", "Pipe Repair", "Sewer Line Service", "24/7 Emergency"],
    details: `Company: Lone Star Plumbing
Phone: (214) 555-7890
Hours: Mon-Sat 7AM-6PM, 24/7 Emergency
Service Area: Fort Worth, Arlington, Mansfield, Burleson, Weatherford
Rating: 4.7 stars on Google (210+ reviews)

Services & Pricing:
- Drain Cleaning: Starting at $99
- Water Heater Repair: $150 - $500
- Water Heater Replacement: $1,200 - $3,500
- Leak Detection: $150
- Pipe Repair: Starting at $200
- Sewer Line Camera Inspection: $199
- Emergency Call-Out Fee: $99 (applied to repair cost)

Financing: Available on jobs over $1,000`,
  },
};

// ============================================================
// CHAT WIDGET FOR DEMOS
// ============================================================
function DemoChat({ client, isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi there! Welcome to ${client.name}. I can help you with pricing, scheduling, or any questions about our services. What can I help you with?`,
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
        body: JSON.stringify({
          message: msg,
          businessInfo: {
            name: client.name,
            details: client.details,
            prompt:`You are the professional chat assistant for ${client.name}. ${client.tagline}. Phone: ${client.phone}. Hours: ${client.hours}. Be professional and conversational. NEVER use markdown formatting or emojis. Write in plain text only.`,
          },
        }),
      });
      const data = await res.json();
      setTyping(false);
      setMessages((p) => [
        ...p,
        { role: "assistant", content: data.reply || "Sorry, something went wrong." },
      ]);
    } catch {
      setTyping(false);
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={onToggle}
        style={{
          position: "fixed", bottom: 24, right: 24, width: 64, height: 64,
          borderRadius: "50%", background: client.color, border: "3px solid rgba(255,255,255,0.2)",
          cursor: "pointer", boxShadow: `0 6px 24px ${client.color}55`,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );

  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24, width: 380, height: 520,
        borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 16px 48px rgba(0,0,0,0.2)", zIndex: 9999, background: "#fff",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ background: client.colorDark, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: client.color,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{client.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{client.name}</div>
          <div style={{ color: client.colorLight, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
            Online — replies instantly
          </div>
        </div>
        <button onClick={onToggle} style={{ background: "none", border: "none", color: "#ffffff80", cursor: "pointer", fontSize: 24, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", background: "#F8FAFB" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line",
              ...(m.role === "user"
                ? { background: client.color, color: "#fff", borderBottomRightRadius: 4 }
                : { background: "#fff", color: "#1E293B", border: "1px solid #E5E9ED", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }),
            }}>{m.content}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", marginBottom: 12 }}>
            <div style={{ padding: "12px 18px", borderRadius: 14, background: "#fff", border: "1px solid #E5E9ED", display: "flex", gap: 5 }}>
              {[0, 1, 2].map((j) => (
                <span key={j} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#B0B8C4",
                  animation: `demoDot 1.2s ease ${j * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid #EDF0F3", background: "#fff", display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E5EA",
            fontSize: 14, outline: "none", fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = client.color)}
          onBlur={(e) => (e.target.style.borderColor = "#E2E5EA")}
        />
        <button onClick={send} style={{
          width: 40, height: 40, borderRadius: 10, border: "none", flexShrink: 0,
          background: input.trim() ? client.color : "#E8ECF0",
          cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#A0A8B4"} strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <style>{`@keyframes demoDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}

// ============================================================
// DEMO PAGE
// ============================================================
export default function DemoPage() {
  const params = useParams();
  const slug = params.slug;
  const client = CLIENTS[slug];
  const [chatOpen, setChatOpen] = useState(false);

  if (!client) {
    return (
      <div style={{
        fontFamily: "'Outfit', sans-serif", background: "#0D0D1A", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#fff",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Demo Not Found</h1>
        <p style={{ color: "#94A3B8", fontSize: 16, marginBottom: 24 }}>
          The demo page for "{slug}" doesn't exist yet.
        </p>
        <a href="/" style={{
          padding: "12px 28px", borderRadius: 12, background: "linear-gradient(145deg, #D4A853, #B8922E)",
          color: "#fff", fontWeight: 700, textDecoration: "none",
        }}>Back to TEDZ Home</a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#FAFBFC", minHeight: "100vh", color: "#1E293B" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* TEDZ demo banner */}
      <div style={{
        background: "#0D0D1A", padding: "8px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#94A3B8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: "linear-gradient(145deg, #D4A853, #B8922E)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>T</span>
          </div>
          <span>
            <strong style={{ color: "#D4A853" }}>TEDZ Demo</strong> — AI chat preview for{" "}
            <strong style={{ color: "#fff" }}>{client.name}</strong>
          </span>
        </div>
        <a href="/" style={{
          padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)", color: "#94A3B8", fontSize: 12, fontWeight: 600,
          textDecoration: "none",
        }}>
          ← Back to TEDZ
        </a>
      </div>

      {/* Client nav */}
      <nav style={{
        background: client.colorDark, padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{client.logo}</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{client.name}</div>
            <div style={{ color: client.colorLight, fontSize: 12 }}>{client.tagline}</div>
          </div>
        </div>
        <div style={{
          padding: "8px 18px", borderRadius: 8, background: client.colorLight, color: "#fff",
          fontWeight: 700, fontSize: 14,
        }}>
          Call {client.phone}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: "60px 32px", textAlign: "center",
        background: `linear-gradient(135deg, ${client.colorDark}, ${client.color})`,
      }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", margin: "0 0 14px" }}>
          {client.tagline}
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", maxWidth: 500, margin: "0 auto 28px" }}>
          {client.rating} — Call us at {client.phone}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setChatOpen(true)} style={{
            padding: "12px 28px", borderRadius: 10, background: "#fff", color: client.colorDark,
            fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>
            Chat With Us Now
          </button>
          <div style={{
            padding: "12px 28px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.3)",
            color: "#fff", fontWeight: 600, fontSize: 15,
          }}>
            View Services
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: "48px 32px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, margin: "0 0 32px", color: client.colorDark }}>
          Our Services
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {client.services.map((svc, i) => (
            <div key={i} style={{
              padding: "20px 22px", borderRadius: 12, background: "#fff",
              border: "1px solid #E8ECF0", textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: client.colorDark }}>{svc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Info bar */}
      <section style={{
        padding: "28px 32px", background: "#fff",
        borderTop: "1px solid #E8ECF0", borderBottom: "1px solid #E8ECF0",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
          {[
            { label: "Hours", value: client.hours },
            { label: "Phone", value: client.phone },
            { label: "Location", value: client.address },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: client.colorDark, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Try the chat CTA */}
      <section style={{ padding: "48px 32px", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto", padding: "32px 28px", borderRadius: 16,
          background: "#0D0D1A", color: "#fff",
        }}>
          <div style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 12,
            background: "rgba(212,168,83,0.15)", color: "#D4A853",
            fontSize: 11, fontWeight: 700, marginBottom: 12,
          }}>
            POWERED BY TEDZ
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
            Try the AI Chat Right Now
          </h3>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 20px" }}>
            Click the chat bubble in the bottom right. Ask about pricing, hours, services — it already knows everything about {client.name}.
          </p>
          <button onClick={() => setChatOpen(true)} style={{
            padding: "12px 28px", borderRadius: 10,
            background: "linear-gradient(145deg, #D4A853, #B8922E)",
            color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 15,
          }}>
            Open Chat
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "20px 32px", borderTop: "1px solid #E8ECF0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 900, margin: "0 auto", fontSize: 13, color: "#94A3B8",
      }}>
        <span>© 2026 {client.name}</span>
        <span>AI Chat by <a href="/" style={{ color: "#D4A853", textDecoration: "none", fontWeight: 600 }}>TEDZ Integrative Systems</a></span>
      </footer>

      {/* Chat widget */}
      <DemoChat client={client} isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
