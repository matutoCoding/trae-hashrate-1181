import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Waitlist from "@/pages/Waitlist";
import Recommend from "@/pages/Recommend";
import Archive from "@/pages/Archive";
import { startTimeoutChecker, stopTimeoutChecker } from "@/utils/scheduler";

export default function App() {
  useEffect(() => {
    startTimeoutChecker(10000);
    return () => {
      stopTimeoutChecker();
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
