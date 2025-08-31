import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2 } from 'lucide-react';
import { api } from '../../hooks/api.js';
import ListHeader from '../../components/ui/ListHeader.jsx';

export default function Customers() {
  function useData(token) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = async () => {
      setLoading(true);
      try {
        const [cs] = await Promise.all([api.list('customers', token)]);
        setCustomers(cs);
        setError(null);
      } catch (e) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { if (token) refresh(); }, [token]);

    return { customers, setCustomers, loading, error, refresh };
  }

  const token = localStorage.getItem("token");
  const { customers, setCustomers, loading, error } = useData(token);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    aphone: '',
    address: '',
    billingaddress: '',
    coption: '',
    coptioniamge: ''
  });
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => customers.filter(c =>
      [c.name, c.email, c.phone, c.aphone, c.address, c.billingaddress, c.coption]
        .join(' ').toLowerCase().includes(search.toLowerCase())
    ),
    [customers, search]
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, coptioniamge: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert('Name, Email, and Phone are required');
      return;
    }
    let saved;
    if (editing) {
      saved = await api.update('customers', editing._id, form, token);
      setCustomers(cs => cs.map(c => c._id === saved._id ? saved : c));
    } else {
      saved = await api.create('customers', form, token);
      setCustomers(cs => [saved, ...cs]);
    }
    setOpen(false);
    setEditing(null);
    setForm({
      name:'', email:'', phone:'', aphone:'', address:'', billingaddress:'', coption:'', coptioniamge:''
    });
  };

  if (loading) return <div className="p-6 text-gray-600 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListHeader
        title="Customers"
        onCreate={() => {
          setEditing(null);
          setForm({
            name:'', email:'', phone:'', aphone:'',
            address:'', billingaddress:'', coption:'', coptioniamge:''
          });
          setOpen(true);
        }}
        search={search}
        setSearch={setSearch}
      />

      {/* Table / Card Wrapper */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <table className="w-full text-sm hidden md:table">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Option</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{c.email}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{c.phone}</td>
                <td className="p-3 text-gray-700 dark:text-gray-400 italic">{c.coption}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      onClick={() => { setEditing(c); setForm(c); setOpen(true); }}
                    >
                      <Edit3 className="h-4 w-4 inline" /> Edit
                    </button>
                    <button
                      className="border px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400"
                      onClick={async()=>{
                        await api.remove('customers', c._id, token);
                        setCustomers(cs => cs.filter(x => x._id !== c._id));
                      }}
                    >
                      <Trash2 className="h-4 w-4 inline" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr>
                <td className="p-6 text-center text-gray-500 dark:text-gray-400" colSpan="5">No records</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filtered.map(c => (
            <div key={c._id} className="p-4 space-y-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{c.email}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{c.phone}</div>
              <div className="text-sm italic text-gray-500 dark:text-gray-400">{c.coption}</div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="border px-2 py-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => { setEditing(c); setForm(c); setOpen(true); }}
                >
                  <Edit3 className="h-3 w-3 inline" /> Edit
                </button>
                <button
                  className="border px-2 py-1 rounded text-xs hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400"
                  onClick={async()=>{
                    await api.remove('customers', c._id, token);
                    setCustomers(cs => cs.filter(x => x._id !== c._id));
                  }}
                >
                  <Trash2 className="h-3 w-3 inline" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setOpen(false)} />
            <motion.div
              initial={{y:20,opacity:0}}
              animate={{y:0,opacity:1}}
              exit={{y:20,opacity:0}}
              className="absolute left-1/2 -translate-x-1/2 top-24 w-[480px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 shadow-2xl p-5 overflow-auto"
            >
              <div className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {editing ? 'Edit Customer' : 'New Customer'}
              </div>
              <div className="grid gap-3 text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-sm">Name</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Email</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Phone</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Alternate Phone</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.aphone} onChange={e=>setForm({...form,aphone:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Address</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Billing Address</div>
                  <input className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.billingaddress} onChange={e=>setForm({...form,billingaddress:e.target.value})}/>
                </div>
                <div>
                  <div className="text-sm">Option</div>
                  <select className="border rounded-md h-10 w-full px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.coption} onChange={e=>setForm({...form,coption:e.target.value})}>
                    <option value="">Select Option</option>
                    <option value="Option 1">Option 1</option>
                    <option value="Option 2">Option 2</option>
                    <option value="Option 3">Option 3</option>
                  </select>
                </div>
                <div>
                  <div className="text-sm">Option Image</div>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {form.coptioniamge && <img src={form.coptioniamge} alt="Preview" className="mt-2 h-20 w-20 object-cover border rounded" />}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-2 rounded border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>setOpen(false)}>Close</button>
                <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white" onClick={submit}>{editing?'Save':'Create'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
