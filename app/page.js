"use client";

export default function Home() {
  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      background: "#0D0D1A",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "#fff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      <div style={{
        width: 60, height: 60, borderRadius: 16,
        background: "linear-gradient(145deg, #D4A853, #B8922E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, boxShadow: "0 4px 20px rgba(180,130,30,0.3)",
      }}>
        <span style={{ fontSize: 28, fontWeight: 900 }}>T</span>
      </div>
      
      <h1 style={{
        fontSize: 42, fontWeight: 800, margin: "0 0 12px",
        letterSpacing: -1.5, textAlign: "center",
      }}>
        TEDZ Integrative Systems
      </h1>
      
      <p style={{
        color: "#94A3B8", fontSize: 18, margin: "0 0 32px",
        textAlign: "center", maxWidth: 400,
      }}>
        Something big is coming. We're putting the finishing touches on our AI-powered lead capture platform.
      </p>
      
      <div style={{
        padding: "12px 28px", borderRadius: 12,
        background: "linear-gradient(145deg, #D4A853, #B8922E)",
        color: "#fff", fontWeight: 700, fontSize: 15,
      }}>
        Launching Soon
      </div>
      
      <p style={{
        color: "#4A5060", fontSize: 14, marginTop: 40,
      }}>
        © 2026 TEDZ Integrative Systems LLC
      </p>
    </div>
  );
}