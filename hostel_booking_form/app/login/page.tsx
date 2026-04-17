"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ChevronRight,
  Shield,
  ClipboardList,
  CheckCircle,
  ArrowRight,
  Building2,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Hostel Allocation Requests",
    desc: "Submit and track room allocation requests digitally",
  },
  {
    icon: CheckCircle,
    title: "Approval Workflow",
    desc: "Streamlined JA → AR → Chief Warden pipeline",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Instant updates on application status changes",
  },
  {
    icon: Shield,
    title: "Secure & Auditable",
    desc: "Role-based access with complete audit trails",
  },
];

const announcements = [
  { text: "Hostel allocation round is now open", date: "Apr 15, 2026" },
  { text: "Deadline for applications: 20 April 2026", date: "Apr 20, 2026" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <header
        style={{
          background: "#0B3D91",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0.75rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "white",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Image src="/iitropar logo.png" alt="IIT Ropar" fill style={{ objectFit: "contain", padding: 4 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "white", letterSpacing: "0.08em", lineHeight: 1.2 }}>
              IIT ROPAR
            </div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              Administrative ERP
            </div>
          </div>
        </div>

        {/* Right: Nav links */}
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {["Help", "Contact", "About"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      {/* ── Main Split Layout ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: "55%",
            background: "linear-gradient(145deg, #082A63 0%, #0B3D91 50%, #1458C8 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "3rem 3.5rem",
            position: "relative",
            overflow: "hidden",
            minHeight: "calc(100vh - 60px)",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(244,163,0,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", right: "10%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(244,163,0,0.15)", border: "1px solid rgba(244,163,0,0.35)", borderRadius: 999, padding: "0.3rem 0.9rem", marginBottom: "1.75rem", width: "fit-content" }}>
            <Building2 size={13} color="#F4A300" />
            <span style={{ color: "#F4A300", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Official Portal · IIT Ropar
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 800, lineHeight: 1.25, marginBottom: "1rem", maxWidth: 480 }}>
            Welcome to IIT Ropar<br />
            <span style={{ color: "#F4A300" }}>Hostel Management</span> Portal
          </h1>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 440 }}>
            Manage hostel accommodation, applications, and approvals digitally — fast, transparent, and paperless.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Icon size={17} color="#F4A300" />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.15rem" }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Announcements */}
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
              <Bell size={12} color="#F4A300" />
              <span style={{ color: "#F4A300", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>Announcements</span>
            </div>
            {announcements.map((a) => (
              <div key={a.text} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ChevronRight size={11} color="#F4A300" />
                  {a.text}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", flexShrink: 0, marginLeft: "0.5rem" }}>{a.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#F5F7FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 2.5rem",
          }}
        >
          {/* Login Card */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              boxShadow: "0 4px 40px rgba(11,61,145,0.10), 0 1px 6px rgba(0,0,0,0.06)",
              padding: "2.5rem 2.25rem",
              width: "100%",
              maxWidth: 420,
            }}
          >
            {/* Card Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} color="#0B3D91" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#111" }}>Sign In to Continue</div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "0.1rem" }}>Secured by IIT Ropar ERP</div>
              </div>
            </div>

            <div style={{ height: 1, background: "#F0F0F0", margin: "1.25rem 0" }} />

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: "#FFF1F1",
                  border: "1px solid #FECACA",
                  borderLeft: "4px solid #EF4444",
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "#B91C1C", fontWeight: 600 }}>⚠ {error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                  Institute Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    required
                    type="email"
                    placeholder="yourname@iitrpr.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem 0.65rem 2.25rem",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      color: "#111",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                      background: "#FAFAFA",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0B3D91";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)";
                      e.currentTarget.style.background = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background = "#FAFAFA";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 2.5rem 0.65rem 2.25rem",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      color: "#111",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                      background: "#FAFAFA",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0B3D91";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)";
                      e.currentTarget.style.background = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background = "#FAFAFA";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2, display: "flex" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#0B3D91", width: 14, height: 14, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500 }}>Remember Me</span>
                </label>
                <a href="#" style={{ fontSize: "0.75rem", color: "#0B3D91", fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: loading ? "#6B8FC7" : "linear-gradient(135deg, #0B3D91, #1458C8)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(11,61,145,0.35)",
                  marginTop: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #082A63, #0B3D91)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(11,61,145,0.45)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #0B3D91, #1458C8)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(11,61,145,0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", color: "#9CA3AF", lineHeight: 1.6 }}>
                Access restricted to IIT Ropar faculty, staff &amp; students.<br />
                Use your <strong style={{ color: "#6B7280" }}>@iitrpr.ac.in</strong> credentials to sign in.
              </p>
            </div>
          </div>

          {/* Below card note */}
          <p style={{ marginTop: "1.25rem", fontSize: "0.7rem", color: "#9CA3AF", textAlign: "center" }}>
            © 2026 Indian Institute of Technology Ropar · v2.1.0
          </p>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
