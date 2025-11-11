'use client';
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export default function AuthForms() {
  const [form, setForm] = useState("signup"); // signup | login
  const [data, setData] = useState({ name: "", username: "", email: "", identifier: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(form === "signup" ? "Signing up..." : "Logging in...");

    const endpoint = form === "signup" ? "/auth/signup" : "/auth/login";
    const body =
      form === "signup"
        ? {
            name: data.name.trim(),
            username: data.username.trim(),
            email: data.email.trim(),
            password: data.password,
          }
        : { identifier: data.identifier.trim(), password: data.password };

    if (form === "login" && !body.identifier) {
      setMsg("Please enter your email or username.");
      return;
    }

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `${form} failed`);

      localStorage.setItem("token", json.token);
      setData({ name: "", username: "", email: "", identifier: "", password: "" });
      setMsg(`${form === "signup" ? "Signup" : "Login"} successful! Token saved.`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const fetchProfile = async () => {
    setMsg("Fetching profile...");
    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login first.");

    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch profile");
      setMsg(`Hello, ${json.user.name}`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setMsg("Logged out successfully!");
  };

  return (
    <div style={{ maxWidth: 420, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>HealLink Auth</h1>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button disabled={form === "signup"} onClick={() => setForm("signup")}>Sign Up</button>
        <button disabled={form === "login"} onClick={() => setForm("login")} style={{ marginLeft: 8 }}>Login</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        {form === "signup" ? (
          <>
            <input name="name" placeholder="Name" value={data.name} onChange={handleChange} required /><br />
            <input name="username" placeholder="Username" value={data.username} onChange={handleChange} required /><br />
            <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleChange} required /><br />
          </>
        ) : (
          <>
            <input name="identifier" placeholder="Email or Username" value={data.identifier} onChange={handleChange} required /><br />
          </>
        )}
        <input type="password" name="password" placeholder="Password" value={data.password} onChange={handleChange} required /><br />
        <button type="submit" style={{ marginTop: 10 }}>{form === "signup" ? "Sign Up" : "Login"}</button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={fetchProfile}>Get Profile</button>
        <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
      </div>

      {msg && <p style={{ marginTop: 20, textAlign: "center" }}>{msg}</p>}
    </div>
  );
}   