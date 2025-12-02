import { useEffect, useState } from "react";
import DayRow from "./DayRow.jsx";

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // Sunday=0, Monday=1...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function buildWeeks(today) {
    const weeks = [];
    let monday = getMonday(today);

    for (let i = 0; i < 10; i++) {
        const weekDays = [];
        for (let j = 0; j < 7; j++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + j);
            weekDays.push(d);
        }
        weeks.push(weekDays);
        monday = new Date(monday);
        monday.setDate(monday.getDate() + 7);
    }
    return weeks;
}

export default function LeftContent() {
    const [weeks, setWeeks] = useState([]);
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);

    useEffect(() => {
        const today = new Date();
        const built = buildWeeks(today);
        setWeeks(built);
        setActiveWeekIndex(0);
    }, []);

    return (
        <div style={{ flex: 1, padding: "20px" }}>
            <h2>Weekly View</h2>

            {/* Tabs */}
            <div style={{ display: "flex", marginBottom: "20px", flexWrap: "wrap" }}>
                {weeks.map((week, idx) => {
                    const start = week[0];
                    const end = week[6];
                    const label = `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveWeekIndex(idx)}
                            style={{
                                marginRight: "10px",
                                padding: "6px 12px",
                                background: activeWeekIndex === idx ? "#0275d8" : "#f0f0f0",
                                color: activeWeekIndex === idx ? "white" : "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Days of selected week */}
            <div>
                {weeks[activeWeekIndex]?.map((day, idx) => (
                    <DayRow key={idx} date={day} />
                ))}
            </div>
        </div>
    );
}
