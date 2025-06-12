import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, Users, Settings, Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/sales-entry", icon: Plus, label: "Nova Venda" },
    { path: "/seller-management", icon: Users, label: "Vendedores" },
    { path: "/configuration", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 h-[80px] bg-primary-green shadow-md"> {/* Updated background */}
      {/* Left Section: Logo and App Name */}
      <div className="flex items-center space-x-3">
        <img
          src="/lovable-uploads/91053ff3-b80e-46d3-bc7c-59736d93d8dd.png"
          alt="NutraManager Logo"
          className="h-10 w-auto" // Adjusted height for 80px bar
        />
        <h1 className="text-xl font-bold text-white">Sales Performance Dashboard</h1>
      </div>

      {/* Center Section: Navigation Icons */}
      <nav className="flex items-center space-x-2">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" // Using ghost variant for icon buttons
                    size="icon" // Using icon size
                    onClick={() => navigate(item.path)}
                    className={`p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-green focus:ring-white
                      ${isActive
                        ? "bg-black/20 text-white"
                        : "text-white hover:bg-black/10"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-800 text-white border-gray-700">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Right Section: Notification Bell and User Avatar */}
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/10 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-green focus:ring-white">
                <Bell className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white border-gray-700">
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/10 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-green focus:ring-white">
                <UserCircle className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white border-gray-700">
              <p>Perfil do Usuário</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
