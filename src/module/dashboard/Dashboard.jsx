import React, { useState, useEffect } from "react";
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from "../../components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Moon, Users, ShoppingCart, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [dark, setDark] = useState(true);

  // Example static data (replace with API calls)
  const [dailyOrders, setDailyOrders] = useState(120);
  const [customers, setCustomers] = useState(58);
  const [events, setEvents] = useState(34);

  const chartData = [
    { day: "Mon", orders: 40 },
    { day: "Tue", orders: 30 },
    { day: "Wed", orders: 20 },
    { day: "Thu", orders: 27 },
    { day: "Fri", orders: 18 },
    { day: "Sat", orders: 23 },
    { day: "Sun", orders: 34 },
  ];

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <ShoppingCart size={40} className="text-blue-500" />
            <div>
              <h2 className="text-lg">Daily Orders</h2>
              <p className="text-2xl font-bold">{dailyOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <Users size={40} className="text-green-500" />
            <div>
              <h2 className="text-lg">Customers</h2>
              <p className="text-2xl font-bold">{customers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <Activity size={40} className="text-yellow-500" />
            <div>
              <h2 className="text-lg">Events Tracked</h2>
              <p className="text-2xl font-bold">{events}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl mb-4">Orders This Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#555" : "#ccc"} />
            <XAxis dataKey="day" stroke={dark ? "#fff" : "#000"} />
            <YAxis stroke={dark ? "#fff" : "#000"} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#00BFFF" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
