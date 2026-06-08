// src/pages/cms/AdvertisementSectionMgmtPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Box,
  IconButton,
   Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast, ToastContainer } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllAdvertisementsList,
  getAllAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  approveAdvertisement,
  rejectAdvertisement,
} from "../../services/advertisementSectionService";

import { useAuth } from "../../context/AuthContext";
import { CONTENT_STATUS } from "../../utils/constants";
import StatusChip from "../../components/ui/StatusChip";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import CustomReactQuill from "../../components/common/CustomReactQuill";

const MAX_LENGTHS = {
  titleHindi: 60,
  titleEnglish: 60,
  summaryHindi: 250,
  summaryEnglish: 250,
};

export default function AdvertisementSectionMgmtPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [advertisements, setAdvertisements] = useState([]);
  const [formData, setFormData] = useState({
    titleHindi: "",
    titleEnglish: "",
    summaryHindi: "",
    summaryEnglish: "",
    contentHindi: "",
    contentEnglish: "",
    imageUrl: "",
    author: "",
    advertDate: "",
    status: CONTENT_STATUS.PENDING_APPROVAL,
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [adToApprove, setAdToApprove] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const isEditing = !!id;

  const fetchAdvertisements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllAdvertisementsList(page, pageSize, "advertDate", "DESC");
    setAdvertisements(data.content || []);
    setTotalRows(data.totalElements || 0);
      
    } catch (err) {
      setError("Failed to fetch HSG PRODUCTS " + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (!hasRole(["EDITOR", "PUBLISHER", "PORTAL_ADMIN"])) {
      setLoading(false);
      setError("You do not have permission to access this page.");
      return;
    }

    (async () => {
      await fetchAdvertisements();

      if (isEditing) {
        try {
          const ad = await getAdvertisementById(id);
          setFormData({
            titleHindi: ad.titleHindi || "",
            titleEnglish: ad.titleEnglish || "",
            summaryHindi: ad.summaryHindi || "",
            summaryEnglish: ad.summaryEnglish || "",
            contentHindi: ad.contentHindi || "",
            contentEnglish: ad.contentEnglish || "",
            imageUrl: ad.imageUrl || "",
            author: ad.author || "",
            advertDate: ad.advertDate ? new Date(ad.advertDate).toISOString().split("T")[0] : "",
            status: ad.status || CONTENT_STATUS.PENDING_APPROVAL,
            isFeatured: !!ad.isFeatured,
          });
        } catch (err) {
          setError("Failed to load HSG PRODUCTS: " + (err?.response?.data?.message || err?.message));
        }
      }
    })();
  }, [id, isEditing, hasRole, fetchAdvertisements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage("");
    setLoading(true);

    if (!formData.titleHindi || !formData.titleEnglish) {
      toast.error("Both Hindi and English titles are required.");
      setLoading(false);
      return;
    }
    if (!formData.contentHindi || !formData.contentEnglish) {
      toast.error("Both Hindi and English content are required.");
      setLoading(false);
      return;
    }
    if (!formData.summaryHindi || !formData.summaryEnglish) {
          toast.error("Both Hindi and English Summary are required.");
          setLoading(false);
          return;
        }
    try {
      const payload = { ...formData, advertDate: formData.advertDate || null };
      if (isEditing) {
        await updateAdvertisement(id, payload, imageFile);
        //toast.success("Advertisement updated successfully!");
        setMessage("HSG PRODUCTS updated successfully and sent for approval!");
        navigate("/cms/advertisement-Section");
      } else {
        await createAdvertisement(payload, imageFile);
        setMessage("HSG PRODUCTS created successfully!");
         navigate("/cms/advertisement-Section");
       // toast.success("Advertisement created successfully!");
      }
      await fetchAdvertisements();
      setImageFile(null);

      setFormData({
            titleHindi: "",
            titleEnglish: "",
            summaryHindi: "",
            summaryEnglish: "",
            contentHindi: "",
            contentEnglish: "",
            imageUrl: "",
            author: "",
            advertDate: "",
            status: CONTENT_STATUS.PENDING_APPROVAL,
            isFeatured: false,
          });

      if (!isEditing) navigate("/cms/advertisement-Section");
    } catch (err) {
      toast.error("Operation failed: " + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setAdToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteAdvertisement(adToDelete.id);
      toast.success("HSG PRODUCTS deleted successfully!");
      await fetchAdvertisements();
    } catch (err) {
      toast.error("Delete failed: " + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setAdToDelete(null);
    }
  };

  const handleApproveClick = (row) => {
    setAdToApprove(row);
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = async () => {
    setLoading(true);
    try {
      await approveAdvertisement(adToApprove.id);
      toast.success("HSG PRODUCTS approved!");
      await fetchAdvertisements();
    } catch (err) {
      toast.error("Approve failed: " + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
      setShowApproveConfirm(false);
      setAdToApprove(null);
    }
  };
   const handleRejectClick = (row) => {
         setItemToReject(row);
         setShowRejectConfirm(true);
       };
     
       const handleConfirmReject = async () => {
         setLoading(true);
         try {
           await  rejectAdvertisement(itemToReject.id);
           toast.success(' HSG PRODUCTS Reject!');
           await fetchAdvertisements();
         } catch (err) {
           toast.error('Reject failed: ' + (err?.response?.data?.message || err?.message));
         } finally {
           setLoading(false);
           setShowRejectConfirm(false);
           setItemToReject(null);
         }
       };
  const columns = [
    { field: "titleEnglish", headerName: "Title (EN)", flex: 2, minWidth: 200 },
    { field: "author", headerName: "Author", flex: 1, minWidth: 150 },
    {
      field: "advertDate",
      headerName: "Advert Date",
      flex: 1,
      minWidth: 130,
      valueFormatter: (params) => {
        const v = params?.value;
        if (!v) return "N/A";
        try {
          return new Date(v).toLocaleDateString("en-GB");
        } catch (e) {
          return String(v);
        }
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.6,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            color="primary"
            component={Link}
            to={`/cms/advertisement-Section/${params.row.id}`}
            size="small"
          >
            <EditIcon />
          </IconButton>

          {hasRole(["PORTAL_ADMIN", "PUBLISHER"]) &&
            params.row.status === CONTENT_STATUS.PENDING_APPROVAL && (
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleApproveClick(params.row)}
                startIcon={<CheckCircleOutlineIcon />}
              >
                Approve
              </Button>
            )}
             {hasRole(['PORTAL_ADMIN', 'PUBLISHER']) && params.row.status === CONTENT_STATUS.PENDING_APPROVAL && (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleRejectClick(params.row)}
                          startIcon={<CheckCircleOutlineIcon />}
                        >
                         Reject
                        </Button> 
                      )}

          {hasRole(["PORTAL_ADMIN"]) && (
            <IconButton color="error" size="small" onClick={() => handleDeleteClick(params.row)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  if (!hasRole(["EDITOR", "PUBLISHER", "PORTAL_ADMIN"])) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" align="center">
          You do not have permission to access this page.
        </Typography>
      </Container>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <ToastContainer position="top-right" autoClose={4000} />
      <Typography variant="h4" align="center" gutterBottom>
        {isEditing ? "Edit HSG Products" : "HSG Products Management"}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          {isEditing ? "Edit HSG Products" : "Add HSG Products"}
        </Typography>
        {/* ======== FORM success and error message ======== */}
                        {(error || message) && (
                          <Snackbar
                            open={!!(error || message)}
                            autoHideDuration={6000}
                            onClose={() => {
                              setError("");
                              setMessage("");
                            }}
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                          >
                            <Alert
                              onClose={() => {
                                setError("");
                                setMessage("");
                              }}
                              severity={error ? "error" : "success"}
                              sx={{ width: "100%" }}
                            >
                              {error || message}
                            </Alert>
                          </Snackbar>
                        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField
                label={`Title (Hindi) (${formData.titleHindi.length}/${MAX_LENGTHS.titleHindi})`}
                name="titleHindi"
                value={formData.titleHindi}
                onChange={(e) => {
                 if (e.target.value.length <= MAX_LENGTHS.titleHindi) {
                    handleChange(e);
                   }
                }}
                slotProps={{
                 input: {
                 maxLength: MAX_LENGTHS.titleHindi,
                  },
                }}
                fullWidth
                required
              />
           </Grid>

            
           <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField
                label={`Title (English) (${formData.titleEnglish.length}/${MAX_LENGTHS.titleEnglish})`}
                name="titleEnglish"
                value={formData.titleEnglish}
                onChange={(e) => {
                 if (e.target.value.length <= MAX_LENGTHS.titleEnglish) {
                    handleChange(e);
                   }
                }}
                slotProps={{
                 input: {
                 maxLength: MAX_LENGTHS.titleEnglish,
                  },
                }}
                fullWidth
                required
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField
                label={`Summary (Hindi) (${formData.summaryHindi.length}/${MAX_LENGTHS.summaryHindi})`}
                name="summaryHindi"
                value={formData.summaryHindi}
                onChange={(e) => {
                 if (e.target.value.length <= MAX_LENGTHS.summaryHindi) {
                    handleChange(e);
                   }
                }}
                slotProps={{
                 input: {
                 maxLength: MAX_LENGTHS.summaryHindi,
                  },
                }}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField
                label={`Summary (English) (${formData.summaryEnglish.length}/${MAX_LENGTHS.summaryEnglish})`}
                name="summaryEnglish"
                value={formData.summaryEnglish}
                onChange={(e) => {
                 if (e.target.value.length <= MAX_LENGTHS.summaryEnglish) {
                    handleChange(e);
                   }
                }}
                slotProps={{
                 input: {
                 maxLength: MAX_LENGTHS.summaryEnglish,
                  },
                }}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {/* Use Rich Text Editors */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Content (Hindi):
              </Typography>
              <CustomReactQuill
                value={formData.contentHindi}
                onChange={(content) => setFormData((prev) => ({ ...prev, contentHindi: content }))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Content (English):
              </Typography>
              <CustomReactQuill
                value={formData.contentEnglish}
                onChange={(content) => setFormData((prev) => ({ ...prev, contentEnglish: content }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Featured Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>

              {isEditing && formData.imageUrl && !imageFile && (
                <Typography variant="body2" mt={1}>
                  Current image:{" "}
                  <a
                    href={`${import.meta.env.VITE_BASE_URL}${formData.imageUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </Typography>
              )}

              {imageFile && (
                <Typography variant="body2" mt={1}>
                  New image selected: {imageFile.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Author" name="author" value={formData.author} onChange={handleChange} fullWidth  required/>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Advert Date"
                name="advertDate"
                type="date"
                value={formData.advertDate || new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField label="Status" name="status" value={formData.status} disabled fullWidth />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <label>Featured</label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={!!formData.isFeatured}
                  onChange={handleCheckbox}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {isEditing ? "Update HSG Products" : "Submit HSG Products"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          All HSG Products
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : advertisements.length === 0 ? (
          <Typography align="center">No HSG Products found.</Typography>
        ) : (
          <DataGrid
            autoHeight
            rows={advertisements}
            columns={columns}
            getRowId={(row) => row.id}
            rowCount={totalRows}
           paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
           }}
             loading={loading}
             pageSizeOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Delete HSG Products "${adToDelete?.titleEnglish}"?`}
      />

      <ConfirmationDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approve"
        message={`Approve HSG Products "${adToApprove?.titleEnglish}"?`}
      />
      <ConfirmationDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleConfirmReject}
        title="Confirm Reject"
        message={`Reject HSG Products "${itemToReject?.titleEnglish}"?`}
        />
    </Container>
  );
}
