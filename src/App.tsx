import { Routes, Route } from "react-router";
import { useEffect } from "react";
import { useThemeStore } from "./stores/themeStore";
import Home from "./pages/Home";
import Exam from "./pages/Exam";
import Results from "./pages/Results";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FloatingTimer from "./components/FloatingTimer";

export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam/:type" element={<Exam />} />
        <Route path="/results" element={<Results />} />
        <Route path="/community" element={<Community />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingTimer />
    </>
  );
}
