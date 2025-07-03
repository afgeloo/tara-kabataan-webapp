import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import debounce from "lodash.debounce";

interface Blog {
  blog_id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
  author: string;
  blog_status?: string;
}

// helper to prefix your BASE_URL
const getSafeImageUrl = (url?: string | null) =>
  url
    ? url.startsWith("http") || url.startsWith("/")
      ? `${import.meta.env.VITE_API_BASE_URL}${url}`
      : url
    : "";

export default function BlogsPage() {
  const navigate = useNavigate();
  const sessionRestored = useRef(false);

  // persisted state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => sessionStorage.getItem("blogCategory") || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    () => sessionStorage.getItem("blogSearchQuery") || ""
  );
  const [showAllBlogs, setShowAllBlogs] = useState<boolean>(
    () => sessionStorage.getItem("blogShowAll") === "true"
  );

  // data + loading
  const [pinnedBlogs, setPinnedBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [restoringScroll, setRestoringScroll] = useState<boolean>(true);

  const categories = [
    "ALL",
    "KALUSUGAN",
    "KALIKASAN",
    "KARUNUNGAN",
    "KULTURA",
    "KASARIAN",
  ];

  // navigate & persist
  const goToBlog = useCallback(
    (id: string) => {
      sessionStorage.setItem("blogScrollY", window.scrollY.toString());
      sessionStorage.setItem("blogCategory", selectedCategory);
      sessionStorage.setItem("blogSearchQuery", searchQuery);
      sessionStorage.setItem("blogShowAll", JSON.stringify(showAllBlogs));
      navigate(`/blog/${id}`);
    },
    [navigate, selectedCategory, searchQuery, showAllBlogs]
  );

  // fetch once
  useEffect(() => {
    const savedY = sessionStorage.getItem("blogScrollY");
    if (savedY) {
      window.scrollTo({ top: parseInt(savedY, 10), behavior: "auto" });
      sessionStorage.removeItem("blogScrollY");
    }

    setLoading(true);
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/tara-kabataan/tara-kabataan-backend/api/blogs.php?category=ALL`
    )
      .then((res) => res.json())
      .then((data) => {
        // only published + pinned    
        const published = data.blogs.filter((b: Blog) =>
          b.blog_status?.toUpperCase() === "PUBLISHED"
        );
        setPinnedBlogs(data.pinned);
        const merged = [...data.pinned, ...published];
        setAllBlogs(merged);
        setBlogs(merged);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        sessionRestored.current = true;
      });
  }, []);

  // clear session flags
  useEffect(() => {
    if (!loading && sessionRestored.current) {
      sessionStorage.removeItem("blogCategory");
      sessionStorage.removeItem("blogSearchQuery");
      sessionStorage.removeItem("blogShowAll");
      setRestoringScroll(false);
    }
  }, [loading]);

  // category filter
  useEffect(() => {
    setBlogs(
      selectedCategory === "ALL"
        ? allBlogs
        : allBlogs.filter((b) => b.category === selectedCategory)
    );
  }, [selectedCategory, allBlogs]);

  // debounced search update
  const [searchFilter, setSearchFilter] = useState(searchQuery);
  const debouncedSet = useMemo(
    () =>
      debounce((next: string) => {
        setSearchFilter(next.toLowerCase());
        sessionStorage.setItem("blogSearchQuery", next);
      }, 300),
    []
  );
  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    debouncedSet(val);
  };

  // memoized lists
  const filteredBlogs = useMemo(() => {
    const pinnedSet = new Set(pinnedBlogs.map((b) => b.blog_id));
    return blogs.filter(
      (b) =>
        !pinnedSet.has(b.blog_id) &&
        b.title.toLowerCase().includes(searchFilter)
    );
  }, [blogs, pinnedBlogs, searchFilter]);

  const displayedBlogs = useMemo(
    () => (showAllBlogs ? filteredBlogs : filteredBlogs.slice(0, 4)),
    [filteredBlogs, showAllBlogs]
  );

  // remove JS height juggling: switch to CSS grid in blogspage.css

  return (
    <div className="blogs-page">
      <Header />

      {/* Pinned Blogs */}
      {pinnedBlogs.length > 0 && (
        <>
          <div className="blogs-page-pinned-header">
            <h2>
              {pinnedBlogs.length === 1 ? "Pinned Blog" : "Pinned Blogs"}
            </h2>
          </div>
          <div className="blogs-page-pinned-blogs">
            {pinnedBlogs.length === 1 && (
              <div className="blogs-page-pinned-container blogs-page-pinned-single">
                <div
                  className="blogs-page-pinned-full"
                  style={
                    {
                      "--bg-image": `url(${getSafeImageUrl(
                        pinnedBlogs[0].image_url
                      )})`,
                    } as React.CSSProperties
                  }
                  onClick={() => goToBlog(pinnedBlogs[0].blog_id)}
                >
                  <div className="blogs-page-pinned-overlay">
                    <p className="blogs-page-pinned-category-1">
                      {pinnedBlogs[0].category}
                    </p>
                    <h3 className="blogs-page-pinned-title-1">
                      {pinnedBlogs[0].title}
                    </h3>
                    <p className="blogs-page-pinned-meta-1">
                      <img
                        src={timeiconwhite}
                        className="blogs-page-timeiconwhite"
                      />
                      {new Date(
                        pinnedBlogs[0].created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <img
                        src={authoriconwhite}
                        className="blogs-page-authoriconwhite"
                      />
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
                    style={
                      {
                        "--bg-image": `url(${getSafeImageUrl(
                          blog.image_url
                        )})`,
                      } as React.CSSProperties
                    }
                    onClick={() => goToBlog(blog.blog_id)}
                  >
                    <div className="blogs-page-pinned-overlay">
                      <p className="blogs-page-pinned-category-1">
                        {blog.category}
                      </p>
                      <h3 className="blogs-page-pinned-title-1">
                        {blog.title}
                      </h3>
                      <p className="blogs-page-pinned-meta-1">
                        <img
                          src={timeiconwhite}
                          className="blogs-page-timeiconwhite"
                        />
                        {new Date(blog.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        <img
                          src={authoriconwhite}
                          className="blogs-page-authoriconwhite"
                        />
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
                  style={
                    {
                      "--bg-image": `url(${getSafeImageUrl(
                        pinnedBlogs[0].image_url
                      )})`,
                    } as React.CSSProperties
                  }
                  onClick={() => goToBlog(pinnedBlogs[0].blog_id)}
                >
                  <div className="blogs-page-pinned-overlay">
                    <p className="blogs-page-pinned-category-1">
                      {pinnedBlogs[0].category}
                    </p>
                    <h3 className="blogs-page-pinned-title-1">
                      {pinnedBlogs[0].title}
                    </h3>
                    <p className="blogs-page-pinned-meta-1">
                      <img
                        src={timeiconwhite}
                        className="blogs-page-timeiconwhite"
                      />
                      {new Date(
                        pinnedBlogs[0].created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <img
                        src={authoriconwhite}
                        className="blogs-page-authoriconwhite"
                      />
                      {pinnedBlogs[0].author}
                    </p>
                  </div>
                </div>
                <div className="blogs-page-pinned-side">
                  {pinnedBlogs.slice(1, 3).map((blog) => (
                    <div
                      key={blog.blog_id}
                      className="blogs-page-pinned-item"
                      style={
                        {
                          "--bg-image": `url(${getSafeImageUrl(
                            blog.image_url
                          )})`,
                        } as React.CSSProperties
                      }
                      onClick={() => goToBlog(blog.blog_id)}
                    >
                      <div className="blogs-page-pinned-overlay">
                        <p className="blogs-page-pinned-category-2">
                          {blog.category}
                        </p>
                        <h3 className="blogs-page-pinned-title-2">
                          {blog.title}
                        </h3>
                        <p className="blogs-page-pinned-meta-2">
                          <img
                            src={timeiconwhite}
                            className="blogs-page-timeiconwhite"
                          />
                          {new Date(blog.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                          <img
                            src={authoriconwhite}
                            className="blogs-page-authoriconwhite"
                          />
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

      {/* Category + Search */}
      <div className="blogs-page-blog-categories">
        <h2
          className="blogs-page-blogs-header"
          style={{ fontFamily: "'Bogart Trial', sans-serif" }}
        >
          Blogs
        </h2>
        <div className="blogs-category-dropdown-search-bar">
          <div className="blogs-category-buttons-desktop blogs-page-category-list">
            {categories.map((cat) => (
              <span
                key={cat}
                className={selectedCategory === cat ? "active-category" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="blogs-category-dropdown-mobile">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="blogs-category-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="blog-searchbar-container">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Blog Grid */}
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
                  onClick={() => goToBlog(blog.blog_id)}
                  loading="lazy"
                  style={{ cursor: "pointer" }}
                />
                <div className="blogs-page-pinned-overlay">
                  <p className="blogs-page-pinned-category-3">
                    {blog.category}
                  </p>
                  <h3
                    className="blogs-page-pinned-title-3"
                    onClick={() => goToBlog(blog.blog_id)}
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
                    <img
                      src={authorblack}
                      className="blogs-page-author-black"
                    />
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
        <button
          className="blogs-page-see-more-btn"
          onClick={() => setShowAllBlogs(!showAllBlogs)}
        >
          {showAllBlogs ? "Show Less" : "See More"}
        </button>
      )}

      <Footer />
    </div>
  );
}
