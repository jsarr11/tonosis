import ClientsPopup from "./ClientsPopup";
import InformStatusPopup from "./InformStatusPopup";
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
            <RightButton label="Inform Status" popupContent={<InformStatusPopup />} />
        </div>
    );
}
