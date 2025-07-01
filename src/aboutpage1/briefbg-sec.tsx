import "./css/briefbg-sec.css";
import { memo, useEffect, useState } from "react";
import BgCarousel from "./bgcarousel";

const assetsPath = "./src/assets/homepage/";
const assetsPath1 = "./src/assets/aboutpage/";

const slides = [
  { image: `${assetsPath}events-1.jpg` },
  { image: `${assetsPath}events-2.jpg` },
  { image: `${assetsPath}events-3.jpg` },
  { image: `${assetsPath}events-4.jpg` },
];

const BriefBg: React.FC = memo(() => {
  const [background, setBackground] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/aboutus.php`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.background) {
          setBackground(data.background);
        } else {
          setBackground("No background content found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching background:", error);
        setBackground("Failed to load background.");
      });
  }, []);

  return (
    <div className="briefbg-sec">
      <div className="briefbg-carousel-bg">
        <img
          src={`${assetsPath1}briefbg-ribbon.png`}
          alt="Brief Background Carousel Background"
        />
      </div>
      <div className="bg-carousel-container">
        <BgCarousel slides={slides} autoSlide autoSlideInterval={5000} />
      </div>
      <div className="briefbg-sec-content">
        <h1 className="briefbg-header">Brief Background</h1>
        <p
          className="briefbg-description"
        >{background}</p>
      </div>
      <hr className="briefbg-line" />
    </div>
  );
});

export default BriefBg;
