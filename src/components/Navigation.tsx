
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Plus, Settings, Home, User } from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard", color: "green" },
    { path: "/sales-entry", icon: Plus, label: "Nova Venda", color: "emerald" },
    { path: "/configuration", icon: Settings, label: "Configurações", color: "green" }
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-full px-8 py-4 border-2 border-green-200">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 mr-4">
            <img 
              src="/lovable-uploads/91053ff3-b80e-46d3-bc7c-59736d93d8dd.png" 
              alt="NutraScore" 
              className="h-8 w-auto"
            />
            <span className="font-bold text-green-700 text-lg">NutraScore</span>
          </div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="lg"
                onClick={() => navigate(item.path)}
                className={`transition-all duration-300 hover:scale-105 font-medium ${
                  isActive 
                    ? `bg-green-600 text-white shadow-lg hover:bg-green-700` 
                    : `hover:bg-green-50 hover:text-green-700 text-green-600`
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
