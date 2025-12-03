import { useEffect, useState } from "react";
import SessionCreator from "./SessionCreator.jsx";

export default function DayRow({ date }) {
    const [sessions, setSessions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [sessionCreators, setSessionCreators] = useState([[], [], [], [], []]);

    // Hard-coded room IDs
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

    // Fetch rooms
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

    // Helper
    const getRoomDescription = (roomId) => {
        const room = rooms.find((r) => r.room_id === roomId);
        return room ? room.description : `Room ${roomId}`;
    };

    // Delete session
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

            {/* 5 ROOM COLUMNS */}
            <div style={{ display: "flex", marginTop: "10px", borderTop: "1px solid #ccc" }}>
                {[...Array(5)].map((_, idx) => {
                    const roomId = fixedRoomIds[idx];
                    const room = rooms.find((r) => r.room_id === roomId);
                    const roomDesc = getRoomDescription(roomId);
                    const capacity = room ? room.capacity : 0;

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
                            {/* ROOM NAME */}
                            <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                                {roomDesc}
                            </div>

                            {/* SESSION CREATORS */}
                            {sessionCreators[idx].map((creator, cIndex) => (
                                <SessionCreator
                                    key={cIndex}
                                    date={date}
                                    roomId={roomId}
                                    capacity={capacity}
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

            {/* SESSION LIST BOTTOM */}
            <div style={{ marginTop: "8px" }}>
                {sessions.length === 0 ? (
                    <span style={{ color: "#999" }}>No sessions</span>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {sessions.map((s) => (
                            <li
                                key={s.session_id}
                                style={{
                                    marginBottom: "6px",
                                    padding: "10px",
                                    background: s.trainer_color || "#aaa",
                                    color: "white",
                                    borderRadius: "4px",
                                }}
                            >
                                <strong>{s.hour}</strong> — {s.kind_name} with {s.trainer_name} in {s.room_name}

                                {/* CLIENTS — ALWAYS 2 PER ROW */}
                                {s.clients && s.clients.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "6px",
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                            gap: "4px",
                                            width: "100%",
                                        }}
                                    >
                                        {s.clients.map((c) => (
                                            <div
                                                key={c.client_id}
                                                style={{
                                                    background: "rgba(255,255,255,0.25)",
                                                    padding: "4px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    width: "100%",
                                                }}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleDeleteSession(s.session_id)}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "4px 8px",
                                        background: "black",
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
