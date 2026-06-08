import React, { useEffect, useState } from "react";
import { TextField, Button, Paper, Typography } from "@mui/material";
import api from "../../services/apiService";   // ✔ correct import

const ManageMpsrlm = () => {

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    fullDescription: ""
  });

  // ===========================
  // Load content on page load
  // ===========================
  useEffect(() => {
    api.get("/mpsrlm/content")
      .then(res => {
        const d = res.data || {};
        setForm({
          title: d.title || "",
          shortDescription: d.shortDescription || "",
          fullDescription: d.fullDescription || "",
        });
      })
      .catch(err => {
        console.error("Error loading content:", err);
        alert("Failed to load content from server.");
      });
  }, []);

  // ===========================
  // Input change handler
  // ===========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===========================
  // Save content to backend
  // ===========================
//   const handleSave = () => {
//     api.put("/mpsrlm/update", form)
//       .then(() => {
//         alert("Content updated successfully!");
//       })
//       .catch(err => {
//         console.error("Update failed:", err);
//         alert("Failed to update content. Check console for details.");
//       });
//   };

        const handleSave = () => {
        api.put("/mpsrlm/save", form)
            .then(() => alert("Content saved successfully"))
            .catch(err => console.error("Save failed:", err));
        };


  return (
    <Paper sx={{ p: 4, width: "80%", margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Manage MPSRLM Content
      </Typography>

      {/* Title Field */}
      <TextField
        label="Title"
        name="title"
        fullWidth
        value={form.title}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Short Description Field */}
      <TextField
        label="Short Description"
        name="shortDescription"
        fullWidth
        multiline
        rows={3}
        value={form.shortDescription}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Full Description Field */}
      <TextField
        label="Full Description"
        name="fullDescription"
        fullWidth
        multiline
        rows={10}
        value={form.fullDescription}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Save Button */}
      <Button variant="contained" onClick={handleSave}>
        Save Content
      </Button>
    </Paper>
  );
};

export default ManageMpsrlm;