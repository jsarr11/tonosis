import { useEffect, useState } from "react";

export default function DayRow({ date }) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const isoDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

        fetch(`http://localhost:3000/api/sessions?date=${isoDate}`, {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    setSessions(result.data);
                } else {
                    setSessions([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching sessions:", err);
                setSessions([]);
            });
    }, [date]);

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "6px",
                width: "100%",
                background: "#fafafa",
            }}
        >
            {/* Day header */}
            <strong>
                {date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                })}
            </strong>

            {/* 5 columns row */}
            <div
                style={{
                    display: "flex",
                    marginTop: "10px",
                    borderTop: "1px solid #ccc",
                }}
            >
                {[...Array(5)].map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: "435px",
                            minHeight: "100px",
                            borderRight: idx < 4 ? "1px solid #ccc" : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                        }}
                    >
                        {/* Placeholder content for now */}
                        Column {idx + 1}
                    </div>
                ))}
            </div>

            {/* Sessions list (optional, below the grid) */}
            <div style={{ marginTop: "8px" }}>
                {sessions.length === 0 ? (
                    <span style={{ color: "#999" }}>No sessions</span>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {sessions.map((s) => (
                            <li key={s.session_id} style={{ marginBottom: "4px" }}>
                                <strong>{s.hour}</strong> — {s.kind_name} with {s.trainer_name} in {s.room_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
