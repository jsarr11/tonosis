import { useState } from "react";

export default function TrainerDetailsPopup({ trainer, onClose, onSave, onDelete }) {
    const [name, setName] = useState(trainer.name);
    const [color, setColor] = useState(trainer.color || "#000000");
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = async () => {
        const res = await fetch(`http://localhost:3000/api/trainers/${trainer.trainer_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, color }),
        });
        if (res.ok) {
            const result = await res.json();
            const updated = result.data || result;
            onSave(updated);
            onClose();
        }
    };

    const handleDelete = async () => {
        const res = await fetch(`http://localhost:3000/api/trainers/${trainer.trainer_id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) {
            onDelete(trainer.trainer_id);
            onClose();
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    minWidth: "300px",
                }}
            >
                <h3>Edit Trainer</h3>

                <label style={{ display: "block", marginBottom: "10px" }}>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginLeft: "10px", width: "80%" }}
                    />
                </label>

                <label style={{ display: "block", marginBottom: "10px" }}>
                    Color:
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ marginLeft: "10px" }}
                    />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                        onClick={handleSave}
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
                    <button
                        onClick={onClose}
                        style={{
                            padding: "6px 12px",
                            background: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>

                <div style={{ marginTop: "15px", textAlign: "center" }}>
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            style={{
                                padding: "6px 12px",
                                background: "#d9534f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Delete
                        </button>
                    ) : (
                        <div>
                            <p>
                                Are you sure you want to delete <strong>{trainer.name}</strong>?
                            </p>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: "6px 12px",
                                    background: "#d9534f",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                }}
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                style={{
                                    padding: "6px 12px",
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
