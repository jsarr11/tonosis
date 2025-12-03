import { useState } from "react";

export default function ClientSlot({ clients, onSelect }) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (c) => {
        setSelected(c);
        onSelect(c);
        setSearch("");
    };

    return (
        <div style={{ marginBottom: "3px" }}>
            <input
                type="text"
                placeholder={selected ? selected.name : "Search client..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "40%", padding: "2px" }}
            />

            {search.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        background: "white",
                        margin: 0,
                        padding: "4px",
                        maxHeight: "120px",
                        overflowY: "auto",
                        border: "1px solid #ccc"
                    }}
                >
                    {filtered.map(c => (
                        <li
                            key={c.client_id}
                            onClick={() => handleSelect(c)}
                            style={{
                                padding: "4px",
                                cursor: "pointer",
                                borderBottom: "1px solid #eee"
                            }}
                        >
                            {c.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
