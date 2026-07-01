import { useEffect, useRef, useState } from "react";

export default function Topbar() {
  const [openMenu, setOpenMenu] = useState(null); // "bell" | "profile" | null
  const [toast, setToast] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    function onEscape(e) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const showToast = (message) => {
    setToast(message);
    setOpenMenu(null);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="topbar topbar-end" ref={wrapRef}>
      {toast && <div className="toast">{toast}</div>}

      <div className="topbar-right">
        <div className="dropdown-wrap">
          <button
            className="pill bell-btn"
            onClick={() => setOpenMenu((m) => (m === "bell" ? null : "bell"))}
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3a4.5 4.5 0 00-4.5 4.5c0 3-1.5 4.5-1.5 4.5h12s-1.5-1.5-1.5-4.5A4.5 4.5 0 0010 3zM8.5 15a1.5 1.5 0 003 0"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span className="bell-dot" />
          </button>
          {openMenu === "bell" && (
            <div className="dropdown-panel">
              <div className="dropdown-header">Notifications</div>
              <div className="dropdown-empty">You're all caught up.</div>
            </div>
          )}
        </div>

        <div className="dropdown-wrap">
          <button
            className="pill user-pill"
            onClick={() => setOpenMenu((m) => (m === "profile" ? null : "profile"))}
          >
            <div className="user-avatar">RA</div>
            <div>
              <div className="user-name">Retention Analyst</div>
              <div className="user-role">Growth team</div>
            </div>
          </button>
          {openMenu === "profile" && (
            <div className="dropdown-panel dropdown-panel-right">
              <button className="dropdown-item" onClick={() => showToast("Settings coming soon")}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3L4.9 4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Settings
              </button>
              <button className="dropdown-item" onClick={() => showToast("Signed out (demo)")}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 17.5H4a1 1 0 01-1-1v-13a1 1 0 011-1h3.5M13 14l4-4-4-4M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
