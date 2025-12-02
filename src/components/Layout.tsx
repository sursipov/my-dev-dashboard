import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FolderKanban, FileText, Calendar, Target } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('home'), path: "/" },
    { icon: FolderKanban, label: t('projects'), path: "/projects" },
    { icon: FileText, label: t('notes'), path: "/notes" },
    { icon: Calendar, label: t('planning'), path: "/planning" },
    { icon: Target, label: t('goals'), path: "/goals" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity cursor-pointer"
          >
            SursipFlow
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:left-0 md:bottom-0 md:w-20 z-40">
        <div className="glass h-full p-4 md:pt-24">
          <div className="flex md:flex-col justify-around items-center h-full gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs hidden md:block">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}