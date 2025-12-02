import { useEffect, useState } from "react";
import ClientDetailsPopup from "./ClientDetailsPopup.jsx";

export default function ClientsPopup() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);

    // Fetch clients
    useEffect(() => {
        fetch("http://localhost:3000/api/clients", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
                setClients(sorted);
            })
            .catch(() => setClients([]));
    }, []);

    // Filter list
    const filtered = clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Update client in list
    const handleSaveClient = (updated) => {
        setClients((prev) =>
            prev
                .map((c) => (c.client_id === updated.client_id ? updated : c))
                .sort((a, b) => a.name.localeCompare(b.name))
        );
    };

    // Remove client from list
    const handleDeleteClient = (id) => {
        setClients((prev) => prev.filter((c) => c.client_id !== id));
    };

    return (
        <div style={{ textAlign: "left", minWidth: "300px" }}>
            <h3>Clients</h3>
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
                        placeholder="New client name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <button
                        onClick={async () => {
                            if (!newName.trim()) return;
                            const res = await fetch("http://localhost:3000/api/clients", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ name: newName, is_active: 1 }),
                            });
                            if (res.ok) {
                                const added = await res.json();
                                setClients((prev) =>
                                    [...prev, added].sort((a, b) => a.name.localeCompare(b.name))
                                );
                                setNewName("");
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
                {filtered.map((c) => (
                    <li
                        key={c.client_id}
                        style={{
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedClient(c)}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                marginRight: "8px",
                                backgroundColor: c.is_active === 1 ? "green" : "red",
                            }}
                        ></span>
                        {c.name}
                    </li>
                ))}
            </ul>

            {selectedClient && (
                <ClientDetailsPopup
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onSave={handleSaveClient}
                    onDelete={handleDeleteClient}
                />
            )}
        </div>
    );
}
