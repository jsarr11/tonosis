import { useState } from "react";

export default function RightButton({ label, popupContent }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                style={{
                    padding: "8px 12px",
                    marginBottom: "10px",
                    width: "100%",
                    cursor: "pointer"
                }}
            >
                {label}
            </button>

            {open && (
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
                        justifyContent: "center"
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            minWidth: "300px",
                            textAlign: "center"
                        }}
                    >
                        <h3>{label} Popup</h3>
                        <div>{popupContent}</div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                marginTop: "20px",
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
                </div>
            )}
        </div>
    );
}
