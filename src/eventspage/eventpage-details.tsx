import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState, MouseEvent, FormEvent } from "react";
import { formatDateDetails, convertTo12HourFormat } from "./mockServer";
import { ToastContainer, toast } from "react-toastify";
import "./css/eventdetails.css";
import "./css/eventpage-rsvp.css";
import Header from "../header";
import Footer from "../footer";
import Preloader from "../preloader";
import locationIcon from "../assets/eventspage/Location-eventspage.png";
import attachIcon from "../assets/logos/attachicon.jpg";

export interface Event {
  event_id: string;
  event_image: string;
  event_category: string;
  event_title: string;
  event_date: string;
  event_day: string;
  event_start_time: string;
  event_end_time: string;
  event_venue: string;
  event_content: string;
  event_speakers: string;
  event_status: string;
  created_at: string;
  event_going: number;
  map_url: string;
}

function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from");
  const [event, setEvent] = useState<Event | null>(null);
  const [canCopy, setCanCopy] = useState(true);
  const [loading, setLoading] = useState(true);

  // inside EventDetails()
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    expectations: "",
  });

  const openModal = (e: MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("No event selected");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost/tara-kabataan/tara-kabataan-backend/api/event_participants.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: id,
            ...formData,
          }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        console.error("RSVP error:", txt);
        toast.error("Registration failed");
        return;
      }
      const json = await res.json();
      if (json.success) {
        toast.success("Registered successfully!");
        closeModal();
      } else {
        toast.error(json.error || "Registration failed");
      }
    } catch (err) {
      console.error("Network or JSON error:", err);
      toast.error("Network error. Please try again.");
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          "http://localhost/tara-kabataan/tara-kabataan-backend/api/events.php"
        );
        const data = await response.json();
        const selected = data.find((e: Event) => e.event_id === id);
        setEvent(selected || null);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching event:", error);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const copyEventLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Link copied");
    }
  };

  if (loading || !event) {
    return <Preloader />;
  }

  const imageUrl = `http://localhost/${event.event_image}`;

  function formatContent(content: string) {
    if (!content) return "";
    return content.replace(/\n/g, "<br>").replace(/  /g, " &nbsp;");
  }

  if (loading || !event) return <Preloader />;

  return (
    <div className="event-details">
      <Header />
      <div className="event-details-page">
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
        <div className="event-details-grid">
          <div className="event-details-left">
            <img src={imageUrl} alt="Event" className="event-details-image" />
            <div className="event-details-info">
              <div className="event-detail-section-going">
                {(() => {
                  const status = event.event_status.toLowerCase();
                  const label =
                    status === "upcoming" || status === "ongoing"
                      ? "Event Going"
                      : "Attendees";
                  return (
                    <>
                      <p className="event-info-label-going">{label}:</p>
                      <p className="event-info-value-going">
                        {event.event_going}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div className="event-detail-section">
                <p className="event-info-label">Speakers</p>
                <br />
                <div
                  className="event-info-value"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(
                      event.event_speakers || "To be announced"
                    ),
                  }}
                ></div>
              </div>
              <div className="event-detail-section">
                <p className="event-info-label">Category</p>
                <p className="event-info-category">{event.event_category}</p>
              </div>
              <div className="event-detail-section">
                <p className="event-info-label">Location</p>
                <p className="event-info-value">{event.event_venue}</p>
                <div className="event-map">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.event_venue)}&z=18&output=embed`}
                    width="100%"
                    height="250"
                    loading="lazy"
                    style={{ border: "0", borderRadius: "10px" }}
                  ></iframe>
                </div>
              </div>
            </div>
            {event.event_status.toLowerCase() === "upcoming" && (
              <div className="event-detail-section">
                <button className="event-rsvp-button" onClick={openModal}>
                  RSVP
                </button>
              </div>
            )}
            {showModal && (
              <div className="event-rsvp-modal-overlay" onClick={closeModal}>
                <div
                  className="event-rsvp-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2>REGISTER</h2>
                  <form onSubmit={handleSubmit} className="event-rsvp-form">
                    <label>
                      Name
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="event-rsvp-form-input"
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="event-rsvp-form-input"
                      />
                    </label>
                    <label>
                      Contact No.
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        className="event-rsvp-form-input"
                      />
                    </label>
                    <label>
                      What to Expect
                      <textarea
                        name="expectations"
                        value={formData.expectations}
                        onChange={handleChange}
                        rows={4}
                        className="event-rsvp-form-textarea"
                      />
                    </label>
                    <div className="event-rsvp-form-actions">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="event-rsvp-form-btn event-rsvp-form-btn-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="event-rsvp-form-btn event-rsvp-form-btn-submit"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          <div className="event-details-right">
            <h1 className="event-details-title">{event.event_title}</h1>
            <p className="event-details-date">
              {formatDateDetails(event.event_date)}, {event.event_day}
            </p>
            <p className="event-details-time">
              {convertTo12HourFormat(event.event_start_time)} -{" "}
              {convertTo12HourFormat(event.event_end_time)}
            </p>
            <div className="event-about-header">
              <span>About the Event</span>
              <div className="copy-link" onClick={copyEventLink}>
                <img src={attachIcon} alt="Copy link" />
              </div>
            </div>
            <div className="event-divider"></div>
            <div
              className="event-about"
              dangerouslySetInnerHTML={{ __html: event.event_content }}
            ></div>
          </div>
        </div>
        {showModal && (
          <div className="event-rsvp-modal-overlay" onClick={closeModal}>
            <div
              className="event-rsvp-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>REGISTER</h2>
              <form onSubmit={handleSubmit} className="event-rsvp-form">
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="event-rsvp-form-input"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="event-rsvp-form-input"
                  />
                </label>
                <label>
                  Contact No.
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="event-rsvp-form-input"
                  />
                </label>
                <label>
                  What to Expect
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleChange}
                    rows={4}
                    className="event-rsvp-form-textarea"
                  />
                </label>
                <div className="event-rsvp-form-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="event-rsvp-form-btn event-rsvp-form-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="event-rsvp-form-btn event-rsvp-form-btn-submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover
          className="custom-toast-container"
          toastClassName="custom-toast"
          limit={1}
        />
      </div>
      <Footer />
    </div>
  );
}

export default EventDetails;
