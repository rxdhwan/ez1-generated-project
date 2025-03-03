import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { 
  Briefcase, 
  User, 
  Search, 
  FileText, 
  BarChart, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState<"job-seeker" | "employer" | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and get role from localStorage
    const storedRole = localStorage.getItem("userRole") as "job-seeker" | "employer" | null;
    setUserRole(storedRole);

    // Handle responsive sidebar
    const checkScreenSize = () => {
      const isMobileScreen = window.innerWidth < 1024;
      setIsMobile(isMobileScreen);
      setIsSidebarOpen(!isMobileScreen);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Navigation items based on user role
  const getNavItems = () => {
    if (!userRole) return [];

    const commonItems = [
      { name: "Dashboard", path: "/dashboard", icon: BarChart },
      { name: "Profile", path: "/profile", icon: User },
      { name: "Settings", path: "/settings", icon: Settings },
    ];

    if (userRole === "job-seeker") {
      return [
        ...commonItems,
        { name: "Jobs", path: "/jobs", icon: Briefcase },
        { name: "My CV", path: "/profile/cv", icon: FileText },
      ];
    } else {
      return [
        ...commonItems,
        { name: "Post Job", path: "/post-job", icon: Briefcase },
        { name: "Applicants", path: "/company/applicants", icon: Search },
      ];
    }
  };

  const navItems = getNavItems();

  // If not authenticated and not on auth pages, show only minimal layout
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";
  const isLandingPage = location.pathname === "/";
  const showSidebar = userRole && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {showSidebar && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-accent"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <a 
              href="/" 
              className="flex items-center gap-2 font-bold text-lg"
            >
              <Briefcase className="h-5 w-5" />
              <span>CryptoJobs</span>
            </a>
          </div>

          {!userRole && !isAuthPage && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/signin")}
                className="text-sm font-medium hover:underline"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate("/signup")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          {userRole && (
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-accent">
                <Settings size={20} />
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem("userRole");
                  navigate("/");
                  setUserRole(null);
                }}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {userRole === "job-seeker" ? "JS" : "EM"}
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside 
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-40 mt-16 w-64 transform border-r border-border/40 bg-sidebar backdrop-blur-xs transition-transform duration-300 ease-in-out lg:static lg:mt-0 lg:translate-x-0`}
          >
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main 
          className={`flex-1 overflow-auto ${
            showSidebar && isSidebarOpen ? "lg:ml-64" : ""
          }`}
        >
          <div className="container py-6 px-4 md:px-6 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default MainLayout;
