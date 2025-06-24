"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManufacturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    router.push("/manufacturers/manufacturers-Profile-Page");
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
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e0e0e0", padding: 32, minWidth: 340, maxWidth: 380, width: "100%" }}>
          <div style={{ fontWeight: 700, fontSize: 20, textAlign: "center", marginBottom: 8, fontFamily: 'Arial, sans-serif' }}>
            Supplier Sign In
          </div>
          <div style={{ borderBottom: "1px solid #e0e0e0", margin: "0 0 18px 0" }} />
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#222' }}>
                Email<span style={{ color: '#e54d26' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: 8, border: "1px solid #b5c9e3", borderRadius: 3, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
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
                style={{ width: "100%", padding: 8, border: "1px solid #b5c9e3", borderRadius: 3, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>
            <button
              type="submit"
              style={{ width: 90, background: "#1565c0", color: "#fff", fontWeight: 700, fontSize: 15, padding: "7px 0", border: "none", borderRadius: 3, cursor: "pointer", marginTop: 2 }}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 