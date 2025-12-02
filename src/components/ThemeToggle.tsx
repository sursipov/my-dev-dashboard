import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ThemeToggle() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (!savedTheme) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSettingsClick}
      className="glass glass-hover rounded-full"
      title="Настройки"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
}