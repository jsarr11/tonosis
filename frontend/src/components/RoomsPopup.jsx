import { useEffect, useState } from "react";
import RoomDetailsPopup from "./RoomDetailsPopup.jsx";

export default function RoomsPopup() {
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [newCapacity, setNewCapacity] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Fetch rooms
    useEffect(() => {
        fetch("http://localhost:3000/api/rooms", { credentials: "include" })
            .then((res) => res.json())
            .then((result) => {
                if (result.success && Array.isArray(result.data)) {
                    const sorted = [...result.data].sort((a, b) =>
                        (a.description || "").localeCompare(b.description || "")
                    );
                    setRooms(sorted);
                } else {
                    setRooms([]);
                }
            })
            .catch(() => setRooms([]));
    }, []);

    // Filter list
    const filtered = rooms.filter((r) =>
        (r.description || "").toLowerCase().includes(search.toLowerCase())
    );

    // Update room in list
    const handleSaveRoom = (updated) => {
        setRooms((prev) =>
            prev
                .map((r) => (r.room_id === updated.room_id ? updated : r))
                .sort((a, b) => (a.description || "").localeCompare(b.description || ""))
        );
    };

    // Remove room from list
    const handleDeleteRoom = (id) => {
        setRooms((prev) => prev.filter((r) => r.room_id !== id));
    };

    return (
        <div style={{ textAlign: "left", minWidth: "300px" }}>
            <h3>Rooms</h3>
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
                        placeholder="New room description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <input
                        type="number"
                        placeholder="Capacity"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                        style={{ width: "100%", marginBottom: "6px", padding: "6px" }}
                    />
                    <button
                        onClick={async () => {
                            if (!newDescription.trim() || !newCapacity) return;
                            const res = await fetch("http://localhost:3000/api/rooms", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    description: newDescription.trim(),
                                    capacity: parseInt(newCapacity, 10),
                                }),
                            });
                            if (res.ok) {
                                const result = await res.json();
                                const added = result.data || result;
                                setRooms((prev) =>
                                    [...prev, added].sort((a, b) =>
                                        (a.description || "").localeCompare(b.description || "")
                                    )
                                );
                                setNewDescription("");
                                setNewCapacity("");
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
                {filtered.map((r) => (
                    <li
                        key={r.room_id}
                        style={{
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedRoom(r)}
                    >
                        {r.description} (capacity: {r.capacity})
                    </li>
                ))}
            </ul>

            {selectedRoom && (
                <RoomDetailsPopup
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    onSave={handleSaveRoom}
                    onDelete={handleDeleteRoom}
                />
            )}
        </div>
    );
}
