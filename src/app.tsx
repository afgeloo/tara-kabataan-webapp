import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Preloader from "./preloader";
import Chatbot from "./chatbot";
import GoToTop from "./gototop";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // detect actual page nav vs. client routing
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navEntries.length
      ? navEntries[0].type
      : // fallback for older browsers
        (performance as any).navigation?.type === 1
        ? "reload"
        : "navigate";

    if (navType === "reload" || navType === "navigate") {
      // full refresh or first real load → show preloader
      setLoading(true);
      const MIN_LOAD_TIME = 3000;
      const startTime = performance.now();

      const handleLoad = () => {
        const elapsed = performance.now() - startTime;
        const delay = Math.max(0, MIN_LOAD_TIME - elapsed);
        requestAnimationFrame(() => setTimeout(() => setLoading(false), delay));
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad, { once: true });
        return () => window.removeEventListener("load", handleLoad);
      }
    } else {
      // client-side route change → skip preloader
      setLoading(false);
    }
  }, []);

  // scroll to top on each route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (loading) return <Preloader />;

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Outlet />
      {!isAdmin && <Chatbot />}
      {!isAdmin && <GoToTop />}
    </>
  );
};

export default App;
