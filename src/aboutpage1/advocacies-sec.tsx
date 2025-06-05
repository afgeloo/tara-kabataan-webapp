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

const slidesadvocacies = [
    { 
        defaultImage: healthIconDefault,
        hoverImage: healthIconHover,
        category: "Kalusugan",
        title: "Itinataguyod ang abot-kamay at makataong serbisyong pangkalusugan para sa lahat sa pamamagitan ng paglaban sa pribatisasyon ng healthcare, pagtugon sa mga salik panlipunan na nakakaapekto sa kalusugan, at pagsasaayos sa kakulangan ng health workers at pasilidad.",
        leads: ["Juan Dela Cruz"]
    },
    { 
        defaultImage: natureIconDefault,
        hoverImage: natureIconHover,
        category: "Kalikasan",
        title: "Nangunguna sa panawagan para sa katarungang pangklima at pangangalaga sa kalikasan sa pamamagitan ng makatarungang paglipat sa sustenableng pamumuhay, paghahanda sa sakuna, at pagprotekta sa mga komunidad laban sa mapaminsalang proyekto tulad ng reclamation.",
        leads: ["Alex Reyes", "Jamie Santos"]
    },
    { 
        defaultImage: bookIconDefault,
        hoverImage: bookIconHover,
        category: "Karunungan",
        title: "Isinusulong ang kabuuang pagkatuto at mapagpalayang edukasyon sa pamamagitan ng mga programang nakabatay sa laro, pagpapalalim ng kamalayang panlipunan, at pagtataguyod ng mabuting pamamahala.",
    },
    { 
        defaultImage: kulturaIconDefault,
        hoverImage: kulturaIconHover,
        category: "Kultura",
        title: "Pinapalakas ang pambansang identidad at malikhaing kaisipan habang nilalabanan ang historikal na distorsyon sa pamamagitan ng sining bilang sandata ng paglaban at adbokasiya.",
    },
    { 
        defaultImage: kasarianIconDefault,
        hoverImage: kasarianIconHover,
        category: "Kasarian",
        title: "Pinapahalagahan ang pagkakapantay-pantay ng kasarian at inklusibong lipunan sa pamamagitan ng pagsusulong ng mga polisiya tulad ng SOGIESC Bill, Divorce Bill, at pagtatanggol sa karapatan ng kababaihan.",
    },
];

function AboutAdvocacies() {
    return (
        <div>
            <hr className="advocacies-line" />
            <h1 className="advocacies-header">Advocacies</h1>
            <div className="advocacies-slider">
            {slidesadvocacies.map((slide, index) => (
                <div
                    className={`advocacy-card ${slide.category.toLowerCase()}`}
                    key={index}
                >
                    <div className="advocacy-icon-container">
                        <img src={slide.defaultImage} alt={slide.category} className="default-icon" />
                        <img src={slide.hoverImage} alt={slide.category} className="hover-icon" />
                    </div>
                    <h2 className="advocacy-category">{slide.category}</h2>
                    <p className="advocacy-title">{slide.title}</p>
                    <h2 className="advocacy-category">
                    {(slide.leads && slide.leads.length >= 2) ? "Leads" : "Lead"}
                    </h2>

                    <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "10px" }}>
                    {(slide.leads && slide.leads.length > 0) ? (
                        slide.leads.map((lead, idx) => (
                        <div
                            key={idx}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                        >
                            <div className="lead-placeholder" />
                            <p className="advocacy-lead">{lead}</p>
                        </div>
                        ))
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div className="lead-placeholder" />
                        <p className="advocacy-lead">No Current Lead</p>
                        </div>
                    )}
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}

export default AboutAdvocacies;