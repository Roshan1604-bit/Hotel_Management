
import { useState } from "react";

const API_URL = "http://localhost:8080/api/auth";

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/register" : "/login";

      const body = isSignup
        ? { name, email, password }
        : { email, password };

      const url = API_URL + endpoint;


      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Request failed. Please try again."
        );
      }

      if (isSignup) {
        setMessage("Registration successful! You can now log in.");
        setIsSignup(false);
        setName("");
        setPassword("");
      } else {
        if (!data.token) {
          throw new Error("Login succeeded, but no JWT token was returned.");
        }

        onLoginSuccess(data);
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Could not connect to the server. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Hotel Management</h1>
        <p style={styles.subtitle}>
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {isSignup && (
          <input
            style={styles.input}
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create Account"
              : "Login"}
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.switchText}>
          {isSignup
            ? "Already have an account? "
            : "New to our hotel system? "}
          <button
            type="button"
            style={styles.link}
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  },
  title: {
    textAlign: "center",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  message: {
    marginTop: "16px",
    textAlign: "center",
    color: "#334155",
    overflowWrap: "anywhere",
  },
  switchText: {
    textAlign: "center",
    marginTop: "22px",
    color: "#475569",
    fontSize: "14px",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
}