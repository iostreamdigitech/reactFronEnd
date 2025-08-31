import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Download, Send, Plus } from "lucide-react";
import ListHeader from "../../components/ui/ListHeader.jsx";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, []);

  const loadInvoices = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/invoice/invoices");
    setInvoices(res.data);
  };

  const loadOrders = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/orders/custom");
    setOrders(res.data);
  };

  const createInvoice = async () => {
    if (!selectedOrder) {
      alert("Please select an order");
      return;
    }
    await axios.post("https://apinewapp.onrender.com/api/invoice/create", { orderId: selectedOrder });
    alert("Invoice created!");
    setShowCreate(false);
    setSelectedOrder("");
    loadInvoices();
  };

  const downloadInvoice = (id) => {
    window.open(`https://apinewapp.onrender.com/api/invoice/invoices/${id}/download`, "_blank");
  };

  const sendInvoice = async (id) => {
    await axios.post(`https://apinewapp.onrender.com/api/invoice/invoices/${id}/send`);
    alert("Invoice sent!");
  };

  // 🔍 Filter invoices by search term
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) =>
      [
        inv.invoiceNumber,
        inv.orderId?._id,
        inv.orderId?.customerId?.name,
        inv.orderId?.total,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [invoices, search]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* 🔍 Header with search & create */}
      <ListHeader
        title="Invoices"
        onCreate={() => setShowCreate((prev) => !prev)}
        search={search}
        setSearch={setSearch}
        icon={<Plus className="h-4 w-4" />}
      />

      {/* Create Invoice Section */}
      {showCreate && (
        <div className="mb-6 bg-gray-800 p-4 rounded-xl shadow-lg">
          <h3 className="font-semibold mb-2">Select Order</h3>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-200 p-2 rounded w-full mb-3"
          >
            <option value="">-- Choose Order --</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                {order._id} - {order.customerId?.name} - ₹{order.total}
              </option>
            ))}
          </select>
          <button
            onClick={createInvoice}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Create Invoice
          </button>
        </div>
      )}

      {/* Invoice List */}
      <div className="overflow-x-auto rounded-2xl shadow border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv._id}
                  className="border-t border-gray-700 hover:bg-gray-800"
                >
                  <td className="p-3">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.orderId?._id}</td>
                  <td className="p-3">{inv.orderId?.customerId?.name}</td>
                  <td className="p-3">₹{inv.orderId?.total}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => downloadInvoice(inv._id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => sendInvoice(inv._id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center gap-1"
                    >
                      <Send size={14} /> Send
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-400"
                >
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
