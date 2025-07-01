// src/components/AboutAdvocacies.tsx
import "./css/advocacies-sec.css";
import healthIconDefault from "../assets/eventspage/health-icon.png";
import healthIconHover from "../assets/eventspage/health-hover.png";
import natureIconDefault from "../assets/eventspage/nature-icon.png";
import natureIconHover from "../assets/eventspage/nature-hover.png";
import bookIconDefault from "../assets/eventspage/book-icon.png";
import bookIconHover from "../assets/eventspage/book-hover.png";
import kasarianIconDefault from "../assets/eventspage/kasarian-icon.png";
import kasarianIconHover from "../assets/eventspage/kasarian-hover.png";
import kulturaIconDefault from "../assets/eventspage/kultura-icon.png";
import kulturaIconHover from "../assets/eventspage/kultura-hover.png";
import placeholderImg from "../assets/aboutpage/img-placeholder-guy.png";
import { useState, useEffect } from "react";

type Member = {
  member_id: string;
  member_name: string;
  member_image: string | null;
  role_name: string;
};

const slides = [
  {
    defaultImage: healthIconDefault,
    hoverImage: healthIconHover,
    category: "Kalusugan",
    title:
      "Itinataguyod ang abot-kamay at makataong serbisyong pangkalusugan para sa lahat sa pamamagitan ng paglaban sa pribatisasyon ng healthcare, pagtugon sa mga salik panlipunan na nakakaapekto sa kalusugan, at pagsasaayos sa kakulangan ng health workers at pasilidad.",
  },
  {
    defaultImage: natureIconDefault,
    hoverImage: natureIconHover,
    category: "Kalikasan",
    title:
      "Nangunguna sa panawagan para sa katarungang pangklima at pangangalaga sa kalikasan sa pamamagitan ng makatarungang paglipat sa sustenableng pamumuhay, paghahanda sa sakuna, at pagprotekta sa mga komunidad laban sa mapaminsalang proyekto tulad ng reclamation.",
  },
  {
    defaultImage: bookIconDefault,
    hoverImage: bookIconHover,
    category: "Karunungan",
    title:
      "Isinusulong ang kabuuang pagkatuto at mapagpalayang edukasyon sa pamamagitan ng mga programang nakabatay sa laro, pagpapalalim ng kamalayang panlipunan, at pagtataguyod ng mabuting pamamahala.",
  },
  {
    defaultImage: kulturaIconDefault,
    hoverImage: kulturaIconHover,
    category: "Kultura",
    title:
      "Pinapalakas ang pambansang identidad at malikhaing kaisipan habang nilalabanan ang historikal na distorsyon sa pamamagitan ng sining bilang sandata ng paglaban at adbokasiya.",
  },
  {
    defaultImage: kasarianIconDefault,
    hoverImage: kasarianIconHover,
    category: "Kasarian",
    title:
      "Pinapahalagahan ang pagkakapantay-pantay ng kasarian at inklusibong lipunan sa pamamagitan ng pagsusulong ng mga polisiya tulad ng SOGIESC Bill, Divorce Bill, at pagtatanggol sa karapatan ng kababaihan.",
  },
];

const getFullImageUrlCouncil = (url: string | null) => {
  if (!url || url.trim() === "") return placeholderImg;
  if (url.startsWith("http")) return url;

  const [path, query] = url.split("?");
  const fullPath = path.includes("/tara-kabataan/")
    ? `http://localhost${path}`
    : `http://localhost/tara-kabataan/${path.startsWith("/") ? "" : "/"}${path}`;

  return query ? `${fullPath}?${query}` : fullPath;
};

export default function AboutAdvocacies() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/members.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.members);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <hr className="advocacies-line" />
      <h1 className="advocacies-header">Advocacies</h1>
      <div className="advocacies-slider">
        {slides.map((slide, idx) => {
          const leads = members.filter((m) => m.role_name === slide.category);

          return (
            <div
              key={idx}
              className={`advocacy-card ${slide.category.toLowerCase()}`}
            >
              <div className="advocacy-icon-container">
                <img
                  src={slide.defaultImage}
                  alt={slide.category}
                  className="default-icon"
                />
                <img
                  src={slide.hoverImage}
                  alt={slide.category}
                  className="hover-icon"
                />
              </div>

              <h2 className="advocacy-category">{slide.category}</h2>
              <p className="advocacy-title">{slide.title}</p>

              {leads.length > 0 && (
                <h2 className="advocacy-category">
                  {leads.length > 1 ? "Leads" : "Lead"}
                </h2>
              )}

              <div className="advocacy-leads">
                {leads.map((lead) => (
                  <div
                    key={lead.member_id}
                    className="advocacy-lead-container"
                  >
                    <img
                      className="lead-photo"
                      src={getFullImageUrlCouncil(lead.member_image)}
                      alt={lead.member_name}
                    />
                    <p className="advocacy-lead">{lead.member_name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
