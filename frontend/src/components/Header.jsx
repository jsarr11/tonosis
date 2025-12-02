import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await fetch("http://localhost:3000/api/logout", {
            method: "POST",
            credentials: "include"
        });
        navigate("/login");
    };

    return (
        <header
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 24px",
                background: "#f5f5f5",
                borderBottom: "1px solid #ddd"
            }}
        >
            <h3 style={{ margin: 0 }}>Tonosis Secretary</h3>
            <button
                onClick={handleLogout}
                style={{
                    padding: "6px 12px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Logout
            </button>
        </header>
    );
}
