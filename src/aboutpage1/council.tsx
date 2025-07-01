// src/components/Council.tsx
import "./css/council.css";
import { useEffect, useState } from "react";
import placeholderImg from "../assets/aboutpage/img-placeholder-guy.png";

type Member = {
  member_id: string;
  member_name: string;
  member_image: string | null;
  role_name: string;
};

const BLACKLISTED_ROLES = [
  "Kalusugan",
  "Kalikasan",
  "Karunungan",
  "Kultura",
  "Kasarian",
];

const getFullImageUrlCouncil = (url: string | null) => {
  if (!url || url.trim() === "") return placeholderImg;
  if (url.startsWith("http")) return url;

  const [path, query] = url.split("?");
  const fullPath = path.includes("/tara-kabataan/")
    ? `${import.meta.env.VITE_API_BASE_URL}${path}`
    : `${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/${path.startsWith("/") ? "" : "/"}${path}`;

  return query ? `${fullPath}?${query}` : fullPath;
};

export default function Council() {
  const [councilData, setCouncilData] = useState<Member[]>([]);
  const [councilText, setCouncilText] = useState("Loading...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/aboutus.php`)
      .then((res) => res.json())
      .then((data) => {
        setCouncilText(data.council || "No data.");
      });

    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/council.php`)
      .then((res) => res.json())
      .then((data: Member[]) => {
        const filtered = data.filter(
          (m) => !BLACKLISTED_ROLES.includes(m.role_name)
        );
        setCouncilData(filtered);
      })
      .catch((err) => console.error("Council API error:", err));
  }, []);

  const president = councilData.find((m) => m.role_name === "President");
  const others = councilData.filter((m) => m.role_name !== "President");

  return (
    <div className="council-sec">
      <div className="council-ribbon">
        <img src="./src/assets/aboutpage/council-ribbon.png" alt="ribbon" />
      </div>
      <div className="council-sec-content">
        <h1 className="council-header">Council</h1>
        <p
          className="council-description"
          dangerouslySetInnerHTML={{
            __html: councilText.replace(/\n/g, "<br />"),
          }}
        />
      </div>

      {/* President */}
      {president && (
        <div className="council-president-grid">
          <div className="council-card council-card-main">
            <div className="council-inner-card-1-president">
              <div className="council-inner-card-2">
                <div className="council-member-image">
                  <img
                    src={getFullImageUrlCouncil(president.member_image)}
                    alt={president.member_name}
                  />
                </div>
                <h1 className="council-member-name">
                  {president.member_name}
                </h1>
                <p className="council-member-role">
                  {president.role_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other council members */}
      <div className="council-grid">
        {others.map((member, i) => (
          <div key={i} className="council-card">
            <div className="council-inner-card-1-members">
              <div className="council-inner-card-2">
                <div className="council-member-image">
                  <img
                    src={getFullImageUrlCouncil(member.member_image)}
                    alt={member.member_name}
                  />
                </div>
                <h1 className="council-member-name">
                  {member.member_name}
                </h1>
                <p className="council-member-role">
                  {member.role_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
