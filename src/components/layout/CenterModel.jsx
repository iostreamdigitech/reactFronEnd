// src/components/CenteredModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CenteredModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal Box */}
          <motion.div
            className="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-6 relative"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              ✖
            </button>

            {/* Modal Content */}
            <div className="mt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
