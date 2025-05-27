
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Plus, Settings, Home } from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard", color: "emerald" },
    { path: "/sales-entry", icon: Plus, label: "New Sale", color: "blue" },
    { path: "/configuration", icon: Settings, label: "Settings", color: "purple" }
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-6 py-3 border border-emerald-200">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? `bg-${item.color}-600 text-white shadow-md` 
                    : `hover:bg-${item.color}-50 hover:text-${item.color}-600`
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
