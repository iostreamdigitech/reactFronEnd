// DeliveryPayment.jsx
import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function DeliveryPayment() {
  const params = new URLSearchParams(window.location.search);
  const orderIds = params.get("ids")?.split(",") || [];
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTotal();
  }, []);

  const loadTotal = async () => {
    const res = await axios.post("https://apinewapp.onrender.com/api/orders/total", { orderIds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTotal(res.data.total);
  };

  const markPaid = async () => {
    await axios.post("https://apinewapp.onrender.com/api/payments/mark-paid", { orderIds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Orders marked as Paid!");
    window.location.href = "/delivery/orders";
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-4">Payment</h2>
      <p>Total Amount: <strong>₹{total}</strong></p>

      <div className="my-4">
        <h3 className="font-semibold">UPI Payment</h3>
        <QRCodeCanvas value={`upi://pay?pa=merchant@upi&am=${total}&tn=Order Payment`} size={200} />
      </div>

      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={markPaid}
        >
          Confirm UPI Paid
        </button>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={markPaid}
        >
          Cash on Delivery Received
        </button>
      </div>
    </div>
  );
}
