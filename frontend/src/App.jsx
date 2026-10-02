import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routers from "./routes/Routers";

function App() {
  const { pathname, hash } = useLocation();

  // BrowserRouter never resets the scroll position, so each new page used to
  // open at the offset of the previous one. Reset it when the page changes
  // (not when only ?tab= changes) and let #anchors keep working.
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <div>
      <Routers />
    </div>
  );
}

export default App;