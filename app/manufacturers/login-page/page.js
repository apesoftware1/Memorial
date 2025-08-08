"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  border: "1px solid #e0e0e0",
  padding: 36,
  minWidth: 340,
  maxWidth: 400,
  width: "100%",
  position: "relative",
  animation: "fadeScaleIn 0.5s cubic-bezier(.4,0,.2,1)"
};

const inputStyle = {
  width: "100%",
  padding: 10,
  border: "1px solid #b5c9e3",
  borderRadius: 4,
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: 2,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  background: '#f8fafc',
};

const buttonStyle = (loading) => ({
  width: 110,
  background: loading ? '#90caf9' : "#1565c0",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  padding: "10px 0",
  border: "none",
  borderRadius: 4,
  cursor: loading ? 'not-allowed' : "pointer",
  marginTop: 4,
  boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
  transition: 'background 0.2s, box-shadow 0.2s',
  outline: 'none',
});

const adminButtonStyle = {
  width: "100%",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  padding: "12px 0",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  marginTop: 12,
  boxShadow: '0 2px 8px rgba(220,38,38,0.08)',
  transition: 'background 0.2s, box-shadow 0.2s',
  outline: 'none',
};

// Add keyframes for fade/scale in
if (typeof window !== 'undefined' && !document.getElementById('login-anim-style')) {
  const style = document.createElement('style');
  style.id = 'login-anim-style';
  style.innerHTML = `
    @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .input-focus:focus { border-color: #1565c0 !important; box-shadow: 0 0 0 2px #90caf9 !important; background: #fff !important; }
    .login-link:hover { color: #003c5a !important; text-decoration: underline; }
    .login-btn:hover:not(:disabled) { background: #003c5a !important; }
    .admin-btn:hover { background: #b91c1c !important; }
  `;
  document.head.appendChild(style);
}

// Admin email addresses that should have access to the dashboard
const ADMIN_EMAILS = [
  'regan@tombstonesfinder.com',
  'admin@tombstonesfinder.com',
  // Add any other admin emails here
];

export default function ManufacturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result.ok) {
        // Check if user is admin and redirect accordingly
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
          router.push("/regan-dashboard");
        } else {
          router.push("/manufacturers/manufacturers-Profile-Page");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin() {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: "regan@tombstonesfinder.com",
        password: "admin123", // This should match the password in NextAuth config
      });
      if (result.ok) {
        router.push("/regan-dashboard");
      } else {
        setError("Admin login failed. Please check credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 40%, #f0f6ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Centered Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 22, textAlign: "center", marginBottom: 8, fontFamily: 'Arial, sans-serif', letterSpacing: 0.5 }}>
            Supplier Sign In
          </div>
          <div style={{ borderBottom: "1px solid #e0e0e0", margin: "0 0 18px 0" }} />
          <form onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <div style={{ color: '#e54d26', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>{error}</div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>
                Email<span style={{ color: '#e54d26' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                className="input-focus"
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="password" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>
                Password<span style={{ color: '#e54d26' }}>*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                className="input-focus"
                minLength={8}
                required
              />
              {password.length > 0 && password.length < 8 && (
                <div style={{ color: '#e54d26', fontSize: 12, marginTop: 2 }}>Password must be at least 8 characters.</div>
              )}
              <div style={{ marginTop: 6, textAlign: 'right' }}>
                <a href="#" style={{ color: '#1565c0', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }} className="login-link">
                  Forgot password?
                </a>
              </div>
            </div>
            <button
              type="submit"
              style={buttonStyle(loading)}
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
            
            {/* Admin Login Button */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div style={{ borderTop: "1px solid #e0e0e0", margin: "0 0 16px 0" }} />
              <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>Website Administrator</p>
              <button
                type="button"
                onClick={handleAdminLogin}
                style={adminButtonStyle}
                className="admin-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login as Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}