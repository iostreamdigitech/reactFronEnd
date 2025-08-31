import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";
import { api } from "../../hooks/api.js";
import ListHeader from "../../components/ui/ListHeaderWithoutAdd.jsx";

export default function ProductOrderForm() {
  function useData(token) {
    const [markettingorder, setMarkettingorder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = async () => {
      setLoading(true);
      try {
        const [cs] = await Promise.all([api.list("markettingorder", token)]);
        setMarkettingorder(cs);
        setError(null);
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (token) refresh();
    }, [token]);

    return { markettingorder, setMarkettingorder, loading, error, refresh };
  }

  const token = localStorage.getItem("token");
  const { markettingorder, setMarkettingorder, loading, error } = useData(token);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    contactNumber: "",
    name: "",
    alternativeNumber: "",
    address: "",
    landmark: "",
    location: "",
    product: "",
    quantity: "",
    status: "",
  });
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      markettingorder.filter((c) =>
        [
          c.name,
          c.contactNumber,
          c.quantity,
          c.aphone,
          c.address,
          c.landmark,
          c.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [markettingorder, search]
  );

  const submit = async () => {
    let saved;
    if (editing) {
      saved = await api.update("markettingorder", editing._id, form, token);
      setMarkettingorder((cs) =>
        cs.map((c) => (c._id === saved._id ? saved : c))
      );
    }
    setOpen(false);
    setEditing(null);
    setForm({
      contactNumber: "",
      name: "",
      alternativeNumber: "",
      address: "",
      landmark: "",
      location: "",
      product: "",
      quantity: "",
      status: "",
    });
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListHeader
        title="Orders"
        onCreate={() => {
          setEditing(null);
          setForm({
            contactNumber: "",
            name: "",
            alternativeNumber: "",
            address: "",
            landmark: "",
            location: "",
            product: "",
            quantity: "",
            status: "",
          });
          setOpen(true);
        }}
        search={search}
        setSearch={setSearch}
      />

      <div className="rounded-2xl border border-gray-700 bg-gray-900 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-left text-gray-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Alt. Number</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c._id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.contactNumber}</td>
                <td className="p-3">{c.alternativeNumber}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-gray-700 text-gray-200">
                    {c.status || "—"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                      onClick={() => {
                        setEditing(c);
                        setForm(c);
                        setOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white flex items-center gap-1"
                      onClick={async () => {
                        await api.remove("markettingorder", c._id, token);
                        setMarkettingorder((cs) =>
                          cs.filter((x) => x._id !== c._id)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-gray-500"
                  colSpan="5"
                >
                  📦 No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-24 w-[480px] max-h-[80vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-xl p-5 overflow-auto text-gray-200"
            >
              <div className="text-lg font-semibold mb-4">
                {editing ? "Edit Order" : "New Order"}
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="text-sm mb-1">Name</div>
                  <input
                    className="border border-gray-700 bg-gray-800 rounded-md h-10 w-full px-3 text-gray-200"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <div className="text-sm mb-1">Status</div>
                  <select
                    className="border border-gray-700 bg-gray-800 rounded-md h-10 w-full px-3 text-gray-200"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="">Select status</option>
                    <option value="Invoice Prepared">Invoice Prepared</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Payment Received">Payment Received</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                  onClick={submit}
                >
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
