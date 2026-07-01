import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Overview from "./pages/Overview";
import ChurnPredictor from "./pages/ChurnPredictor";
import ChargesPredictor from "./pages/ChargesPredictor";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

const PAGES = {
  overview: Overview,
  churn: ChurnPredictor,
  charges: ChargesPredictor,
  leaderboard: Leaderboard,
};

export default function App() {
  const [active, setActive] = useState("overview");
  const Page = PAGES[active];

  return (
    <div className="app-shell">
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-orange" />
        <div className="bg-orb bg-orb-teal" />
        <div className="bg-orb bg-orb-gold" />
      </div>
      <Sidebar active={active} onSelect={setActive} />
      <main className="app-main">
        <Topbar />
        <Page />
      </main>
    </div>
  );
}
