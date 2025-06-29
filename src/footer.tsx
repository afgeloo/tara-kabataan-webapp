import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./global-css/footer.css";
import "./global-css/header.css";

import logo from "./assets/header/tarakabataanlogo2.png";
import topCloud from "./assets/homepage/top-cloud.png";
import footerMid from "./assets/homepage/footer-mid.png";
import botCloud from "./assets/footer/botcloud.png";
import facebookIcon from "./assets/footer/facebook.png";
import instagramIcon from "./assets/footer/instagram.png";
import { IonIcon } from "@ionic/react";
import { callOutline, mailOutline } from "ionicons/icons";


function Footer() {
  const [contactNo, setContactNo] = useState<string>("Loading...");
  const [email, setEmail] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/aboutus.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.contact_no) setContactNo(data.contact_no);
        if (data.about_email) setEmail(data.about_email);
      })
      .catch((error) => {
        console.error("Error fetching footer data:", error);
        setContactNo("Unavailable");
        setEmail("Unavailable");
      });
  }, []);

  return (
    <div className="footer-sec">
      <img src={topCloud} className="footer-top-cloud" alt="Top Cloud" draggable="false" />
      <div className="footer-section-main">
        <div className="footer-content">
          <div className="footer-left-content">
            <img src={logo} alt="Tarakabataan Logo" className="footer-tk-logo" draggable="false" />
            <div className="footer-number">
              <div className="footer-icon-circle">
                <IonIcon icon={callOutline} />
              </div>
              <p>{contactNo}</p>
            </div>
            <div className="footer-email">
              <div className="footer-icon-circle">
                <IonIcon icon={mailOutline} />
              </div>
              <p>{email}</p>
            </div>
          </div>
          <div className="footer-mid-content">
            <h2>About Us</h2>
            <p>
              Ang Tara Kabataan (TK) ay isang organisasyon ng mga kabataan sa Maynila na
              itinatag para isulong ang kaginhawaan ng bawat kabataan at Manilenyo.
            </p>
          </div>
          <div className="footer-right-content">
            <h2>Social Media</h2>
            <a
              href="https://www.facebook.com/TaraKabataanMNL"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-facebook"
            >
              <img src={facebookIcon} alt="Facebook" draggable="false" />
              <p>Tara Kabataan</p>
            </a>
            <a
              href="https://www.instagram.com/tarakabataan"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram"
            >
              <img src={instagramIcon} alt="Instagram" draggable="false" />
              <p>@tarakabataan</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
