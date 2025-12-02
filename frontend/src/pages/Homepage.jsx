import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/api/me", { credentials: "include" })
            .then(res => {
                if (res.status === 401) {
                    navigate("/login");
                } else {
                    return res.json();
                }
            })
            .then(data => {
                if (data) setUser(data.user);
            })
            .catch(() => navigate("/login"))
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <p>Checking session...</p>;

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>Homepage</h2>
            <p>Welcome {user?.username}, you are logged in.</p>
        </div>
    );
}
