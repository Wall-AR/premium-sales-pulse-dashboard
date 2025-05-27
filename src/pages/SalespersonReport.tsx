
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { salesData } from "@/data/salesData";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ArrowLeft, TrendingUp, Users, Target, Award, Star } from "lucide-react";

const SalespersonReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find salesperson by name (using id as name for simplicity)
  const salesperson = salesData.salespeople.find(p => p.name.toLowerCase() === id?.toLowerCase());
  
  if (!salesperson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Salesperson Not Found</h2>
          <Button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Mock data for the last 3 months
  const monthlyData = [
    { month: "January", sales: salesperson.sold * 0.8, goal: salesperson.goal, clients: salesperson.clients - 5 },
    { month: "February", sales: salesperson.sold * 0.9, goal: salesperson.goal, clients: salesperson.clients - 2 },
    { month: "March", sales: salesperson.sold, goal: salesperson.goal, clients: salesperson.clients },
  ];

  const weeklyData = [
    { week: "Week 1", sales: salesperson.sold * 0.2 },
    { week: "Week 2", sales: salesperson.sold * 0.25 },
    { week: "Week 3", sales: salesperson.sold * 0.3 },
    { week: "Week 4", sales: salesperson.sold * 0.25 },
  ];

  const goalPercentage = (salesperson.sold / salesperson.goal) * 100;
  const challengePercentage = (salesperson.sold / salesperson.challenge) * 100;
  const megaPercentage = (salesperson.sold / salesperson.mega) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-6 hover:bg-emerald-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-emerald-300 shadow-lg">
                <AvatarImage src={salesperson.photo} alt={salesperson.name} />
                <AvatarFallback className="text-2xl font-bold bg-emerald-100 text-emerald-600">
                  {salesperson.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-4xl font-bold text-emerald-800">{salesperson.name}</h1>
                <p className="text-xl text-emerald-600">Sales Performance Report</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {goalPercentage >= 100 ? "Goal Achieved" : "In Progress"}
                  </span>
                  {megaPercentage >= 100 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Mega Achiever
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-emerald-800">R$ {salesperson.sold.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600">{goalPercentage.toFixed(1)}% of goal</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clients</p>
                    <p className="text-2xl font-bold text-blue-800">{salesperson.clients}</p>
                    <p className="text-xs text-blue-600">{salesperson.newClients} new clients</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Ticket</p>
                    <p className="text-2xl font-bold text-purple-800">R$ {salesperson.avgTicket.toLocaleString()}</p>
                    <p className="text-xs text-purple-600">Per transaction</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Goal Progress</p>
                    <p className="text-2xl font-bold text-yellow-800">{goalPercentage.toFixed(0)}%</p>
                    <p className="text-xs text-yellow-600">R$ {salesperson.goal.toLocaleString()} target</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Performance */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <CardTitle>3-Month Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Sales']} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                      <Line
                        type="monotone"
                        dataKey="goal"
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Breakdown */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle>Current Month Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Sales']} />
                      <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal Progress Bars */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle>Goal Achievement Status</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-emerald-700">Basic Goal</span>
                    <span className="text-sm font-medium">R$ {salesperson.sold.toLocaleString()} / R$ {salesperson.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-emerald-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(goalPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{goalPercentage.toFixed(1)}% achieved</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-amber-700">Challenge Goal</span>
                    <span className="text-sm font-medium">R$ {salesperson.sold.toLocaleString()} / R$ {salesperson.challenge.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-amber-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(challengePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{challengePercentage.toFixed(1)}% achieved</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-yellow-700">Mega Goal</span>
                    <span className="text-sm font-medium">R$ {salesperson.sold.toLocaleString()} / R$ {salesperson.mega.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-yellow-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(megaPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{megaPercentage.toFixed(1)}% achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalespersonReport;
