import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(
      `${API}/api/auth/${isLogin ? "login" : "register"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      },
    );
    const data = await res.json();
    if (!res.ok) return setError(data.message);
    onAuth(data.token);
  };

  return (
    <div className="wrap">
      <h1>{isLogin ? "login" : "register"}</h1>
      <form onSubmit={submit} className="auth-form">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          autoFocus
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        <button type="submit">{isLogin ? "login" : "register"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="switch" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "no account? register" : "have an account? login"}
      </p>
    </div>
  );
}
