import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { api } from '../../hooks/api.js';
import ListHeader from '../../components/ui/ListHeader.jsx';

export default function Products() {
  function useData(token) {
    const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = async () => {
      setLoading(true);
      try {
         const [cs, cats, ps] = await Promise.all([
                api.list('customers', token),
                api.list('categories', token),
                api.list('products', token)
              ]);
              setCategories(cats); setProducts(ps);
        setError(null);
      } catch (e) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { if (token) refresh(); }, [token]);

    return { categories,setCategories,products, setProducts, loading, error, refresh };
  }

  const token = localStorage.getItem("token");
  const { products, setProducts,categories,setCategories, loading, error, refresh } = useData(token);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', category:'', price:'' });
  const [search, setSearch] = useState('');
  const filtered = useMemo(()=> products.filter(p => [p.name, String(p.price), categories.find(c=>c._id===p.category)?.name].join(' ').toLowerCase().includes(search.toLowerCase())), [products, categories, search]);

  const submit = async () => {
    if (!form.name || !form.category) { alert('Name and Category required'); return; }
    const payload = { ...form, price: Number(form.price||0) };
    if (editing) {
      const saved = await api.update('products', editing._id, payload, token);
      setProducts(ps => ps.map(p => p._id===saved._id? saved : p));
    } else {
      const created = await api.create('products', payload, token);
      setProducts(ps => [created, ...ps]);
    }
    setOpen(false); setEditing(null); setForm({ name:'', category:'', price:'' });
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
  {/* Header */}
  <ListHeader
    title="Products"
    onCreate={() => {
      setEditing(null);
      setForm({ name: "", category: categories[0]?._id || "", price: "" });
      setOpen(true);
    }}
    search={search}
    setSearch={setSearch}
  />

  {/* Table */}
  <div className="rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-800 text-left">
        <tr>
          <th className="p-3 text-gray-700 dark:text-gray-300">Name</th>
          <th className="p-3 text-gray-700 dark:text-gray-300">Category</th>
          <th className="p-3 text-gray-700 dark:text-gray-300">Price (₹)</th>
          <th className="p-3 text-right text-gray-700 dark:text-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((p) => (
          <tr
            key={p._id}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
              {p.name}
            </td>
            <td className="p-3 text-gray-600 dark:text-gray-400">
              {categories.find((c) => c._id === p.category)?.name || "-"}
            </td>
            <td className="p-3 text-gray-600 dark:text-gray-400">{p.price}</td>
            <td className="p-3 text-right">
              <div className="inline-flex gap-2">
                <button
                  className="border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
                  onClick={() => {
                    setEditing(p);
                    setForm({
                      name: p.name,
                      category: p.category,
                      price: String(p.price),
                    });
                    setOpen(true);
                  }}
                >
                  <Edit3 className="h-4 w-4 inline" /> Edit
                </button>
                <button
                  className="border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
                  onClick={async () => {
                    await api.remove("products", p._id, token);
                    setProducts((ps) => ps.filter((x) => x._id !== p._id));
                  }}
                >
                  <Trash2 className="h-4 w-4 inline" /> Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td
              className="p-6 text-center text-gray-500 dark:text-gray-400"
              colSpan="4"
            >
              No records
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
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        {/* Modal */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="relative w-[420px] bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 shadow-xl p-5"
        >
          <div className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            {editing ? "Edit Product" : "New Product"}
          </div>
          <div className="grid gap-3">
            {/* Name */}
            <div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Name
              </div>
              <input
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md h-10 w-full px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {/* Category */}
            <div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Category
              </div>
              <select
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md h-10 w-full px-3"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Price */}
            <div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Price (₹)
              </div>
              <input
                type="number"
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md h-10 w-full px-3"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-3 py-2 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <button
              className="px-3 py-2 rounded bg-black dark:bg-indigo-600 text-white hover:opacity-90"
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

  )
}