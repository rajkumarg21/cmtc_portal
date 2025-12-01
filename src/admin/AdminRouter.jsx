// src/admin/AdminRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function AdminRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<div>Admin Home</div>} />
      </Routes>
    </BrowserRouter>
  );
}
