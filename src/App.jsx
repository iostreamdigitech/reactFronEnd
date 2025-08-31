
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import CustomTable from './components/layout/CustomTable.jsx';
import useDarkMode from './hooks/useDarkMode.js';
import Login from './module/login/Login.jsx';
import Dashboard from './module/dashboard/Dashboard.jsx';
import Categories from './module/productmanagement/Categories.jsx';
import Products from './module/productmanagement/Products.jsx';
import MenuAdmin from './module/menu/MenuAdmin.jsx';
import Customer from './module/customer/Customers.jsx';
import AdminUserAdmin from './module/usermanagement/AdminUserAdmin.jsx';
import RoleAdmin from './module/usermanagement/RoleAdmin.jsx';
import { isAuthenticated, logout } from './utils/UserAuth';
import ProductOrderForm from './module/ordermanagement/ProductOrderForm.jsx';
import OrderForm from './module/ordermanagement/CustomerOrder.jsx'
import Invoice from './module/ordermanagement/InvoiceList.jsx'
import AssignOrder from './module/ordermanagement/AssignOrder.jsx'
import DeliveryOrders from './module/deliverymanagement/DeliveryOrders.jsx'
function ProtectedLayout({ children }) {
  const handleLogout = () => {
    logout();
    window.location.href = '/#/login'; // or use useNavigate if inside Router
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar onLogout={handleLogout}  />
      <div className="flex flex-1">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 p-8 ">{children}</div>
      </div>
    </div>
  );
}

// ProtectedRoute component
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

export default function App() {
  return (
    <Routes>
    
    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
    <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
    <Route path="/menus" element={<ProtectedRoute><MenuAdmin /></ProtectedRoute>} />
    <Route path="/customers" element={<ProtectedRoute><Customer /></ProtectedRoute>} />  
    <Route path="/adminUsers" element={<ProtectedRoute><AdminUserAdmin /></ProtectedRoute>} />
    <Route path="/roles" element={<ProtectedRoute><RoleAdmin /></ProtectedRoute>} />
    <Route path="/marketting" element={<ProtectedRoute><ProductOrderForm /></ProtectedRoute>} />
    <Route path="/adminorder" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
    <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
     <Route path="/assignOrder" element={<ProtectedRoute><AssignOrder /></ProtectedRoute>} />
     <Route path="/delivery" element={<ProtectedRoute><DeliveryOrders /></ProtectedRoute>} />
   
   
    </Routes>
  );
}
