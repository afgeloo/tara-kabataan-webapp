import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../header";
import Footer from "../footer";
import "./singleblog.css";
import silverPencil from "../assets/logos/silverPencil.png";
import silverTime from "../assets/logos/silverTime.jpg";
import attachIcon from "../assets/logos/attachicon.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Blog {
  blog_id: string;
  title: string;
  content: string;
  image_url: string;
  category: string;
  created_at: string;
  author: string;
}

export default function SingleBlog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [moreImages, setMoreImages] = useState<string[]>([]);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);
  const sessionRestored = useRef(false);

  // fetch main blog
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/blogs.php?blog_id=${id}`
        );
        const data = await res.json();
        if (data?.blog_id) setBlog(data);
        else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // fetch more images
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/get_blog_images.php?blog_id=${id}`
        );
        const { success, images } = await res.json();
        if (success && Array.isArray(images)) setMoreImages(images);
      } catch {
        // ignore
      }
    })();
  }, [id]);

  // scroll restoration
  useEffect(() => {
    if (!loading && !sessionRestored.current) {
      const savedY = sessionStorage.getItem("singleBlogScrollY");
      if (savedY) window.scrollTo(0, +savedY);
      sessionRestored.current = true;
      sessionStorage.removeItem("singleBlogScrollY");
    }
  }, [loading]);

  // copy link
  const copyBlogLink = useCallback(async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Link copied!");
    }
  }, []);

  // memoize formatted content & date
  const formattedContent = useMemo(() => {
    return blog
      ? blog.content.replace(/\n/g, "<br>").replace(/  /g, " &nbsp;")
      : "";
  }, [blog]);

  const formattedDate = useMemo(() => {
    return blog
      ? new Date(blog.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  }, [blog]);

  if (notFound) return <div className="single-blog-not-found">Blog does not exist.</div>;
  if (loading || !blog) return null;

  const getFullImageUrl = (path: string) => {
    return path.startsWith("/")
      ? `${import.meta.env.VITE_API_BASE_URL}${path}`
      : `${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-webapp/uploads/blogs-images/${path}`;
  };

  return (
    <div className="single-blog-container">
      <Header />
      <main className="single-blog-main">
        <button
          className="back-button"
          onClick={() => {
            sessionStorage.setItem("singleBlogScrollY", window.scrollY.toString());
            navigate(-1);
          }}
        >
          ← Go Back
        </button>
        <div className="single-blog-image-wrapper">
          <img
            src={getFullImageUrl(blog.image_url)}
            alt={blog.title}
            className="single-blog-image"
            loading="lazy"
            style={{ cursor: "zoom-in" }}
            onClick={() => setFullImageUrl(getFullImageUrl(blog.image_url))}
          />
        </div>
        {moreImages.length > 0 && (
          <div className="blog-more-image-grid">
            {moreImages.slice(0, 4).map((img, i) => {
              const isLast = i === 3 && moreImages.length > 4;
              return (
                <div key={i} className="blog-image-preview">
                  <img
                    src={getFullImageUrl(img)}
                    alt={`More ${i}`}
                    loading="lazy"
                    style={{ cursor: "zoom-in" }}
                    onClick={() => setFullImageUrl(getFullImageUrl(img))}
                  />
                  {isLast && (
                    <div className="blog-image-overlay" onClick={() => setShowAllImagesModal(true)}>
                      +{moreImages.length - 3}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="single-blog-info">
          <h1 className="single-blog-title">{blog.title}</h1>
          <div className="single-blog-meta">
            <div className="single-blog-meta-item">
              <span className="single-blog-category">{blog.category}</span>
              <img src={silverTime} alt="Time" className="single-blog-icon" />
              <span>{formattedDate}</span>
            </div>
            <div className="single-blog-meta-item">
              <img src={silverPencil} alt="Author" className="single-blog-icon" />
              <span>{blog.author}</span>
            </div>
            <button className="single-blog-copy-link" onClick={copyBlogLink}>
              <img src={attachIcon} alt="Copy" />
              <span>Copy Blog Link</span>
            </button>
          </div>
          <div
            className="single-blog-content"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>

        {showAllImagesModal && (
          <div className="blog-gallery-modal">
            <div className="blog-gallery-overlay" onClick={() => setShowAllImagesModal(false)} />
            <div className="blog-gallery-wrapper">
              <button className="blog-gallery-close" onClick={() => setShowAllImagesModal(false)}>
                ✕
              </button>
              <div className="blog-gallery-grid">
                {moreImages.map((img, idx) => (
                  <div key={idx} className="blog-gallery-thumb">
                    <img
                      src={getFullImageUrl(img)}
                      alt={`Gallery ${idx}`}
                      loading="lazy"
                      onClick={() => setFullImageUrl(getFullImageUrl(img))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {fullImageUrl && (
          <div className="blog-fullscreen-viewer">
            <div className="blog-fullscreen-backdrop" onClick={() => setFullImageUrl(null)} />
            <img src={fullImageUrl} alt="Fullscreen" className="blog-fullscreen-image" />
            <button className="blog-fullscreen-exit" onClick={() => setFullImageUrl(null)}>
              ✕
            </button>
          </div>
        )}
      </main>

      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        className="custom-toast-container"
        toastClassName="custom-toast"
        limit={1}
      />

      <Footer />
    </div>
  );
}
