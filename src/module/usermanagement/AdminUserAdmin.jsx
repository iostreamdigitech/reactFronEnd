import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AdminUserAdmin() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", passwordHash: "", roleId: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = () => {
    axios
      .get("https://apinewapp.onrender.com/api/admin-users", { headers: { Authorization: "Bearer " + token } })
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"));
  };

  const fetchRoles = () => {
    axios
      .get("https://apinewapp.onrender.com/api/roles", { headers: { Authorization: "Bearer " + token } })
      .then((res) => setRoles(res.data))
      .catch(() => toast.error("Failed to load roles"));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!form.username || !form.email || !form.roleId) {
      toast.error("Username, Email, and Role are required");
      return;
    }

    const payload = { ...form };
    if (editId) {
      axios
        .put(`https://apinewapp.onrender.com/api/admin-users/${editId}`, payload, { headers: { Authorization: "Bearer " + token } })
        .then(() => {
          fetchUsers();
          resetForm();
          toast.success("User updated");
        })
        .catch(() => toast.error("Update failed"));
    } else {
      axios
        .post("https://apinewapp.onrender.com/api/admin-users", payload, { headers: { Authorization: "Bearer " + token } })
        .then(() => {
          fetchUsers();
          resetForm();
          toast.success("User added");
        })
        .catch(() => toast.error("Add failed"));
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setForm({
      username: user.username,
      email: user.email,
      passwordHash: "",
      roleId: user.roleId?._id || "",
    });
  };

  const handleDelete = () => {
    axios
      .delete(`https://apinewapp.onrender.com/api/admin-users/${confirmDeleteId}`, { headers: { Authorization: "Bearer " + token } })
      .then(() => {
        fetchUsers();
        toast.success("User deleted");
      })
      .catch(() => toast.error("Delete failed"))
      .finally(() => setConfirmDeleteId(null));
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ username: "", email: "", passwordHash: "", roleId: "" });
  };

  // filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster position="top-right" />

      <h2 className="text-3xl font-bold mb-6 text-white">⚙️ Admin Users</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-xl font-semibold mb-2">{editId ? "✏️ Edit User" : "➕ Add User"}</h3>
          <div className="space-y-2">
            <label className="block text-sm">Username</label>
            <input
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded focus:ring-2 focus:ring-blue-500"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Email</label>
            <input
              type="email"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded focus:ring-2 focus:ring-blue-500"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded focus:ring-2 focus:ring-blue-500"
              name="passwordHash"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Role</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded focus:ring-2 focus:ring-blue-500"
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              {editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">👥 User List</h3>
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 border border-gray-600 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-gray-200 uppercase">
                <tr>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-750 transition">
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      {u.roleId?.name ? (
                        <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                          {u.roleId.name}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(u._id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="text-gray-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
