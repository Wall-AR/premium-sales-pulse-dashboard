
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SalesEntry from "./pages/SalesEntry";
import Configuration from "./pages/Configuration";
import SalespersonReport from "./pages/SalespersonReport";
import FaturamentoPage from "./pages/FaturamentoPage";
import CompanyReportPage from "./pages/CompanyReportPage"; // Import CompanyReportPage
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SellerManagementPage from "./pages/SellerManagementPage"; // Import SellerManagementPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/sales-entry" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
            <Route path="/seller-management" element={<ProtectedRoute><SellerManagementPage /></ProtectedRoute>} />
            <Route path="/faturamento" element={<ProtectedRoute><FaturamentoPage /></ProtectedRoute>} />
            <Route path="/company-report" element={<ProtectedRoute><CompanyReportPage /></ProtectedRoute>} /> {/* New Company Report Route */}
            <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
            <Route path="/salesperson/:id" element={<ProtectedRoute><SalespersonReport /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
