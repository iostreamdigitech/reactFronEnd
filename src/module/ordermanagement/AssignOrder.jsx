import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssignOrder() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    loadOrders();
    loadDeliveryUsers();
  }, []);

  const loadOrders = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/orders/custom", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // only show unassigned
    setOrders(res.data.filter((o) => !o.deliveryUserId));
  };

  const loadDeliveryUsers = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/admin-users?role=Delivery", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const filtered = res.data.filter(u => 
    u.roleId?.name?.toLowerCase() === "delivery"
  );
    setDeliveryUsers(filtered);
  };

  const assignOrder = async () => {
    if (!selectedOrder || !selectedUser) {
      alert("Please select both Order and Delivery User");
      return;
    }
    await axios.put(
      `https://apinewapp.onrender.com/api/orders/${selectedOrder}/assign`,
      { deliveryUserId: selectedUser },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Order assigned!");
    setSelectedOrder("");
    setSelectedUser("");
    loadOrders();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Assign Order to Delivery User</h2>

      {/* Select Order */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Order</label>
        <select
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        >
          <option value="">-- Select Order --</option>
          {orders.map((o) => (
            <option key={o._id} value={o._id}>
              {o._id} - {o.customerId?.name} (₹{o.totalAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Select Delivery User */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Delivery User</label>
        <select
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select Delivery User --</option>
          {deliveryUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* Assign Button */}
      <button
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
        onClick={assignOrder}
      >
        Assign
      </button>

      {/* List of Assigned Orders */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Recently Assigned Orders</h3>
        <AssignedOrders />
      </div>
    </div>
  );
}

function AssignedOrders() {
  const token = localStorage.getItem("token");
  const [assigned, setAssigned] = useState([]);

  useEffect(() => {
    loadAssigned();
  }, []);

  const loadAssigned = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/orders/assigned", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAssigned(res.data);
  };

  return (
    <table className="w-full border border-gray-700 mt-3">
      <thead className="bg-gray-800">
        <tr>
          <th className="p-2 border border-gray-700">Order ID</th>
          <th className="p-2 border border-gray-700">Customer</th>
          <th className="p-2 border border-gray-700">Delivery User</th>
          <th className="p-2 border border-gray-700">Status</th>
        </tr>
      </thead>
      <tbody>
        {assigned.map((o) => (
          <tr key={o._id} className="hover:bg-gray-800">
            <td className="p-2 border border-gray-700">{o._id}</td>
            <td className="p-2 border border-gray-700">{o.customerId?.name}</td>
            <td className="p-2 border border-gray-700">{o.deliveryUser?.username}</td>
            <td className="p-2 border border-gray-700">{o.status}</td>
          </tr>
        ))}
        {assigned.length === 0 && (
          <tr>
            <td colSpan="4" className="text-center p-3 text-gray-400">
              No assigned orders yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
