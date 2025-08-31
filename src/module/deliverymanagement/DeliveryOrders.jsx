import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const token = localStorage.getItem("token");
  const UPI_ID = "ram12371-3@okaxis";
  const PAYEE_NAME = "Amigo Food";

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get(
        "https://apinewapp.onrender.com/api/orders/my-orders",
        { headers: { Authorization: "Bearer " + token } }
      );
      // Sort: Assigned first, then OutForDelivery, then Paid
      const sorted = res.data.sort((a, b) => {
        const order = { Assigned: 0, OutForDelivery: 1, Paid: 2 };
        return order[a.status] - order[b.status];
      });
      setOrders(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOrderSelection = (order) => {
    if (selectedOrders.includes(order._id)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== order._id));
    } else {
      setSelectedOrders([...selectedOrders, order._id]);
    }
  };

  const getSelectedOrders = () =>
    orders.filter((o) => selectedOrders.includes(o._id));

  const totalAmount = getSelectedOrders().reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  const generateUpiLink = () =>
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      PAYEE_NAME
    )}&am=${totalAmount}&cu=INR&tn=BulkOrders_${Date.now()}`;

  const confirmCashPayment = async () => {
    try {
      await axios.put(
        "https://apinewapp.onrender.com/api/orders/bulk-status",
        { orderIds: selectedOrders, status: "Paid", paymentMethod: "Cash" },
        { headers: { Authorization: "Bearer " + token } }
      );
      alert("✅ Bulk Cash Payment Recorded");
      setShowPaymentModal(false);
      setSelectedOrders([]);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update payment status");
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">📦 My Deliveries</h2>

      {/* Bulk Payment Button */}
      {selectedOrders.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            💳 Create Payment for {selectedOrders.length} Orders (₹{totalAmount})
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-xl p-4 bg-gray-800 shadow relative hover:scale-105 transition transform"
          >
            {/* Checkbox only for unpaid orders */}
            {order.status !== "Paid" && (
              <input
                type="checkbox"
                checked={selectedOrders.includes(order._id)}
                onChange={() => toggleOrderSelection(order)}
                className="absolute top-2 right-2 h-5 w-5"
              />
            )}

            <h3 className="font-semibold text-lg">
              Customer: {order.customerId?.name} ({order.customerId?.phone || ""})
            </h3>
            <p className="text-gray-400 font-medium">Total: ₹{order.totalAmount}</p>

            <div className="flex items-center gap-2 mt-3">
              {["Assigned", "OutForDelivery", "Paid"].map((status) => (
                <div key={status} className="flex items-center">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === status
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {status}
                  </div>
                  {status !== "Paid" && <span className="mx-2 text-gray-400">─</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-3">Bulk Payment</h3>
            <p>
              Orders: {selectedOrders.length} <br />
              Total Amount: ₹{totalAmount}
            </p>

            <div className="flex justify-center my-4">
              <QRCodeCanvas value={generateUpiLink()} size={200} />
            </div>

            <a
              href={generateUpiLink()}
              className="block text-center bg-green-600 text-white px-4 py-2 rounded mb-3 hover:bg-green-700 transition"
            >
              Pay with UPI App
            </a>

            <button
              onClick={confirmCashPayment}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              💵 Mark All as Cash Paid
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
