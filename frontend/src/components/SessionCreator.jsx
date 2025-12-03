import { useEffect, useState } from "react";

export default function SessionCreator({ onClose, date, roomId, addSession }) {
    const [hours, setHours] = useState([]);
    const [selectedHour, setSelectedHour] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/api/hours", { credentials: "include" })
            .then((res) => res.json())
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    setHours(result.data);
                } else {
                    setHours([]);
                }
            })
            .catch(() => setHours([]));
    }, []);

    // 🔥 Real-time creation when hour is picked
    const handleHourChange = async (hourId) => {
        setSelectedHour(hourId);

        if (!hourId || !roomId) return;

        const isoDate = date.toISOString().split("T")[0];
        const res = await fetch("http://localhost:3000/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                date: isoDate,
                room_id: roomId,
                hour_id: hourId,
            }),
        });

        const result = await res.json();
        if (result.success) {
            addSession(result.data); // push new session into DayRow state
            onClose(); // close creator
        }
    };

    return (
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <select
                value={selectedHour}
                onChange={(e) => handleHourChange(e.target.value)}
                style={{ padding: "6px", width: "90px" }}
            >
                <option value="">Hour</option>
                {hours.map((h) => (
                    <option key={h.hour_id} value={h.hour_id}>
                        {h.description}
                    </option>
                ))}
            </select>

            <div style={{ flex: 1, border: "1px dashed #ccc", padding: "6px", color: "#999" }}>
                Details TBD
            </div>

            <button
                onClick={onClose}
                style={{
                    padding: "6px 12px",
                    background: "#dc2222ff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                X
            </button>
        </div>
    );
}
