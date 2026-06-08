// src/pages/cms/NewsManagementPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

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

/** ------------------ Config ------------------- */
const LIMITS = {
  titleHindi: 80,
  titleEnglish: 80,
  summaryHindi: 300,
  summaryEnglish: 300,
};

const REQUIRED_MSG = "This field is required.";

const formatDateISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatDateGB = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB");
};

const statusChip = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === CONTENT_STATUS.PUBLISHED) return { label: "Published", color: "success" };
  if (s === CONTENT_STATUS.PENDING_APPROVAL) return { label: "Pending approval", color: "warning" };
  if (s === CONTENT_STATUS.DRAFT) return { label: "Draft", color: "default" };
  return { label: status || "Unknown", color: "default" };
};

const NewsManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const isEditing = Boolean(id);

  /** ------------------ State ------------------- */
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
    newsDate: formatDateISO(new Date()),
    status: CONTENT_STATUS.PENDING_APPROVAL,
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [listLoading, setListLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [articleToApprove, setArticleToApprove] = useState(null);

  /** ------------------ Permissions ------------------- */
  const canAccess = hasRole(["EDITOR", "PUBLISHER", "PORTAL_ADMIN"]);
  const canApprove = hasRole(["PORTAL_ADMIN", "PUBLISHER"]);
  const canDelete = hasRole(["PORTAL_ADMIN"]);

  /** ------------------ Data Fetch ------------------- */
  const fetchNewsArticles = useCallback(async () => {
    setListLoading(true);
    setPageError("");
    try {
      const data = await getAllNewsArticles();

      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const da = new Date(a?.newsDate || 0).getTime();
        const db = new Date(b?.newsDate || 0).getTime();
        return db - da;
      });

      setNewsArticles(sorted);
    } catch (err) {
      setPageError(
        "Unable to load news articles. " + (err.response?.data?.message || err.message)
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadArticleForEdit = useCallback(async (articleId) => {
    setPageError("");
    setFormLoading(true);
    try {
      const articleData = await getNewsArticleById(articleId);

      setFormData({
        titleHindi: articleData?.titleHindi || "",
        titleEnglish: articleData?.titleEnglish || "",
        summaryHindi: articleData?.summaryHindi || "",
        summaryEnglish: articleData?.summaryEnglish || "",
        contentHindi: articleData?.contentHindi || "",
        contentEnglish: articleData?.contentEnglish || "",
        imageUrl: articleData?.imageUrl || "",
        author: articleData?.author || "",
        newsDate: articleData?.newsDate
          ? formatDateISO(articleData.newsDate)
          : formatDateISO(new Date()),
        status: articleData?.status || CONTENT_STATUS.PENDING_APPROVAL,
      });

      setImageFile(null);
      setErrors({});
    } catch (err) {
      setPageError(
        "Unable to load the selected article. " + (err.response?.data?.message || err.message)
      );
    } finally {
      setFormLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccess) return;

    const init = async () => {
      await fetchNewsArticles();
      if (isEditing) await loadArticleForEdit(id);
    };

    init();
  }, [canAccess, fetchNewsArticles, isEditing, id, loadArticleForEdit]);

  /** ------------------ Validation ------------------- */
  const validate = useCallback((data) => {
    const next = {};

    if (!data.titleHindi?.trim()) next.titleHindi = REQUIRED_MSG;
    if (!data.titleEnglish?.trim()) next.titleEnglish = REQUIRED_MSG;

    if (data.titleHindi?.length > LIMITS.titleHindi)
      next.titleHindi = `Max ${LIMITS.titleHindi} characters.`;
    if (data.titleEnglish?.length > LIMITS.titleEnglish)
      next.titleEnglish = `Max ${LIMITS.titleEnglish} characters.`;

    if (data.summaryHindi?.length > LIMITS.summaryHindi)
      next.summaryHindi = `Max ${LIMITS.summaryHindi} characters.`;
    if (data.summaryEnglish?.length > LIMITS.summaryEnglish)
      next.summaryEnglish = `Max ${LIMITS.summaryEnglish} characters.`;

    // Rich text: treat empty HTML like empty content
    const strip = (html) =>
      String(html || "")
        .replace(/<(.|\n)*?>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!strip(data.contentHindi)) next.contentHindi = REQUIRED_MSG;
    if (!strip(data.contentEnglish)) next.contentEnglish = REQUIRED_MSG;

    if (data.author && data.author.length > 80)
      next.author = "Keep author name under 80 characters.";

    return next;
  }, []);

  const isFormValid = useMemo(() => Object.keys(validate(formData)).length === 0, [formData, validate]);

  /** ------------------ Handlers ------------------- */
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleResetToNew = () => {
    navigate("/cms/news");
    setFormData({
      titleHindi: "",
      titleEnglish: "",
      summaryHindi: "",
      summaryEnglish: "",
      contentHindi: "",
      contentEnglish: "",
      imageUrl: "",
      author: "",
      newsDate: formatDateISO(new Date()),
      status: CONTENT_STATUS.PENDING_APPROVAL,
    });
    setImageFile(null);
    setErrors({});
    setPageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError("");

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = { ...formData, newsDate: formData.newsDate || null };

      if (isEditing) {
        await updateNewsArticle(id, payload, imageFile);
        toast.success("News article updated.");
      } else {
        await createNewsArticle(payload, imageFile);
        toast.success("News article created.");
      }

      await fetchNewsArticles();

      if (!isEditing) {
        handleResetToNew();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed.";
      setPageError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete?.id) return;
    setFormLoading(true);
    try {
      await deleteNewsArticle(articleToDelete.id);
      toast.success("News article deleted.");
      setNewsArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));

      if (isEditing && String(articleToDelete.id) === String(id)) {
        handleResetToNew();
      }
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
      setShowDeleteConfirm(false);
      setArticleToDelete(null);
    }
  };

  const handleApproveClick = (article) => {
    setArticleToApprove(article);
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = async () => {
    if (!articleToApprove?.id) return;
    setFormLoading(true);
    try {
      await approveNewsArticle(articleToApprove.id);
      toast.success("Article approved and published.");

      setNewsArticles((prev) =>
        prev.map((a) =>
          a.id === articleToApprove.id ? { ...a, status: CONTENT_STATUS.PUBLISHED } : a
        )
      );

      if (isEditing && String(articleToApprove.id) === String(id)) {
        setFormData((prev) => ({ ...prev, status: CONTENT_STATUS.PUBLISHED }));
      }
    } catch (err) {
      toast.error("Approval failed: " + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
      setShowApproveConfirm(false);
      setArticleToApprove(null);
    }
  };

  /** ------------------ DataGrid ------------------- */
  const columns = useMemo(
    () => [
      {
        field: "titleEnglish",
        headerName: "Title (English)",
        flex: 2,
        minWidth: 260,
        renderCell: (params) => (
          <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {params.value || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row?.titleHindi || "—"}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "author",
        headerName: "Author",
        flex: 1,
        minWidth: 160,
        valueGetter: (value, row) => row?.author || "—",
      },
      {
        field: "newsDate",
        headerName: "News date",
        flex: 1,
        minWidth: 140,
        valueGetter: (value, row) => row?.newsDate,
        renderCell: (params) => <Typography variant="body2">{formatDateGB(params.value)}</Typography>,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 160,
        renderCell: (params) => {
          const meta = statusChip(params.value);
          return <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />;
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.5,
        minWidth: 260,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row;
          const isPending = row?.status === CONTENT_STATUS.PENDING_APPROVAL;

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Edit article">
                <IconButton
                  color="primary"
                  component={RouterLink}
                  to={`/cms/news/${row.id}`}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {canApprove && isPending && (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => handleApproveClick(row)}
                  startIcon={<CheckCircleOutlineIcon />}
                >
                  Approve
                </Button>
              )}

              {canDelete && (
                <Tooltip title="Delete article">
                  <IconButton color="error" size="small" onClick={() => handleDeleteClick(row)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    [canApprove, canDelete]
  );

  /** ------------------ Guard ------------------- */
  if (!canAccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Access denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You don’t have permission to view News Management.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const featuredImageHref =
    isEditing && formData.imageUrl
      ? `${import.meta.env.VITE_BASE_URL}${formData.imageUrl}`
      : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
          
            <Typography
                   variant="h6"
                   component="h6"
                   sx={{
                     fontWeight: 600,
                     letterSpacing: "0.5px",
                     mb: 1,
                   }}
                 >
              News Management
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Create, edit, review, and publish news articles with consistent formatting.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNewsArticles}
            disabled={listLoading || formLoading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleResetToNew}
            disabled={formLoading}
          >
            New article
          </Button>
        </Stack>
      </Stack>

      {pageError && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: "error.light" }}>
          <Typography variant="subtitle2" color="error" sx={{ fontWeight: 700 }}>
            Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pageError}
          </Typography>
        </Paper>
      )}

      {/* Form */}
      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
           <Typography
                   variant="h6"
                   component="h6"
                   sx={{
                     fontWeight: 600,
                     letterSpacing: "0.5px",
                     mb: 1,
                   }}
                 >
            {isEditing ? "Edit article" : "Create new article"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fields marked with * are required. Keep titles short and summaries clear.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Title (Hindi) *"
                name="titleHindi"
                value={formData.titleHindi}
                onChange={(e) => {
                  if (e.target.value.length <= LIMITS.titleHindi) handleTextChange(e);
                }}
                fullWidth
                required
                error={Boolean(errors.titleHindi)}
                helperText={
                  errors.titleHindi || `${formData.titleHindi.length}/${LIMITS.titleHindi} characters`
                }
                inputProps={{ maxLength: LIMITS.titleHindi }}
              />
            </Grid>

            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Title (English) *"
                name="titleEnglish"
                value={formData.titleEnglish}
                onChange={(e) => {
                  if (e.target.value.length <= LIMITS.titleEnglish) handleTextChange(e);
                }}
                fullWidth
                required
                error={Boolean(errors.titleEnglish)}
                helperText={
                  errors.titleEnglish ||
                  `${formData.titleEnglish.length}/${LIMITS.titleEnglish} characters`
                }
                inputProps={{ maxLength: LIMITS.titleEnglish }}
              />
            </Grid>

            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Summary (Hindi)"
                name="summaryHindi"
                value={formData.summaryHindi}
                onChange={(e) => {
                  if (e.target.value.length <= LIMITS.summaryHindi) handleTextChange(e);
                }}
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.summaryHindi)}
                helperText={
                  errors.summaryHindi ||
                  `${formData.summaryHindi.length}/${LIMITS.summaryHindi} characters`
                }
                inputProps={{ maxLength: LIMITS.summaryHindi }}
              />
            </Grid>

            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Summary (English)"
                name="summaryEnglish"
                value={formData.summaryEnglish}
                onChange={(e) => {
                  if (e.target.value.length <= LIMITS.summaryEnglish) handleTextChange(e);
                }}
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.summaryEnglish)}
                helperText={
                  errors.summaryEnglish ||
                  `${formData.summaryEnglish.length}/${LIMITS.summaryEnglish} characters`
                }
                inputProps={{ maxLength: LIMITS.summaryEnglish }}
              />
            </Grid>

            {/* Content Hindi */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography
                   variant="p"
                   component="p"
                   sx={{
                     fontWeight: 600,
                     letterSpacing: "0.5px",
                     mb: 1,
                   }}
                 >
                  Content (Hindi) *
                </Typography>
                {errors.contentHindi && (
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                    {errors.contentHindi}
                  </Typography>
                )}
              </Stack>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <CustomReactQuill
                  value={formData.contentHindi}
                  onChange={(content) => {
                    setFormData((prev) => ({ ...prev, contentHindi: content }));
                    setErrors((prev) => ({ ...prev, contentHindi: undefined }));
                  }}
                />
              </Paper>
            </Grid>

            {/* Content English */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                 <Typography
                   variant="p"
                   component="p"
                   sx={{
                     fontWeight: 600,
                     letterSpacing: "0.5px",
                     mb: 1,
                   }}
                 >
                  Content (English) *
                </Typography>
                {errors.contentEnglish && (
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                    {errors.contentEnglish}
                  </Typography>
                )}
              </Stack>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <CustomReactQuill
                  value={formData.contentEnglish}
                  onChange={(content) => {
                    setFormData((prev) => ({ ...prev, contentEnglish: content }));
                    setErrors((prev) => ({ ...prev, contentEnglish: undefined }));
                  }}
                />
              </Paper>
            </Grid>

            {/* Featured Image */}
            <Grid container xs={12} md={6} size={12}>
                 <Grid item xs={12} md={6} size={6}>
              <Stack spacing={1}>
                <Typography
                   variant="p"
                   component="p"
                   sx={{
                     fontWeight: 600,
                     letterSpacing: "0.5px",
                     mb: 1,
                   }}
                 >
                  Featured image
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageOutlinedIcon />}
                  disabled={formLoading}
                >
                  Upload image
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>

                {featuredImageHref && !imageFile && (
                  <Typography variant="body2" color="text.secondary">
                    Current image:{" "}
                    <a href={featuredImageHref} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Typography>
                )}

                {imageFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: <strong>{imageFile.name}</strong>
                  </Typography>
                )}
              </Stack>
            </Grid>
             
   </Grid>
     <Grid item xs={12} md={6} size={6}>
              <Stack spacing={2}>
                <TextField
                  label="Author"
                  name="author"
                  value={formData.author}
                  onChange={handleTextChange}
                  fullWidth
                  error={Boolean(errors.author)}
                  helperText={errors.author || "Optional (e.g., Communications Team)"}
                />

              </Stack>
            </Grid>
   <Grid item xs={12} md={6} size={6}>
                <TextField
                  label="News date"
                  name="newsDate"
                  type="date"
                  value={formData.newsDate || formatDateISO(new Date())}
                  onChange={handleTextChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
  </Grid>
   <Grid item xs={12} md={6} size={6}>
                <TextField label="Status" name="status" value={formData.status} disabled fullWidth />
                 </Grid>
            {/* Metadata */}
         

            {/* Actions */}
            <Grid item xs={12} size={12}> 
              <Divider sx={{ my: 1 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                {isEditing && (
                  <Button variant="outlined" onClick={() => navigate("/cms/news")} disabled={formLoading}>
                    Exit edit
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={formLoading || !isFormValid}
                  startIcon={formLoading ? <CircularProgress size={18} /> : null}
                >
                  {isEditing ? "Save changes" : "Create article"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* List */}
      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              All articles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest articles appear first. Use actions to edit, approve, or delete.
            </Typography>
          </Stack>

          <Chip label={`${newsArticles.length} total`} variant="outlined" sx={{ fontWeight: 700 }} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {listLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : newsArticles.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              No articles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create your first news article using the form above.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={newsArticles}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { fontWeight: 800 },
              "& .MuiDataGrid-cell": { alignItems: "center" },
            }}
          />
        )}
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete article</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete{" "}
            <strong>{articleToDelete?.titleEnglish || "this article"}</strong>. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} disabled={formLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={formLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation */}
      <Dialog open={showApproveConfirm} onClose={() => setShowApproveConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Approve & publish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Approving will publish this article immediately and make it visible on the portal.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApproveConfirm(false)} disabled={formLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmApprove} color="success" variant="contained" disabled={formLoading}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewsManagementPage;
