import ClientsPopup from "./ClientsPopup";
import RightButton from "./RightButton";

export default function RightContent() {
    return (
        <div
            style={{
                width: "200px",
                borderLeft: "1px solid #ddd",
                padding: "20px",
                background: "#f9f9f9"
            }}
        >
            <h3>Actions</h3>
            <RightButton label="Clients" popupContent={<ClientsPopup />} />
            <RightButton label="Sessions" popupContent={<p>Sessions popup content here</p>} />
            <RightButton label="Reports" popupContent={<p>Reports popup content here</p>} />
            <RightButton label="Settings" popupContent={<p>Settings popup content here</p>} />
        </div>
    );
}
