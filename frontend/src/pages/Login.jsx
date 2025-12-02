import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                navigate("/home");
            } else {
                setError(data.message || "Login failed");
            }
        } catch {
            setError("Server error");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ display: "block", margin: "10px auto", padding: "8px" }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ display: "block", margin: "10px auto", padding: "8px" }}
            />
            <button onClick={handleLogin} style={{ marginTop: "10px", padding: "8px 16px" }}>
                Login
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
