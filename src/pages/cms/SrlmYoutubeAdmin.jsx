import React, { useEffect, useState } from "react";
import {
  Box, Button, Typography, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  adminAddYoutube,
  adminGetAllYoutube,
  adminUpdateYoutube,
  adminApproveYoutube,
  adminDeleteYoutube,
} from "../../services/youtubeService";

const SrlmYoutubeAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: "", youtubeUrl: "" });
  const [editData, setEditData] = useState(null);

  // ============================
  // LOAD ALL VIDEOS
  // ============================
  const loadVideos = async () => {
    const res = await adminGetAllYoutube();
    setVideos(res.data); // already sorted DESC
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // ============================
  // EXTRACT THUMBNAIL
  // ============================
  const extractThumb = (url) => {
    try {
      const id = new URL(url).searchParams.get("v");
      if (!id) return "";
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch {
      return "";
    }
  };

  // ============================
  // ADD VIDEO
  // ============================
  const handleAdd = async () => {
    if (!form.title || !form.youtubeUrl) {
      alert("Please enter title and URL");
      return;
    }

    const payload = {
      title: form.title,
      youtubeUrl: form.youtubeUrl,
      thumbnailUrl: extractThumb(form.youtubeUrl),
      isActive: true,
      isApproved: false,
    };

    await adminAddYoutube(payload);
    setForm({ title: "", youtubeUrl: "" });
    loadVideos();
  };

  // ============================
  // EDIT SAVE
  // ============================
  const handleEditSave = async () => {
    const payload = {
      ...editData,
      thumbnailUrl: extractThumb(editData.youtubeUrl),
    };

    await adminUpdateYoutube(editData.id, payload);
    setEditData(null);
    loadVideos();
  };

  // ============================
  // TOGGLE APPROVE/REJECT
  // ============================
  const handleApprove = async (video) => {
    try {
      const newStatus = !video.isApproved; // toggle
      await adminApproveYoutube(video.id, newStatus);
      loadVideos();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // ============================
  // DELETE VIDEO
  // ============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    await adminDeleteYoutube(id);
    loadVideos();
  };

  // ============================
  // UI
  // ============================
  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: "center", fontWeight: 700 }}
      >
        YouTube Video Management
      </Typography>

      {/* Add Form */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Video Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <TextField
          label="YouTube URL"
          value={form.youtubeUrl}
          onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
          sx={{ width: 320 }}
        />

        <Button variant="contained" sx={{ background: "#e67e22" }} onClick={handleAdd}>
          + Add
        </Button>
      </Box>

      {/* Table */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thumbnail</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approve</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {videos.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <img
                    src={v.thumbnailUrl}
                    style={{ width: 120, height: 70, borderRadius: 4 }}
                  />
                </TableCell>

                <TableCell>{v.title}</TableCell>

                <TableCell>
                  <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    {v.youtubeUrl}
                  </a>
                </TableCell>

                <TableCell>
                  <Chip
                    label={v.isApproved ? "APPROVED" : "PENDING"}
                    color={v.isApproved ? "success" : "warning"}
                  />
                </TableCell>

                <TableCell>
                  <IconButton color="success" onClick={() => handleApprove(v)}>
                    {v.isApproved ? <CancelIcon /> : <CheckCircleIcon />}
                  </IconButton>
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => setEditData(v)}>
                    <EditIcon color="primary" />
                  </IconButton>

                  <IconButton onClick={() => handleDelete(v.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={!!editData} onClose={() => setEditData(null)}>
        <DialogTitle>Edit YouTube Video</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            value={editData?.title || ""}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />

          <TextField
            label="YouTube URL"
            value={editData?.youtubeUrl || ""}
            onChange={(e) => setEditData({ ...editData, youtubeUrl: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditData(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SrlmYoutubeAdmin;
