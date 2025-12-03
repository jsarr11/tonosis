import { useEffect, useState } from "react";
import SessionCreator from "./SessionCreator.jsx";

export default function DayRow({ date }) {
    const [sessions, setSessions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [sessionCreators, setSessionCreators] = useState([[], [], [], [], []]);

    // Hard-coded room IDs for the 5 columns
    const fixedRoomIds = [3, 4, 5, 6, 7];

    // Fetch sessions for the day
    useEffect(() => {
        const isoDate = date.toISOString().split("T")[0];
        fetch(`http://localhost:3000/api/sessions?date=${isoDate}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    setSessions(result.data);
                } else {
                    setSessions([]);
                }
            })
            .catch(() => setSessions([]));
    }, [date]);

    // Fetch rooms (needed to get descriptions)
    useEffect(() => {
        fetch("http://localhost:3000/api/rooms", { credentials: "include" })
            .then((res) => res.json())
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    setRooms(result.data);
                } else {
                    setRooms([]);
                }
            })
            .catch(() => setRooms([]));
    }, []);

    // Helper: get description for fixed room ID
    const getRoomDescription = (roomId) => {
        const room = rooms.find((r) => r.room_id === roomId);
        return room ? room.description : `Room ${roomId}`;
    };

    // Delete a session
    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;
        const res = await fetch(`http://localhost:3000/api/sessions/${sessionId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) {
            setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        }
    };

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
            <strong>
                {date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                })}
            </strong>

            <div style={{ display: "flex", marginTop: "10px", borderTop: "1px solid #ccc" }}>
                {[...Array(5)].map((_, idx) => {
                    const roomId = fixedRoomIds[idx];
                    const roomDesc = getRoomDescription(roomId);

                    return (
                        <div
                            key={idx}
                            style={{
                                width: "435px",
                                minHeight: "100px",
                                borderRight: idx < 4 ? "1px solid #ccc" : "none",
                                padding: "10px",
                            }}
                        >
                            {/* 🔥 Show Room Description Instead of ID */}
                            <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                                {roomDesc}
                            </div>

                            {/* Render session-creator popups */}
                            {sessionCreators[idx].map((creator, cIndex) => (
                                <SessionCreator
                                    key={cIndex}
                                    date={date}
                                    roomId={roomId}
                                    addSession={(newSession) =>
                                        setSessions((prev) => [...prev, newSession])
                                    }
                                    onClose={() => {
                                        const updated = [...sessionCreators];
                                        updated[idx] = updated[idx].filter((_, i) => i !== cIndex);
                                        setSessionCreators(updated);
                                    }}
                                />
                            ))}

                            <button
                                onClick={() => {
                                    const updated = [...sessionCreators];
                                    updated[idx] = [...updated[idx], {}];
                                    setSessionCreators(updated);
                                }}
                                style={{
                                    marginTop: "6px",
                                    padding: "6px 12px",
                                    background: "#5cb85c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                +
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: "8px" }}>
                {sessions.length === 0 ? (
                    <span style={{ color: "#999" }}>No sessions</span>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {sessions.map((s) => (
                            <li key={s.session_id} style={{ marginBottom: "4px" }}>
                                <strong>{s.hour}</strong> — {s.kind_name} with {s.trainer_name} in{" "}
                                {s.room_name}
                                <button
                                    onClick={() => handleDeleteSession(s.session_id)}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "2px 6px",
                                        background: "#d9534f",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
