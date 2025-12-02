import { useEffect, useState } from "react";
import TrainerDetailsPopup from "./TrainerDetailsPopup.jsx";

export default function TrainersPopup() {
    const [trainers, setTrainers] = useState([]);
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#000000");
    const [selectedTrainer, setSelectedTrainer] = useState(null);

    // Fetch trainers
    useEffect(() => {
        fetch("http://localhost:3000/api/trainers", { credentials: "include" })
            .then((res) => res.json())
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    const sorted = [...result.data].sort((a, b) =>
                        (a.name || "").localeCompare(b.name || "")
                    );
                    setTrainers(sorted);
                } else {
                    setTrainers([]);
                }
            })
            .catch(() => setTrainers([]));
    }, []);

    // Filter list
    const filtered = trainers.filter((t) =>
        (t.name || "").toLowerCase().includes(search.toLowerCase())
    );

    // Update trainer in list
    const handleSaveTrainer = (updated) => {
        setTrainers((prev) =>
            prev
                .map((t) => (t.trainer_id === updated.trainer_id ? updated : t))
                .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        );
    };

    // Remove trainer from list
    const handleDeleteTrainer = (id) => {
        setTrainers((prev) => prev.filter((t) => t.trainer_id !== id));
    };

    return (
        <div style={{ textAlign: "left", minWidth: "300px" }}>
            <h3>Trainers</h3>
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
                        placeholder="New trainer name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <button
                        onClick={async () => {
                            if (!newName.trim()) return;
                            const res = await fetch("http://localhost:3000/api/trainers", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    name: newName.trim(),
                                    color: newColor,
                                }),
                            });
                            if (res.ok) {
                                const result = await res.json();
                                const added = result.data || result;
                                setTrainers((prev) =>
                                    [...prev, added].sort((a, b) =>
                                        (a.name || "").localeCompare(b.name || "")
                                    )
                                );
                                setNewName("");
                                setNewColor("#000000");
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
                {filtered.map((t) => (
                    <li
                        key={t.trainer_id}
                        style={{
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedTrainer(t)}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                marginRight: "8px",
                                backgroundColor: t.color || "#ccc",
                            }}
                        ></span>
                        {t.name}
                    </li>
                ))}
            </ul>

            {selectedTrainer && (
                <TrainerDetailsPopup
                    trainer={selectedTrainer}
                    onClose={() => setSelectedTrainer(null)}
                    onSave={handleSaveTrainer}
                    onDelete={handleDeleteTrainer}
                />
            )}
        </div>
    );
}
