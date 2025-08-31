import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Menu, LogOut, Search, Users, Boxes, Package, Home } from 'lucide-react';
import { api } from '../../hooks/api.js';
import ListHeader from '../../components/ui/ListHeader.jsx';
export default function Categories() {
    function useData(token) {
   
   const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const refresh = async () => {
      setLoading(true);
      try {
        const [cats] = await Promise.all([
         
          api.list('categories', token),
       
        ]);
       setCategories(cats);
        setError(null);
      } catch(e) {
        setError('Failed to load data');
      } finally { setLoading(false); }
    };
  
    useEffect(() => { if (token) refresh(); }, [token]);
  
    return { categories,setCategories, loading, error, refresh };
  }
  
   const token = localStorage.getItem("token");
 const { categories, setCategories, loading, error, refresh } = useData(token);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', description:'' });
  const [search, setSearch] = useState('');
  const filtered = useMemo(()=> categories.filter(c => [c.name,c.description].join(' ').toLowerCase().includes(search.toLowerCase())), [categories, search]);

  const submit = async () => {
    if (!form.name) { alert('Name required'); return; }
    if (editing) {
      const saved = await api.update('categories', editing._id, form, token);
      setCategories(cs => cs.map(c => c._id === saved._id ? saved : c));
    } else {
      const created = await api.create('categories', form, token);
      setCategories(cs => [created, ...cs]);
    }
    setOpen(false); setEditing(null); setForm({ name:'', description:'' });
  };
    if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  return (
  <div className="space-y-4">
  {/* Header */}
  <ListHeader
    title="Categories"
    onCreate={() => {
      setEditing(null);
      setForm({ name: "", description: "" });
      setOpen(true);
    }}
    search={search}
    setSearch={setSearch}
  />

  {/* Table */}
  <div className="rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-700 dark:text-gray-300">
        <tr>
          <th className="p-3">Name</th>
          <th className="p-3">Description</th>
          <th className="p-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((c) => (
          <tr
            key={c._id}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
              {c.name}
            </td>
            <td className="p-3 text-gray-600 dark:text-gray-400">
              {c.description}
            </td>
            <td className="p-3 text-right">
              <div className="inline-flex gap-2">
                <button
                  className="border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                  onClick={() => {
                    setEditing(c);
                    setForm({
                      name: c.name,
                      description: c.description || "",
                    });
                    setOpen(true);
                  }}
                >
                  <Edit3 className="h-4 w-4 inline" /> Edit
                </button>
                <button
                  className="border px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 dark:border-gray-600"
                  onClick={async () => {
                    await api.remove("categories", c._id, token);
                    setCategories((cs) => cs.filter((x) => x._id !== c._id));
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
              colSpan="3"
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
            {editing ? "Edit Category" : "New Category"}
          </div>
          <div className="grid gap-3">
            <div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Name</div>
              <input
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md h-10 w-full px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Description</div>
              <textarea
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md w-full px-3 py-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-3 py-2 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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