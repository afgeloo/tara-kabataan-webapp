import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../header";
import Footer from "../footer";
import Preloader from "../preloader";
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

function SingleBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false); 
  const [moreImages, setMoreImages] = useState<string[]>([]);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);
  const [restoringScroll, setRestoringScroll] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/blogs.php?blog_id=${id}`);
        const data = await response.json();
        if (data && data.blog_id) {
          setBlog(data);
        } else {
          setNotFound(true);
          console.error("No blog found");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const fetchMoreImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/get_blog_images.php?blog_id=${id}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.images)) {
          setMoreImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching more blog images:", error);
      }
    };
  
    if (id) {
      fetchMoreImages();
    }
  }, [id]);  

  const copyBlogLink = async () => {
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
  
  useEffect(() => {
    if (!loading && blog) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
          setRestoringScroll(false);
        }, 500); 
      });
    }
  }, [loading, blog]);  

  if (loading || restoringScroll) return <Preloader />;
  if (notFound) return <div className="single-blog-not-found">Blog does not exist.</div>;
  if (!blog) return null;

  function formatContent(content: string) {
    return content
      .replace(/\n/g, "<br>") 
      .replace(/  /g, " &nbsp;"); 
  }  

  const getFullImageUrl = (path: string): string => {
    return path.startsWith("/") 
      ? `http://localhost${path}` 
      : `http://localhost/tara-kabataan/tara-kabataan-webapp/uploads/blogs-images/${path}`;
  };  

  return (
    <div className="single-blog-container">
      <Header />
      <main className="single-blog-main">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>
          <div className="single-blog-image-wrapper">
            <img
              src={getFullImageUrl(blog.image_url)}
              alt={blog.title}
              className="single-blog-image"
            />
          </div>
        {moreImages.length > 0 && (
        <div className="blog-more-image-grid">
          {[...moreImages]
            .slice(0, 4)
            .map((img, i) => {
              const isLast = i === 3 && moreImages.length > 4;
              return (
                <div key={i} className="blog-image-preview">
                  <img
                    src={getFullImageUrl(img)}
                    alt={`More Image ${i}`}
                    onClick={() => setFullImageUrl(getFullImageUrl(img))}
                    style={{ cursor: "zoom-in" }}
                  />
                  {isLast && (
                    <div
                      className="blog-image-overlay"
                      onClick={() => setShowAllImagesModal(true)}
                    >
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
              <img src={silverTime} alt="Time Icon" className="single-blog-icon" />
              <span>{new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="single-blog-meta-item">
              <img src={silverPencil} alt="Author Icon" className="single-blog-icon" />
              <span>{blog.author}</span>
            </div>
            <button className="single-blog-copy-link" onClick={copyBlogLink}>
              <img src={attachIcon} alt="Copy Link" />
              <span>{copied ? "Link Copied!" : "Copy Blog Link"}</span>
            </button>
          </div>
          <div
            className="single-blog-content"
            dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
          ></div>
        </div>
        {showAllImagesModal && (
          <div className="blog-gallery-modal">
            <div className="blog-gallery-overlay" onClick={() => setShowAllImagesModal(false)}></div>
            <div className="blog-gallery-wrapper">
              <button className="blog-gallery-close" onClick={() => setShowAllImagesModal(false)}>✕</button>

              <div className="blog-gallery-grid">
                {moreImages.map((img, index) => (
                  <div key={index} className="blog-gallery-thumb">
                    <div
                      className="thumb-image-wrapper"
                      onClick={() => setFullImageUrl(getFullImageUrl(img))}
                    >
                      <img src={getFullImageUrl(img)} alt={`More Image ${index}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {fullImageUrl && (
          <div className="blog-fullscreen-viewer">
            <div className="blog-fullscreen-backdrop" onClick={() => setFullImageUrl(null)}></div>
            <img src={fullImageUrl} alt="Fullscreen" className="blog-fullscreen-image" />
            <button className="blog-fullscreen-exit" onClick={() => setFullImageUrl(null)}>✕</button>
          </div>
        )}
      </main>
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
      <Footer />
    </div>
  );
}

export default SingleBlog;
