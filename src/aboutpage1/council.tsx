import "./css/council.css";
import { useEffect, useState } from "react";

function Council() {
    const [councilData, setCouncilData] = useState([]);
    const [councilText, setCouncilText] = useState("Loading...");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/aboutus.php`)
            .then(res => res.json())
            .then(data => {
                setCouncilText(data.council || "No data.");
            });

        fetch(`${import.meta.env.VITE_API_BASE_URL}/council.php`)
            .then(res => res.json())
            .then(data => setCouncilData(data))
            .catch(err => console.error("Council API error:", err));
    }, []);

    return (
        <div className="council-sec">
            <div className="council-ribbon">
                <img src="./src/assets/aboutpage/council-ribbon.png" alt="ribbon" />
            </div>
            <div className="council-sec-content">
                <h1 className="council-header">Council</h1>
                <p className="council-description"
                    dangerouslySetInnerHTML={{ __html: councilText.replace(/\n/g, "<br />") }}
                />
            </div>
            <div className="council-president-grid">
                {councilData
                    .filter(member => member.role_name === "President")
                    .map((member, index) => (
                        <div key={index} className="council-card council-card-main">
                            <div className="council-inner-card-1-president">
                                <div className="council-inner-card-2">
                                    <div className="council-member-image">
                                    <img
                                    src={`http://localhost/tara-kabataan/tara-kabataan-webapp/uploads/members-images/member-2025-000001.jpg?t=${Date.now()}`}
                                    onError={(e) => {
                                        const basePath = "http://localhost/tara-kabataan/tara-kabataan-webapp/uploads/members-images/";
                                        const fallbackExtensions = ["png", "jpeg"];
                                        const attemptedSrcs = fallbackExtensions.map(
                                            ext => `${basePath}member-2025-000001.${ext}?t=${Date.now()}`
                                        );

                                        if (!e.currentTarget.dataset.fallbackIndex) {
                                            e.currentTarget.dataset.fallbackIndex = "0";
                                        }

                                        const index = parseInt(e.currentTarget.dataset.fallbackIndex);
                                        if (index < attemptedSrcs.length) {
                                            e.currentTarget.src = attemptedSrcs[index];
                                            e.currentTarget.dataset.fallbackIndex = `${index + 1}`;
                                        } else {
                                            e.currentTarget.src = "./src/assets/aboutpage/img-placeholder-guy.png";
                                        }
                                    }}
                                    alt={member.role_name}
                                    />
                                    </div>
                                    <h1 className="council-member-name">{member.member_name}</h1>
                                    <p className="council-member-role">{member.role_name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            <div className="council-grid">
                {councilData
                    .filter(member => member.role_name !== "President")
                    .map((member, index) => (
                        <div key={index} className="council-card">
                            <div className="council-inner-card-1-members">
                                <div className="council-inner-card-2">
                                <div className="council-member-image">
                                <img
                                src={`http://localhost/tara-kabataan/tara-kabataan-webapp/uploads/members-images/${member.member_id}.jpg`}
                                onError={(e) => {
                                    const basePath = "http://localhost/tara-kabataan/tara-kabataan-webapp/uploads/members-images/";
                                    const fallbackExtensions = ["png", "jpeg"];
                                    const attemptedSrcs = fallbackExtensions.map(
                                        ext => `${basePath}${member.member_id}.${ext}?t=${Date.now()}`
                                    );

                                    if (!e.currentTarget.dataset.fallbackIndex) {
                                        e.currentTarget.dataset.fallbackIndex = "0";
                                    }

                                    const index = parseInt(e.currentTarget.dataset.fallbackIndex);
                                    if (index < attemptedSrcs.length) {
                                        e.currentTarget.src = attemptedSrcs[index];
                                        e.currentTarget.dataset.fallbackIndex = `${index + 1}`;
                                    } else {
                                        e.currentTarget.src = "./src/assets/aboutpage/img-placeholder-guy.png";
                                    }
                                }}
                                alt={member.role_name}
                                />
                                </div>
                                <h1 className="council-member-name">{member.member_name}</h1>
                                <p className="council-member-role">{member.role_name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Council;
