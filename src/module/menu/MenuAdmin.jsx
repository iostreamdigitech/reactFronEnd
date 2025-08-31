import { useEffect, useState } from "react";
import axios from "axios";

export default function MenuAdmin() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const token = localStorage.getItem("token");

  // Fetch menus
  const fetchMenus = () => {
    axios
      .get("https://apinewapp.onrender.com/api/menus", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setMenus(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Save menu
  const handleSave = () => {
    if (!name.trim()) return alert("Name is required!");
    const payload = { name, path: path || "", parentId: parentId || null };

    const apiCall = editId
      ? axios.put(`https://apinewapp.onrender.com/api/menus/${editId}`, payload, {
          headers: { Authorization: "Bearer " + token },
        })
      : axios.post("https://apinewapp.onrender.com/api/menus", payload, {
          headers: { Authorization: "Bearer " + token },
        });

    apiCall
      .then(() => {
        fetchMenus();
        resetForm();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    axios
      .delete(`https://apinewapp.onrender.com/api/menus/${id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => fetchMenus())
      .catch((err) => console.error(err));
  };

  const handleEdit = (menu) => {
    setEditId(menu._id);
    setName(menu.name);
    setPath(menu.path || "");
    setParentId(menu.parentId || "");
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPath("");
    setParentId("");
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render recursive tree
  const renderTree = (menuList, level = 0) => {
    return menuList.map((menu) => (
      <div
        key={menu._id}
        style={{
          marginLeft: level * 20,
          background: level === 0 ? "#1f1f1f" : "#2a2a2a",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "6px",
          transition: "all 0.3s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => toggleExpand(menu._id)}
          >
            {menu.submenus?.length > 0 && (
              <span style={{ color: "#90caf9", fontSize: "14px" }}>
                {expanded[menu._id] ? "▼" : "▶"}
              </span>
            )}
            <span style={{ fontWeight: "bold", color: "#eee" }}>{menu.name}</span>
            <small style={{ color: "#aaa" }}>{menu.path || "-"}</small>
          </div>

          <div>
            <button onClick={() => handleEdit(menu)} style={btnStyleEdit}>
              Edit
            </button>
            <button onClick={() => handleDelete(menu._id)} style={btnStyleDelete}>
              Delete
            </button>
          </div>
        </div>

        {menu.submenus?.length > 0 && expanded[menu._id] && (
          <div style={{ marginTop: "8px" }}>{renderTree(menu.submenus, level + 1)}</div>
        )}
      </div>
    ));
  };

  // Styles
  const btnStyleEdit = {
    padding: "6px 12px",
    marginRight: "6px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
  };
  const btnStyleDelete = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        background: "#121212",
        color: "#eee",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#90caf9" }}>
        ⚙️ Admin Menu Management
      </h2>

      {/* Add/Edit Form */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "25px", alignItems: "center" }}>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Menu Name"
        />
        <input
          style={inputStyle}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="Path (optional)"
        />
        <select style={inputStyle} value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Main Menu</option>
          {menus.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            backgroundColor: "#2e7d32",
            color: "#fff",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {editId ? "Update" : "Add"}
        </button>
        {editId && (
          <button
            onClick={resetForm}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              backgroundColor: "#757575",
              color: "#fff",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Tree Menu */}
      <div style={{ border: "1px solid #333", borderRadius: "8px", padding: "20px", backgroundColor: "#1e1e1e" }}>
        <h3 style={{ marginBottom: "15px", color: "#90caf9" }}>📂 Menu Tree</h3>
        {(!menus || menus.length === 0) ? (
          <p style={{ color: "#aaa", fontStyle: "italic" }}>No menus added yet.</p>
        ) : (
          <div>{renderTree(menus)}</div>
        )}
      </div>
    </div>
  );
}

// Shared input style
const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #555",
  background: "#1e1e1e",
  color: "#eee",
  fontSize: "16px",
};
