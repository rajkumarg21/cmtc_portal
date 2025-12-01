// src/pages/cms/NewsManagementPage.jsx

import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import {
  getAllNewsArticles,
  getNewsArticleById,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  approveNewsArticle,
} from "../../services/newsService";
import { useAuth } from "../../context/AuthContext";
import { CONTENT_STATUS } from "../../utils/constants";
import CustomReactQuill from "../../components/common/CustomReactQuill";

// ------------------ Utility helpers -------------------
const MAX_LENGTHS = {
  titleHindi: 60,
  titleEnglish: 60,
  summaryHindi: 250,
  summaryEnglish: 250,
};

const NewsManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [newsArticles, setNewsArticles] = useState([]);
  const [formData, setFormData] = useState({
    titleHindi: "",
    titleEnglish: "",
    summaryHindi: "",
    summaryEnglish: "",
    contentHindi: "",
    contentEnglish: "",
    imageUrl: "",
    author: "",
    newsDate: "",
    status: CONTENT_STATUS.PENDING_APPROVAL,
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [articleToApprove, setArticleToApprove] = useState(null);

  const isEditing = !!id;

  const fetchNewsArticles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllNewsArticles();
      setNewsArticles(
        data.sort(
          (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime()
        )
      );
    } catch (err) {
      setError("Failed to fetch news articles: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasRole(["EDITOR", "PUBLISHER", "PORTAL_ADMIN"])) {
      setLoading(false);
      setError("You do not have permission to access this page.");
      return;
    }

    const fetchData = async () => {
      await fetchNewsArticles();
      if (isEditing) {
        try {
          const articleData = await getNewsArticleById(id);
          setFormData({
            titleHindi: articleData.titleHindi || "",
            titleEnglish: articleData.titleEnglish || "",
            summaryHindi: articleData.summaryHindi || "",
            summaryEnglish: articleData.summaryEnglish || "",
            contentHindi: articleData.contentHindi || "",
            contentEnglish: articleData.contentEnglish || "",
            imageUrl: articleData.imageUrl || "",
            author: articleData.author || "",
            newsDate: articleData.newsDate
              ? new Date(articleData.newsDate).toISOString().split("T")[0]
              : "",
            status: articleData.status || CONTENT_STATUS.PENDING_APPROVAL,
          });
        } catch (err) {
          setError("Failed to load news article: " + (err.response?.data?.message || err.message));
        }
      }
    };
    fetchData();
  }, [id, isEditing, hasRole, fetchNewsArticles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

    try {
      const payload = { ...formData, newsDate: formData.newsDate || null };
      if (isEditing) {
        await updateNewsArticle(id, payload, imageFile);
        toast.success("News article updated successfully!");
      } else {
        await createNewsArticle(payload, imageFile);
        toast.success("News article added successfully!");
      }
      await fetchNewsArticles();
      if (!isEditing) navigate("/cms/news");
    } catch (err) {
      setError("Operation failed: " + (err.response?.data?.message || err.message));
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteNewsArticle(articleToDelete.id);
      toast.success("News article deleted successfully!");
      setNewsArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
    } catch (err) {
      toast.error("Failed to delete news article: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleApproveClick = (article) => {
    setArticleToApprove(article);
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = async () => {
    setLoading(true);
    try {
      await approveNewsArticle(articleToApprove.id);
      toast.success("News article approved!");
      setNewsArticles((prev) =>
        prev.map((a) =>
          a.id === articleToApprove.id ? { ...a, status: CONTENT_STATUS.PUBLISHED } : a
        )
      );
    } catch (err) {
      toast.error("Failed to approve news article: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowApproveConfirm(false);
    }
  };

  const columns = [
    { field: "titleEnglish", headerName: "Title (EN)", flex: 2, minWidth: 200 },
    { field: "author", headerName: "Author", flex: 1, minWidth: 150 },
    {
      field: "newsDate",
      headerName: "News Date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
          if (!params || !params.value) return "N/A";
          return new Date(params.value).toLocaleDateString("en-GB");
        },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            color="primary"
            component={Link}
            to={`/cms/news/${params.row.id}`}
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
          {hasRole(["PORTAL_ADMIN"]) && (
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row)}
            >
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <ToastContainer position="top-right" autoClose={4000} />
      <Typography variant="h4" align="center" style={{ color: '#4A000E' }}    gutterBottom>
        News Article Management
      </Typography>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center" >
          {isEditing ? "Edit News Article" : "Add New News Article"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, md: 6 }}>
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
            <Grid item size={{ xs: 12, md: 6 }}>
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
            <Grid item size={{ xs: 12, md: 6 }}>
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
                    maxLength: MAX_LENGTHS.titleHindi,
                  },
                }}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
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

            <Grid item size={{ xs: 12, md: 6 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Featured Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {isEditing && formData.imageUrl && !imageFile && (
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Current image:{" "}
                  <a
                    href={`${import.meta.env.VITE_BASE_URL}${formData.imageUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label="News Date"
                name="newsDate"
                type="date"
                value={formData.newsDate || new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label="Status"
                name="status"
                value={formData.status}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item size={12} sx={{ textAlign: "center", mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {isEditing ? "Update News Article" : "Submit News Article"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* List */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" align="center" style={{ color: '#4A000E' }}  gutterBottom>
          All News Articles
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : newsArticles.length === 0 ? (
          <Typography align="center">No news articles found.</Typography>
        ) : (
          <DataGrid
            autoHeight
            rows={newsArticles}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        )}
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete news article "
            {articleToDelete?.titleEnglish}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation */}
      <Dialog open={showApproveConfirm} onClose={() => setShowApproveConfirm(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve and publish this news article?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
          <Button onClick={handleConfirmApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewsManagementPage;
