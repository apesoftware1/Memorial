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
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.4s cubic-bezier(.4,0,.2,1)'
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
const inputFocusStyle = {
  borderColor: '#1565c0',
  boxShadow: '0 0 0 2px #90caf9',
  background: '#fff',
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
  `;
  document.head.appendChild(style);
}

export default function ManufacturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
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
        router.push("/manufacturers/manufacturers-Profile-Page");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterSuccess("");
    try {
      const res = await fetch("https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/auth/local/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok && data.jwt) {
        setRegisterSuccess("Registration successful! You can now log in.");
        setShowRegister(false);
        setRegisterForm({ username: "", email: "", password: "" });
      } else {
        setRegisterError(data.error?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setRegisterError("Network error. Please try again.");
    } finally {
      setRegisterLoading(false);
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
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <span style={{ fontSize: 14, color: '#444' }}>Don't have an account? </span>
              <button type="button" onClick={() => setShowRegister(true)} style={{ color: '#1565c0', fontWeight: 600, textDecoration: 'underline', fontSize: 14, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} className="login-link">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Registration Modal */}
      {showRegister && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <button onClick={() => setShowRegister(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>&times;</button>
            <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 8, fontFamily: 'Arial, sans-serif', letterSpacing: 0.5 }}>Register</div>
            <div style={{ borderBottom: '1px solid #e0e0e0', margin: '0 0 18px 0' }} />
            <form onSubmit={handleRegister} autoComplete="on">
              {registerError && <div style={{ color: '#e54d26', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>{registerError}</div>}
              {registerSuccess && <div style={{ color: '#388e3c', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>{registerSuccess}</div>}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="register-username" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>Username<span style={{ color: '#e54d26' }}>*</span></label>
                <input
                  id="register-username"
                  type="text"
                  value={registerForm.username}
                  onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                  style={inputStyle}
                  className="input-focus"
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="register-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>Email<span style={{ color: '#e54d26' }}>*</span></label>
                <input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  className="input-focus"
                  required
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="register-password" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>Password<span style={{ color: '#e54d26' }}>*</span></label>
                <input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  style={inputStyle}
                  className="input-focus"
                  minLength={8}
                  required
                />
                {registerForm.password.length > 0 && registerForm.password.length < 8 && (
                  <div style={{ color: '#e54d26', fontSize: 12, marginTop: 2 }}>Password must be at least 8 characters.</div>
                )}
              </div>
              <button
                type="submit"
                style={buttonStyle(registerLoading)}
                className="login-btn"
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 