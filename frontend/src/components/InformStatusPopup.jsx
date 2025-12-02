import { useEffect, useState } from "react";
import InformStatusDetailsPopup from "./InformStatusDetailsPopup.jsx";

export default function InformStatusPopup() {
    const [statuses, setStatuses] = useState([]);
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3000/api/inform-status", { credentials: "include" })
            .then(res => res.json())
            .then(result => {
                const data = result.data || result;
                const sorted = [...data].sort((a, b) => a.description.localeCompare(b.description));
                setStatuses(sorted);
            })
            .catch(() => setStatuses([]));
    }, []);

    const filtered = statuses.filter(s =>
        (s.description || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveStatus = (updated) => {
        setStatuses(prev =>
            prev
                .map(s => (s.inform_status_id === updated.inform_status_id ? updated : s))
                .sort((a, b) => a.description.localeCompare(b.description))
        );
    };

    const handleDeleteStatus = (id) => {
        setStatuses(prev => prev.filter(s => s.inform_status_id !== id));
    };

    return (
        <div style={{ textAlign: "left", minWidth: "300px" }}>
            <h3>Inform Status</h3>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
            />

            <button
                onClick={() => setShowAdd(!showAdd)}
                style={{
                    marginBottom: "10px",
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

            {showAdd && (
                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="text"
                        placeholder="New status description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <button
                        onClick={async () => {
                            if (!newDescription.trim()) return;
                            const res = await fetch("http://localhost:3000/api/inform-status", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ description: newDescription }),
                            });
                            if (res.ok) {
                                const result = await res.json();
                                const added = result.data || result;
                                setStatuses(prev =>
                                    [...prev, added].sort((a, b) => a.description.localeCompare(b.description))
                                );
                                setNewDescription("");
                                setShowAdd(false);
                            }
                        }}
                        style={{
                            padding: "6px 12px",
                            background: "#0275d8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Save
                    </button>
                </div>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {filtered.map(s => (
                    <li
                        key={s.inform_status_id}
                        style={{
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedStatus(s)}
                    >
                        {s.description}
                    </li>
                ))}
            </ul>

            {selectedStatus && (
                <InformStatusDetailsPopup
                    status={selectedStatus}
                    onClose={() => setSelectedStatus(null)}
                    onSave={handleSaveStatus}
                    onDelete={handleDeleteStatus}
                />
            )}
        </div>
    );
}
