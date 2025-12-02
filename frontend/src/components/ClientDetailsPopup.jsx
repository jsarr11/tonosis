import { useState } from "react";

export default function ClientDetailsPopup({ client, onClose, onSave, onDelete }) {
    const [name, setName] = useState(client.name);
    const [details, setDetails] = useState(client.details || "");
    const [isActive, setIsActive] = useState(client.is_active === 1);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = async () => {
        const res = await fetch(`http://localhost:3000/api/clients/${client.client_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                name,
                details,
                is_active: isActive ? 1 : 0,
            }),
        });
        if (res.ok) {
            const updated = await res.json();
            onSave(updated); // pass updated client back to parent
            onClose();
        }
    };

    const handleDelete = async () => {
        const res = await fetch(`http://localhost:3000/api/clients/${client.client_id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) {
            onDelete(client.client_id);
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
                <h3>Edit Client</h3>

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
                    Active:
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => setIsActive(!isActive)}
                        style={{ marginLeft: "10px" }}
                    />
                </label>

                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Client details..."
                    style={{ width: "100%", height: "80px", marginBottom: "10px" }}
                />

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
                            <p>Are you sure you want to delete <strong>{client.name}</strong>?</p>
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
