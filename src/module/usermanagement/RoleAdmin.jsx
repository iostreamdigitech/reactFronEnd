import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function RoleAdmin() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ name: "", permissions: [] });
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const fetchRoles = () => {
    axios
      .get("https://apinewapp.onrender.com/api/roles", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setRoles(res.data))
      .catch(() => toast.error("Failed to load roles"));
  };

  const fetchMenus = () => {
    axios
      .get("https://apinewapp.onrender.com/api/menus", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setMenus(res.data))
      .catch(() => toast.error("Failed to load menus"));
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePermissionToggle = (id) => {
    const newPerms = form.permissions.includes(id)
      ? form.permissions.filter((p) => p !== id)
      : [...form.permissions, id];
    setForm({ ...form, permissions: newPerms });
  };

  const handleSave = () => {
    if (!form.name) return toast.error("Role name required");

    if (editId) {
      axios
        .put(`https://apinewapp.onrender.com/api/roles/${editId}`, form, {
          headers: { Authorization: "Bearer " + token },
        })
        .then(() => {
          fetchRoles();
          resetForm();
          toast.success("Role updated");
        })
        .catch(() => toast.error("Update failed"));
    } else {
      axios
        .post("https://apinewapp.onrender.com/api/roles", form, {
          headers: { Authorization: "Bearer " + token },
        })
        .then(() => {
          fetchRoles();
          resetForm();
          toast.success("Role added");
        })
        .catch(() => toast.error("Add failed"));
    }
  };

  const handleEdit = (role) => {
    setEditId(role._id);
    setForm({ name: role.name, permissions: role.permissions || [] });
  };

  const handleDelete = () => {
    axios
      .delete(`https://apinewapp.onrender.com/api/roles/${confirmDeleteId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        fetchRoles();
        toast.success("Role deleted");
      })
      .catch(() => toast.error("Delete failed"))
      .finally(() => setConfirmDeleteId(null));
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", permissions: [] });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster position="top-right" />

      <h2 className="text-3xl font-bold mb-6">🔑 Role Management</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-xl font-semibold mb-2">
            {editId ? "✏️ Edit Role" : "➕ Add Role"}
          </h3>
          <input
            className="w-full bg-gray-700 border border-gray-600 p-3 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Role Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <div className="mb-2">
            <p className="font-semibold mb-2">Menu Permissions:</p>
            <div className="max-h-64 overflow-y-auto pr-2">
              {menus.map((menu) => (
                <div key={menu._id} className="pl-1 mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(menu._id)}
                      onChange={() => handlePermissionToggle(menu._id)}
                      className="mr-2"
                    />
                    <span>{menu.name}</span>
                  </label>
                  {menu.submenus?.length > 0 && (
                    <div className="pl-6 mt-1 space-y-1">
                      {menu.submenus.map((sub) => (
                        <label
                          key={sub._id}
                          className="flex items-center text-sm text-gray-300"
                        >
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(sub._id)}
                            onChange={() => handlePermissionToggle(sub._id)}
                            className="mr-2"
                          />
                          📌 {sub.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
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

        {/* Roles Table */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">📋 Roles List</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-gray-200 uppercase">
                <tr>
                  <th className="p-3 text-left">Role Name</th>
                  <th className="p-3 text-left">Permissions</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-750 transition">
                    <td className="p-3">{role.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                        {role.permissions?.length || 0} menus
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(role._id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-gray-400"
                    >
                      No roles found.
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
