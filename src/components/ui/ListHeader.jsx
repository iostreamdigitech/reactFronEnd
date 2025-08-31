// src/components/ListHeader.jsx
import React from "react";
import { Plus, Search } from "lucide-react";

export default function ListHeader({ title, onCreate, search, setSearch }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6 bg-gray-900 p-4 rounded-2xl shadow-lg">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            className="pl-9 w-64 border border-gray-700 rounded-lg h-10 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-medium shadow-md transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>
    </div>
  );
}
