import { useEffect, useState } from "react";
import ClientSlot from "./ClientSlot.jsx";

export default function SessionCreator({ onClose, date, roomId, capacity, addSession }) {
    const [hours, setHours] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);

    const [selectedHour, setSelectedHour] = useState("");
    const [selectedTrainer, setSelectedTrainer] = useState("");

    const [sessionId, setSessionId] = useState(null);
    const [selectedClients, setSelectedClients] = useState(Array(capacity).fill(null));

    useEffect(() => {
        fetch("http://localhost:3000/api/hours", { credentials: "include" })
            .then(res => res.json())
            .then(r => setHours(r.data || []));

        fetch("http://localhost:3000/api/trainers", { credentials: "include" })
            .then(res => res.json())
            .then(r => setTrainers(r.data || []));

        fetch("http://localhost:3000/api/clients", { credentials: "include" })
            .then(res => res.json())
            .then(r => setClients(r));
    }, []);

    // AUTO-CREATE SESSION
    useEffect(() => {
        if (!selectedHour || !selectedTrainer || sessionId) return;

        const isoDate = date.toISOString().split("T")[0];

        fetch("http://localhost:3000/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                date: isoDate,
                room_id: roomId,
                hour_id: selectedHour,
                trainer_id: selectedTrainer
            })
        })
            .then(res => res.json())
            .then(r => {
                if (r.success) {
                    setSessionId(r.data.session_id);
                    addSession(r.data);
                }
            });
    }, [selectedHour, selectedTrainer]);

    // AUTO-SAVE CLIENT
    const updateClient = async (index, client) => {
        if (!sessionId) return; // wait until session exists

        const body = {
            session_id: sessionId,
            client_id: client.client_id
        };

        await fetch("http://localhost:3000/api/session-clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        });

        const updated = [...selectedClients];
        updated[index] = client;
        setSelectedClients(updated);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {/* HOUR + TRAINER */}
            <div style={{ display: "flex", gap: "10px" }}>
                <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    style={{ padding: "6px", width: "90px" }}
                >
                    <option value="">Hour</option>
                    {hours.map(h => (
                        <option key={h.hour_id} value={h.hour_id}>
                            {h.description}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    style={{ padding: "6px", width: "150px" }}
                >
                    <option value="">Trainer</option>
                    {trainers.map(t => (
                        <option key={t.trainer_id} value={t.trainer_id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* CLIENT PICKERS */}
            <div
                style={{
                    border: "1px dashed #ccc",
                    padding: "10px",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                    width: "100%"
                }}
            >
                {Array.from({ length: capacity }).map((_, idx) => (
                    <ClientSlot
                        key={idx}
                        clients={clients}
                        onSelect={(client) => updateClient(idx, client)}
                    />
                ))}
            </div>


            <button
                onClick={onClose}
                style={{
                    padding: "6px 12px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Close
            </button>
        </div>
    );
}
