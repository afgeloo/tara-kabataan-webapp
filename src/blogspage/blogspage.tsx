import { useEffect, useState, useRef } from "react";
import Footer from "../footer";
import Header from "../header";
import "./blogspage.css";
import timeiconwhite from "../assets/logos/time.png";
import authoriconwhite from "../assets/logos/authorwhiteicon.png";
import timeblack from "../assets/logos/timeblack.png";
import authorblack from "../assets/logos/pencilblack.jpg";
import { useNavigate } from "react-router-dom";
import Preloader from "../preloader";
import searchIconEventspage from "../assets/eventspage/Search-icon-events.png";

interface Blog {
  blog_id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
  author: string;
  blog_status?: string;
}

const getSafeImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? `http://localhost${url}` : url;
};

function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [pinnedBlogs, setPinnedBlogs] = useState<Blog[]>([]);
  const sessionRestored = useRef(false);
  const [restoringScroll, setRestoringScroll] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem("blogCategory") || "ALL";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem("blogSearchQuery") || "";
  }); 
  const [showAllBlogs, setShowAllBlogs] = useState(() => {
    return sessionStorage.getItem("blogShowAll") === "true";
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleBlogClick = (blog_id: string) => {
    navigate(`/blog/${blog_id}`);
  };

  const categories = ["ALL", "KALUSUGAN", "KALIKASAN", "KARUNUNGAN", "KULTURA", "KASARIAN"];
  const pinnedBlogIds = new Set(pinnedBlogs.map((blog) => blog.blog_id));
  const filteredBlogs = blogs.filter(
    (blog) =>
      !pinnedBlogIds.has(blog.blog_id) &&
      blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayedBlogs = showAllBlogs ? filteredBlogs : filteredBlogs.slice(0, 4);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost/tara-kabataan/tara-kabataan-backend/api/blogs.php?category=ALL`
      );
      const data = await response.json();
  
      if (data && data.pinned && data.blogs) {
        const publishedBlogs = data.blogs.filter((blog: Blog) =>
          blog.blog_status?.toUpperCase() === "PUBLISHED"
        );
  
        const mergedBlogs = [...data.pinned, ...publishedBlogs];
  
        setPinnedBlogs(data.pinned); 
        setAllBlogs(mergedBlogs);
        setBlogs(mergedBlogs);
      } else {
        console.error("Unexpected API response format:", data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setLoading(false);
    }
  };  

  useEffect(() => {
    const savedCategory = sessionStorage.getItem("blogCategory");
    const savedSearch = sessionStorage.getItem("blogSearchQuery");
    const savedShowAll = sessionStorage.getItem("blogShowAll");
  
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedSearch) setSearchQuery(savedSearch);
    if (savedShowAll) setShowAllBlogs(savedShowAll === "true");
  
    sessionRestored.current = true;
  
    fetchBlogs(); 
  }, []);
  
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("blogScrollY");
  
    if (!loading && blogs.length > 0) {
      if (savedScroll) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(savedScroll), behavior: "auto" });
  
            sessionStorage.removeItem("blogScrollY");
            sessionStorage.removeItem("blogCategory");
            sessionStorage.removeItem("blogSearchQuery");
            sessionStorage.removeItem("blogShowAll");
  
            setRestoringScroll(false);
          }, 500);
        });
      } else {
        setRestoringScroll(false);
      }
    }
  }, [loading, blogs]);   

  useEffect(() => {
    setBlogs(
      selectedCategory === "ALL"
        ? allBlogs
        : allBlogs.filter((blog) => blog.category === selectedCategory)
    );
  }, [selectedCategory, allBlogs]);  

  useEffect(() => {
    if (displayedBlogs.length > 0 && !loading) {
      const equalizeRowHeights = () => {
        const items = Array.from(document.querySelectorAll(".blogs-page-blog-item"));
        items.forEach((item) => ((item as HTMLElement).style.height = "auto"));
        for (let i = 0; i < items.length; i += 2) {
          const row = items.slice(i, i + 2);
          const maxHeight = Math.max(...row.map((el) => (el as HTMLElement).offsetHeight));
          row.forEach((el) => ((el as HTMLElement).style.height = `${maxHeight}px`));
        }
      };

      setTimeout(equalizeRowHeights, 100);
      window.addEventListener("resize", equalizeRowHeights);
      return () => window.removeEventListener("resize", equalizeRowHeights);
    }
  }, [displayedBlogs, loading, showAllBlogs]);

  return (
    <div className="blogs-page">
      <Header />
      {pinnedBlogs.length > 0 && (
        <>
          <div className="blogs-page-pinned-header">
            <h2>{pinnedBlogs.length === 1 ? "Pinned Blog" : "Pinned Blogs"}</h2>
          </div>
          <div className="blogs-page-pinned-blogs">
            {pinnedBlogs.length === 1 && (
              <div className="blogs-page-pinned-container blogs-page-pinned-single">
                <div
                  className="blogs-page-pinned-full"
                  style={{ "--bg-image": `url(${getSafeImageUrl(pinnedBlogs[0].image_url)})` } as React.CSSProperties}
                  onClick={() => {
                    sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                    sessionStorage.setItem("blogCategory", selectedCategory);
                    sessionStorage.setItem("blogSearchQuery", searchQuery);
                    sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                    handleBlogClick(pinnedBlogs[0].blog_id);
                  }}  
                >
                  <div className="blogs-page-pinned-overlay">
                    <p className="blogs-page-pinned-category-1">{pinnedBlogs[0].category}</p>
                    <h3 className="blogs-page-pinned-title-1">{pinnedBlogs[0].title}</h3>
                    <p className="blogs-page-pinned-meta-1">
                      <img src={timeiconwhite} className="blogs-page-timeiconwhite" />
                      {new Date(pinnedBlogs[0].created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <img src={authoriconwhite} className="blogs-page-authoriconwhite" />
                      {pinnedBlogs[0].author}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {pinnedBlogs.length === 2 && (
              <div className="blogs-page-pinned-container blogs-page-pinned-double">
                {pinnedBlogs.map((blog) => (
                  <div
                    key={blog.blog_id}
                    className="blogs-page-pinned-half"
                    style={{ "--bg-image": `url(${getSafeImageUrl(blog.image_url)})` } as React.CSSProperties}
                    onClick={() => {
                      sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                      sessionStorage.setItem("blogCategory", selectedCategory);
                      sessionStorage.setItem("blogSearchQuery", searchQuery);
                      sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                      handleBlogClick(blog.blog_id);
                    }}                    
                  >
                    <div className="blogs-page-pinned-overlay">
                      <p className="blogs-page-pinned-category-1">{blog.category}</p>
                      <h3 className="blogs-page-pinned-title-1">{blog.title}</h3>
                      <p className="blogs-page-pinned-meta-1">
                        <img src={timeiconwhite} className="blogs-page-timeiconwhite" />
                        {new Date(blog.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        <img src={authoriconwhite} className="blogs-page-authoriconwhite" />
                        {blog.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pinnedBlogs.length >= 3 && (
              <div className="blogs-page-pinned-container">
                <div
                  className="blogs-page-pinned-main"
                  style={{ "--bg-image": `url(${getSafeImageUrl(pinnedBlogs[0].image_url)})` } as React.CSSProperties}
                  onClick={() => {
                    sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                    sessionStorage.setItem("blogCategory", selectedCategory);
                    sessionStorage.setItem("blogSearchQuery", searchQuery);
                    sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                    handleBlogClick(pinnedBlogs[0].blog_id);
                  }}  
                >
                  <div className="blogs-page-pinned-overlay">
                    <p className="blogs-page-pinned-category-1">{pinnedBlogs[0].category}</p>
                    <h3 className="blogs-page-pinned-title-1">{pinnedBlogs[0].title}</h3>
                    <p className="blogs-page-pinned-meta-1">
                      <img src={timeiconwhite} className="blogs-page-timeiconwhite" />
                      {new Date(pinnedBlogs[0].created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <img src={authoriconwhite} className="blogs-page-authoriconwhite" />
                      {pinnedBlogs[0].author}
                    </p>
                  </div>
                </div>
                <div className="blogs-page-pinned-side">
                  {pinnedBlogs.slice(1, 3).map((blog) => (
                    <div
                      key={blog.blog_id}
                      className="blogs-page-pinned-item"
                      style={{ "--bg-image": `url(${getSafeImageUrl(blog.image_url)})` } as React.CSSProperties}
                      onClick={() => {
                        sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                        sessionStorage.setItem("blogCategory", selectedCategory);
                        sessionStorage.setItem("blogSearchQuery", searchQuery);
                        sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                        handleBlogClick(blog.blog_id);
                      }}      
                    >
                      <div className="blogs-page-pinned-overlay">
                        <p className="blogs-page-pinned-category-2">{blog.category}</p>
                        <h3 className="blogs-page-pinned-title-2">{blog.title}</h3>
                        <p className="blogs-page-pinned-meta-2">
                          <img src={timeiconwhite} className="blogs-page-timeiconwhite" />
                          {new Date(blog.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          <img src={authoriconwhite} className="blogs-page-authoriconwhite" />
                          {blog.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <div className="blogs-page-blog-categories">
      <h2 className="blogs-page-blogs-header" style={{ fontFamily: "'Bogart Trial', sans-serif" }}>
        Blogs
      </h2>
      <div className="blogs-category-dropdown-search-bar">
      <div className="blogs-category-buttons-desktop blogs-page-category-list">
        {categories.map((category) => (
          <span
            key={category}
            className={selectedCategory === category ? "active-category" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </span>
        ))}
      </div>
        <div className="blogs-category-dropdown-mobile">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="blogs-category-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="blog-searchbar-container">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blog-searchbar-input"
          />
          <img
            src={searchIconEventspage}
            alt="Search"
            className="blog-searchbar-icon"
          />
        </div>
      </div>
    </div>
      <hr className="blogs-page-Hr" />
      <div className="blogs-page-blogs-list">
      {loading || restoringScroll ? (
        <Preloader />
      ) : displayedBlogs.length > 0 ? (
          <div className="blogs-page-blogs-grid">
            {displayedBlogs.map((blog) => (
              <div key={blog.blog_id} className="blogs-page-blog-item">
                <img
                  src={getSafeImageUrl(blog.image_url)}
                  alt={blog.title}
                  onClick={() => {
                    sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                    sessionStorage.setItem("blogCategory", selectedCategory);
                    sessionStorage.setItem("blogSearchQuery", searchQuery);
                    sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                    handleBlogClick(blog.blog_id);
                  }}      
                  style={{ cursor: "pointer" }}
                />
                <div className="blogs-page-pinned-overlay">
                  <p className="blogs-page-pinned-category-3">{blog.category}</p>
                  <h3
                    className="blogs-page-pinned-title-3"
                    onClick={() => {
                      sessionStorage.setItem("blogScrollY", window.scrollY.toString());
                      sessionStorage.setItem("blogCategory", selectedCategory);
                      sessionStorage.setItem("blogSearchQuery", searchQuery);
                      sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
                      handleBlogClick(blog.blog_id);
                    }}      
                    style={{ cursor: "pointer" }}
                  >
                    {blog.title}
                  </h3>
                  <p className="blogs-page-pinned-meta-3">
                    <img src={timeblack} className="blogs-page-time-black" />
                    {new Date(blog.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <img src={authorblack} className="blogs-page-author-black" />
                    {blog.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-blogs-container">
            <p>No blogs found.</p>
          </div>
        )}
      </div>
      {filteredBlogs.length > 4 && (
        <button className="blogs-page-see-more-btn" onClick={() => setShowAllBlogs(!showAllBlogs)}>
          {showAllBlogs ? "Show Less" : "See More"}
        </button>
      )}

      <Footer />
    </div>
  );
}

export default BlogsPage;
