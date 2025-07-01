import "./css/events-sec.css";
import EventsCarousel from "./events-carousel";
import { Link } from "react-router-dom";
import { memo, useEffect, useState } from "react";

interface Event {
  event_id: string;
  event_image: string;
  event_category: string;
  event_title: string;
  event_date: string;
  event_venue: string;
}

const EventsSec: React.FC = memo(() => {
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/events.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedEvents = data
            .sort((a: Event, b: Event) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
            .slice(0, 5); // Only 5 latest

          const formattedSlides = sortedEvents.map((event: Event) => {
            const formattedDate = new Date(event.event_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return {
              image: `${import.meta.env.VITE_API_BASE_URL}${event.event_image}`,
              category: event.event_category,
              title: event.event_title,
              date: formattedDate,
              location: event.event_venue,
            };
          });

          setSlides(formattedSlides);
        }
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  if (slides.length === 0) return null; 

  return (
    <div className="events-sec">
      <div className="events-sec-content">
        <div className="carousel-container">
        <h1 className="events-header">EVENTS</h1>
          {slides.length > 0 && (
            <EventsCarousel slides={slides} autoSlide autoSlideInterval={5000} />
          )}
          <div className="events-sec-nav">
          <Link to="/Events" className="nav-events">
            <img src="./src/assets/homepage/calendar.png" alt="Calendar Icon" />
            SEE MORE
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
});

export default EventsSec;
