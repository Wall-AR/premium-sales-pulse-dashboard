
import { Calendar, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white shadow-sm border-b border-emerald-100">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Sales Dashboard</h1>
            <p className="text-emerald-600 mt-1">Premium Analytics & Performance Tracking</p>
          </div>
          
          <div className="flex items-center space-x-4 text-emerald-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">April 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
