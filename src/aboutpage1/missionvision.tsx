import { useEffect, useState } from "react";
import "./css/missiovision.css";

function MissionVision(){
    const [mission, setMission] = useState("Loading...");
    const [vision, setVision] = useState("Loading...");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/aboutus.php`)
        .then((res) => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
        })
        .then((data) => {
            setMission(data.mission || "No data.");
            setVision(data.vision || "No data.");
        })
        .catch((err) => {
            console.error("Fetch error:", err);
            setMission("Failed to load.");
            setVision("Failed to load.");
        });
    }, []);

    return(
            <div className="mission-vision-sec">
                <div className="mission-sec-content">
                    <h1 className="mission-header">Mission</h1>
                    <p className="mission-description"
                    dangerouslySetInnerHTML={{
                        __html: mission.replace(/\n/g, "<br />"),
                      }}
                    >
                        {/* Layunin ng Tara Kabataan ang pagpapatibay ng lakas at tinig ng mga kabataan, sa loob at labas ng paaralan, upang makilala nila ang kanilang sarili at ang kanilang taglay na kakayahan at talento na siyang magsisilbing instrumento upang makatulong sa kanilang sarili, kapwa, komunidad, at bayan. */}
                    </p>
                </div>
                <div className="vision-sec-content">
                    <h1 className="vision-header">Vision</h1>
                    <p className="vision-description"
                    dangerouslySetInnerHTML={{
                        __html: vision.replace(/\n/g, "<br />"),
                      }}
                    >
                        {/* Pangarap ng Tara Kabataan ang pagkakaroon ng isang lungsod at bayan na makakabataan kung saan sa malayang paglinang ng sarili at ng kapwa, abot-kamay ang kaginhawaan para sa lahat. */}
                    </p>
                </div>
            </div>
    )
}

export default MissionVision;