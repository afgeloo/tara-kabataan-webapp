import { useEffect, useState } from "react";
import "./css/coreval.css";

function CoreValue() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coreValues, setCoreValues] = useState([
    { title: "Kapwa", description: "Loading..." },
    { title: "Kalinangan", description: "Loading..." },
    { title: "Kaginhawaan", description: "Loading..." },
  ]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/aboutus.php`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        setCoreValues([
          {
            title: "Kapwa",
            description: data.core_kapwa || "No data.",
          },
          {
            title: "Kalinangan",
            description: data.core_kalinangan || "No data.",
          },
          {
            title: "Kaginhawaan",
            description: data.core_kaginhawaan || "No data.",
          },
        ]);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setCoreValues([
          { title: "Kapwa", description: "Failed to load." },
          { title: "Kalinangan", description: "Failed to load." },
          { title: "Kaginhawaan", description: "Failed to load." },
        ]);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === coreValues.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); 

    return () => clearInterval(interval); 
  }, [coreValues]);

  return (
    <div className="coreval-sec">
      <h1 className="coreval-header">Core Values</h1>
      <div className="coreval-sec-content">
        <div className="coreval-outer-bg">
          <div className="coreval-inner-bg">
            <img
              src="./src/assets/aboutpage/coreval-ribbon.png"
              alt="Ribbon"
            />
          </div>
          <div className="coreval-content-wrapper">
            <div className="coreval-cow">
              <img src="./src/assets/aboutpage/coreval-cow.png" alt="Cow" />
            </div>
            <div className="corevalues-cards">
              <div className="slider-container">
                <div
                  className="slider"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {coreValues.map((value, idx) => (
                    <div className="card" key={idx}>
                      <h1>{value.title}</h1>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: value.description.replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="pagination-dots">
                  {coreValues.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot ${idx === currentIndex ? "active" : ""}`}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoreValue;
