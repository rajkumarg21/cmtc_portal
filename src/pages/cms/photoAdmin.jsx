// src/pages/cms/PhotosAdmin.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  adminGetAllPhotos,
  adminSavePhoto,
  adminDeletePhoto,
  adminApprovePhoto,
  adminRejectPhoto,
} from "../../services/photoService.js";

import { useAuth } from "../../context/AuthContext";

export default function PhotosAdmin() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole, isAuthenticated } = useAuth();

  const canApprove = useMemo(
    () => ["PORTAL_ADMIN", "PUBLISHER"].includes(userRole),
    [userRole]
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllPhotos();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load error:", e);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getImageUrl = (url) =>
    url && !url.startsWith("http")
      ? `${import.meta.env.VITE_BASE_URL}${url}`
      : url;

  // -------------------------
  // CREATE / UPDATE with file
  // -------------------------
  const handleSave = async (photo, file = null) => {
    try {
      await adminSavePhoto(photo, file);
      await load();
    } catch (err) {
      alert(err?.response?.data || "Only 2 photos allowed");
      console.error("Save error", err);
      await load();
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this photo?")) return;
    try {
      await adminDeletePhoto(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleApprove = async (id) => {
    if (!id) return;
    try {
      await adminApprovePhoto(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("Approve failed");
    }
  };

  const handleReject = async (id) => {
    if (!id) return;
    try {
      await adminRejectPhoto(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    }
  };

  const addNew = () => {
    const newPhoto = {
      // keep id undefined for new
      position: "PM",
      name: "",
      designation: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
      isApproved: false,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const updateField = (index, key, value) => {
    setPhotos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  // Optional: auth guard (remove if you don’t want)
  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Please login to access this page.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header / Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Manage Photos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add / update photos, upload image, and approve/reject (role
                based).
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Refresh">
                <span>
                  <IconButton
                    onClick={load}
                    disabled={loading}
                    sx={{ border: "1px solid", borderColor: "divider" }}
                  >
                    <RefreshOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Button
                variant="contained"
                onClick={addNew}
                startIcon={<AddPhotoAlternateOutlinedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add New
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty */}
        {!loading && photos.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              No photos found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click “Add New” to create the first entry.
            </Typography>
          </Paper>
        )}

        {/* Cards Grid */}
        <Grid container spacing={2}>
          {photos.map((p, index) => (
            <Grid item xs={12} sm={6} lg={4} key={p.id ?? `new-${index}`}>
              <PhotoCard
                photo={p}
                index={index}
                getImageUrl={getImageUrl}
                canApprove={canApprove}
                updateField={updateField}
                onSave={handleSave}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function PhotoCard({
  photo,
  index,
  getImageUrl,
  canApprove,
  updateField,
  onSave,
  onDelete,
  onApprove,
  onReject,
}) {
  const fileRef = useRef(null);

  const hasId = Boolean(photo?.id);
  const isApproved = Boolean(photo?.isApproved);

  const statusChip = isApproved ? (
    <Chip label="APPROVED" color="success" size="small" />
  ) : (
    <Chip label="PENDING" color="warning" size="small" />
  );

  const handlePickFile = () => {
    fileRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // upload immediately along with save
    await onSave(photo, file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const imageSrc = photo?.imageUrl ? getImageUrl(photo.imageUrl) : null;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Image Preview */}
      <Box
        sx={{
          height: 180,
          bgcolor: "grey.100",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Photo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Stack alignItems="center" spacing={1}>
            <AddPhotoAlternateOutlinedIcon />
            <Typography variant="body2" color="text.secondary">
              No image uploaded
            </Typography>
          </Stack>
        )}
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Top row: status + quick actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {statusChip}
          <Chip
            label={hasId ? `ID: ${photo.id}` : "NEW"}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Fields */}
        <Stack spacing={1.5}>
          <TextField
            label="Position"
            value={photo.position || ""}
            onChange={(e) => updateField(index, "position", e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Name"
            value={photo.name || ""}
            onChange={(e) => updateField(index, "name", e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Designation"
            value={photo.designation || ""}
            onChange={(e) => updateField(index, "designation", e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Display Order"
            type="number"
            value={photo.displayOrder ?? 0}
            onChange={(e) =>
              updateField(index, "displayOrder", Number(e.target.value))
            }
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Upload */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePickFile}
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            sx={{ borderRadius: 2 }}
          >
            Upload Image
          </Button>

          <input
            ref={fileRef}
            hidden
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </Stack>

        {/* Primary Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onSave(photo)}
            startIcon={<SaveOutlinedIcon />}
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            disabled={!hasId}
            onClick={() => onDelete(photo.id)}
            startIcon={<DeleteOutlineOutlinedIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </Stack>

        {/* Approve / Reject */}
        {canApprove && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {!isApproved ? (
              <Button
                variant="contained"
                color="success"
                fullWidth
                disabled={!hasId}
                onClick={() => onApprove(photo.id)}
                startIcon={<CheckCircleOutlineOutlinedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Approve
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                fullWidth
                disabled={!hasId}
                onClick={() => onReject(photo.id)}
                startIcon={<HighlightOffOutlinedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Reject
              </Button>
            )}
          </Stack>
        )}

        {/* Small hint for NEW card */}
        {!hasId && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Save first to generate an ID, then you can delete/approve.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
