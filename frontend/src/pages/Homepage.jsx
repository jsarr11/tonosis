import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import LeftContent from "../components/LeftContent.jsx";
import RightContent from "../components/RightContent.jsx";

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
        <div>
            <Header />
            <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
                <LeftContent />
                <RightContent />
            </div>
        </div>
    );
}
