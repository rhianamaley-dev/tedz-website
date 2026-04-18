export const metadata = {
  title: "TEDZ Integrative Systems | AI Chat for Small Business",
  description:
    "AI-powered chat agents that capture leads 24/7 for HVAC, plumbing, roofing, dental, and healthcare businesses. Privacy-first. Live in under an hour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}