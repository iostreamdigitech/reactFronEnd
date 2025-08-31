import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, Download } from "lucide-react";

export default function CustomerOrder() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customerId: "", items: [], paymentMethod: "Cash", status: "Pending" });
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState({ status: "", paymentMethod: "" });
  const [searchOrderId, setSearchOrderId] = useState("");

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  useEffect(() => {
    let temp = [...orders];
    if (filter.status) temp = temp.filter(o => o.status === filter.status);
    if (filter.paymentMethod) temp = temp.filter(o => o.paymentMethod === filter.paymentMethod);
    if (searchOrderId) temp = temp.filter(o => o._id.toLowerCase().includes(searchOrderId.toLowerCase()));
    setFilteredOrders(temp);
  }, [orders, filter, searchOrderId]);

  const loadOrders = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/orders/custom", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(Array.isArray(res.data) ? res.data : []);
  };

  const loadCustomers = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCustomers(res.data);
  };

  const loadProducts = async () => {
    const res = await axios.get("https://apinewapp.onrender.com/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data);
  };

  const handleAddProduct = () => {
    setForm({ ...form, items: [...form.items, { productId: "", qty: 1, offer: 0, amount: 0 }] });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    if (["productId", "qty", "offer"].includes(field)) {
      const product = products.find((p) => p._id === updated[index].productId);
      if (product) {
        const qty = parseInt(updated[index].qty || 1);
        const offer = parseFloat(updated[index].offer || 0);
        const base = product.price * qty;
        const discount = (base * offer) / 100;
        updated[index].amount = base - discount;
      }
    }
    setForm({ ...form, items: updated });
  };

  const getTotal = () => form.items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const saveOrder = async () => {
    if (editing) {
      await axios.put(`https://apinewapp.onrender.com/api/orders/${editing}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post("https://apinewapp.onrender.com/api/orders", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setForm({ customerId: "", items: [], paymentMethod: "Cash", status: "Pending" });
    setEditing(null);
    setOpen(false);
    loadOrders();
  };

  const editOrder = (order) => {
    setEditing(order._id);
    setForm({
      customerId: order.customerId._id,
      items: order.items.map((i) => ({
        productId: i.productId._id,
        qty: i.qty,
        offer: i.offer,
        amount: i.amount,
      })),
      paymentMethod: order.paymentMethod,
      status: order.status,
    });
    setOpen(true);
  };

  const deleteOrder = async (id) => {
    await axios.delete(`https://apinewapp.onrender.com/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadOrders();
  };

  const handleInvoice = async (order) => {
    try {
      if (order.invoiceCreated) {
        // Download invoice'

       
        const res = await fetch(`https://apinewapp.onrender.com/api/orders/${order._id}/invoice`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${order._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Create invoice
        await axios.post("https://apinewapp.onrender.com/api/invoice/create", { orderId: order._id });
        alert("Invoice created successfully!");
        loadOrders(); // Reload to update invoiceCreated
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create/download invoice");
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => { setEditing(null); setForm({ customerId: "", items: [], paymentMethod: "Cash", status: "Pending" }); setOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18}/> Create Order
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Search by Order ID" 
          className="bg-gray-700 px-2 py-1 rounded w-64"
          value={searchOrderId} 
          onChange={(e) => setSearchOrderId(e.target.value)}
        />
        <select className="bg-gray-700 px-2 py-1 rounded" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
          <option value="">-- All Status --</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select className="bg-gray-700 px-2 py-1 rounded" value={filter.paymentMethod} onChange={(e) => setFilter({...filter, paymentMethod: e.target.value})}>
          <option value="">-- All Payment Methods --</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="overflow-auto bg-gray-800 rounded-xl">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Products</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map(o => (
              <tr key={o._id} className="border-b border-gray-700">
                <td className="px-4 py-2 text-center">{o._id}</td>
                <td className="px-4 py-2">{o.customerId?.name} ({o.customerId?.phone})</td>
                <td className="px-4 py-2 text-sm">
                  {o.items.map(i => (
                    <div key={i._id}>{i.productId?.name} × {i.qty} (₹{i.amount})</div>
                  ))}
                </td>
                <td className="px-4 py-2 text-center">₹{o.totalAmount}</td>
                <td className="px-4 py-2 text-center">{o.paymentMethod}</td>
                <td className="px-4 py-2 text-center">{o.status}</td>
                <td className="px-4 py-2 text-center flex justify-center gap-1">
                  <button className="bg-yellow-500 px-2 py-1 rounded text-black flex items-center gap-1" onClick={() => editOrder(o)}>
                    <Edit3 size={16}/> Edit
                  </button>
                  <button className="bg-red-600 px-2 py-1 rounded flex items-center gap-1" onClick={() => deleteOrder(o._id)}>
                    <Trash2 size={16}/> Delete
                  </button>
                  <button
                    className={`${o.invoiceCreated ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} px-2 py-1 rounded flex items-center gap-1`}
                    onClick={() => handleInvoice(o)}
                  >
                    <Download size={16}/> {o.invoiceCreated ? "Download Invoice" : "Create Invoice"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-4">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-[600px] max-h-[80vh] overflow-auto"
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h2 className="text-xl font-bold mb-4">{editing ? "Edit Order" : "Create Order"}</h2>

              <div className="mb-4">
                <label className="block mb-1">Customer</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        value={form.customerId}
                        onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Payment Method</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        value={form.paymentMethod}
                        onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Status</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        value={form.status}
                        onChange={(e) => setForm({...form, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <select className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1"
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, "productId", e.target.value)}>
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                  <input type="number" className="w-20 bg-gray-700 border border-gray-600 rounded px-2"
                         value={item.qty} onChange={(e) => handleProductChange(index, "qty", e.target.value)}/>
                  <input type="number" className="w-20 bg-gray-700 border border-gray-600 rounded px-2"
                         value={item.offer} onChange={(e) => handleProductChange(index, "offer", e.target.value)}/>
                  <span className="w-24 text-right">₹{item.amount?.toFixed(2)}</span>
                  <button className="text-red-500" onClick={() =>
                    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })}>
                    ✕
                  </button>
                </div>
              ))}

              <button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded mb-3">
                + Add Product
              </button>

              <div className="mb-4 font-semibold">Total: ₹{getTotal().toFixed(2)}</div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                  Cancel
                </button>
                <button onClick={saveOrder} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                  {editing ? "Update Order" : "Save Order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
