// src/pages/cms/PrintingSectionMgmtPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StatusChip from '../../components/ui/StatusChip';

import {
  getAllPrintingsList,
  getAllPrintings,
  getPrintingById,
  createPrinting,
  updatePrinting,
  deletePrinting,
  approvePrinting,
  rejectPrinting,
} from '../../services/printingService';

import { useAuth } from '../../context/AuthContext';
import { CONTENT_STATUS } from '../../utils/constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import CustomReactQuill from '../../components/common/CustomReactQuill';

const MAX_LENGTHS = {
  titleHindi: 60,
  titleEnglish: 60,
  summaryHindi: 250,
  summaryEnglish: 250
};

export default function PrintingSectionMgmtPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [printings, setPrintings] = useState([]);
  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    summaryHindi: '',
    summaryEnglish: '',
    contentHindi: '',
    contentEnglish: '',
    imageUrl: '',
    author: '',
    printDate: '',
    status: CONTENT_STATUS.PENDING_APPROVAL,
    isFeatured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [itemToApprove, setItemToApprove] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const isEditing = !!id;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPrintingsList(page, pageSize, "printDate", "DESC");
    setPrintings(data.content || []);
    setTotalRows(data.totalElements || 0);
    } catch (err) {
      setError('Failed to fetch Policies: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
      setLoading(false);
      setError('You do not have permission to access this page.');
      return;
    }

    (async () => {
      await fetchItems();

      if (isEditing) {
        try {
          const dto = await getPrintingById(id);
          setFormData({
            titleHindi: dto.titleHindi || '',
            titleEnglish: dto.titleEnglish || '',
            summaryHindi: dto.summaryHindi || '',
            summaryEnglish: dto.summaryEnglish || '',
            contentHindi: dto.contentHindi || '',
            contentEnglish: dto.contentEnglish || '',
            imageUrl: dto.imageUrl || '',
            author: dto.author || '',
            printDate: dto.printDate ? new Date(dto.printDate).toISOString().split('T')[0] : '',
            status: dto.status || CONTENT_STATUS.PENDING_APPROVAL,
            isFeatured: !!dto.isFeatured
          });
        } catch (err) {
          setError('Failed to load Policies for editing: ' + (err?.response?.data?.message || err?.message));
        }
      }
    })();
  }, [id, isEditing, hasRole, fetchItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleQuillHindiChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      contentHindi: value,
    }));
  }
  const handleQuillEnglishChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      contentEnglish: value,
    }));

  };


  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
         if (!file) return;
        if (file.size >100 * 1024) {
       alert("Image size should not exceed 100 KB.");
       e.target.value = null;
      return;
  }
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     setError('');
    setMessage("");
    setLoading(true);
   

    if (!formData.titleHindi || !formData.titleEnglish) {
      toast.error('Both Hindi and English titles are required.');
      setLoading(false);
      return;
    }
    if (!formData.contentHindi || !formData.contentEnglish) {
      toast.error('Both Hindi and English content are required.');
      setLoading(false);
      return;
    }
    if (!formData.summaryHindi || !formData.summaryEnglish) {
      toast.error('Both Hindi and English summary are required.');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, printDate: formData.printDate || null };
      if (isEditing) {
        await updatePrinting(id, payload, imageFile);
       // toast.success('Printing updated successfully!');
        setMessage("Policies updated successfully and sent for approval!");
        navigate("/cms/printing-section");
      } else {
        await createPrinting(payload, imageFile);
       // toast.success('Printing created successfully!');
        setMessage("Policies created successfully!");
        navigate("/cms/printing-section");
      }
      await fetchItems();
      setImageFile(null);
      setFormData({
        titleHindi: '',
        titleEnglish: '',
        summaryHindi: '',
        summaryEnglish: '',
        contentHindi: '',
        contentEnglish: '',
        imageUrl: '',
        author: '',
        printDate: '',
        status: CONTENT_STATUS.PENDING_APPROVAL,
        isFeatured: false
      });
      if (!isEditing) navigate('/cms/printing-section'); // adjust route as you use
    } catch (err) {
      setError('Operation failed: ' + (err?.response?.data?.message || err?.message));
      toast.error('Operation failed: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deletePrinting(itemToDelete.id);
      toast.success('Policies deleted successfully!');
      await fetchItems();
    } catch (err) {
      toast.error('Delete failed: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleApproveClick = (row) => {
    setItemToApprove(row);
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = async () => {
    setLoading(true);
    try {
      await approvePrinting(itemToApprove.id);
      toast.success('Policies approved!');
      await fetchItems();
    } catch (err) {
      toast.error('Approve failed: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
      setShowApproveConfirm(false);
      setItemToApprove(null);
    }
  };
  const handleRejectClick = (row) => {
           setItemToReject(row);
           setShowRejectConfirm(true);
         };
       
         const handleConfirmReject = async () => {
           setLoading(true);
           try {
             await  rejectPrinting(itemToReject.id);
             toast.success(' Policies Reject!');
             await fetchItems();
           } catch (err) {
             toast.error('Reject failed: ' + (err?.response?.data?.message || err?.message));
           } finally {
             setLoading(false);
             setShowRejectConfirm(false);
             setItemToReject(null);
           }
         };

  const columns = [
    { field: 'titleEnglish', headerName: 'Title (EN)', flex: 2, minWidth: 200 },
    { field: 'author', headerName: 'Author', flex: 1, minWidth: 150 },
    {
      field: 'printDate',
      headerName: 'Print Date',
      flex: 1,
      minWidth: 130,
      valueFormatter: (params) => {
        const v = params?.value;
        if (!v) return 'N/A';
        try {
          return new Date(v).toLocaleDateString('en-GB');
        } catch (e) {
          return String(v);
        }
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.6,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            component={Link}
            to={`/cms/printing/${params.row.id}`}
            size="small"
          >
            <EditIcon />
          </IconButton>

          {hasRole(['PORTAL_ADMIN', 'PUBLISHER']) && params.row.status === CONTENT_STATUS.PENDING_APPROVAL && (
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
          {hasRole(['PORTAL_ADMIN']) && (
            <IconButton color="error" size="small" onClick={() => handleDeleteClick(params.row)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
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
        {isEditing ? 'Edit Policies' : 'Policies Section Management'}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          {isEditing ? 'Edit Policies' : 'Add New Policies'}
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
                 maxLength: MAX_LENGTHS.summaryHindi,
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

            <Grid item size={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Content (Hindi):
                {
                  // formErrors.contentHindi && (
                  //   <Typography variant="caption" color="error">
                  //     {formErrors.contentHindi}
                  //   </Typography>
                  // )
                }
              </Typography>
              <CustomReactQuill
                value={formData.contentHindi}
                onChange={handleQuillHindiChange}
              />
              {/* <TextField
                label="Content (Hindi)"
                name="contentHindi"
                value={formData.contentHindi}
                onChange={handleChange}
                fullWidth
                multiline
                rows={6}
              /> */}
            </Grid>

            <Grid item size={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Content (English):
                {
                  // formErrors.contentEnglish && (
                  //   <Typography variant="caption" color="error">
                  //     {formErrors.contentEnglish}
                  //   </Typography>
                  // )
                }
              </Typography>
              <CustomReactQuill
                value={formData.contentEnglish}
                onChange={handleQuillEnglishChange}
              />
              {/* <TextField
                label="Content (English)"
                name="contentEnglish"
                value={formData.contentEnglish}
                onChange={handleChange}
                fullWidth
                multiline
                rows={6}
              /> */}
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Featured Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>

              {isEditing && formData.imageUrl && !imageFile && (
                <Typography variant="body2" mt={1}>
                  Current image:{' '}
                  <a href={`${import.meta.env.VITE_BASE_URL}${formData.imageUrl}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                </Typography>
              )}

              {imageFile && <Typography variant="body2" mt={1}>New image selected: {imageFile.name}</Typography>}
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField label="Author" name="author" value={formData.author} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6}>
              <TextField
                label="Print Date"
                name="printDate"
                type="date"
                value={formData.printDate || new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField label="Status" name="status" value={formData.status} disabled fullWidth />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <label>Featured</label>
                <input type="checkbox" name="isFeatured" checked={!!formData.isFeatured} onChange={handleCheckbox} />
              </Box>
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center', mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {isEditing ? 'Update Policies' : 'Submit Policies'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          All Printings
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : printings.length === 0 ? (
          <Typography align="center">No printings found.</Typography>
        ) : (
          <DataGrid
            autoHeight
            rows={printings}
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
        message={`Delete Policies "${itemToDelete?.titleEnglish}"?`}
      />

      <ConfirmationDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approve"
        message={`Approve Policies "${itemToApprove?.titleEnglish}"?`}
      />
      <ConfirmationDialog
       isOpen={showRejectConfirm}
       onClose={() => setShowRejectConfirm(false)}
       onConfirm={handleConfirmReject}
       title="Confirm Reject"
       message={`Reject Policies "${itemToReject?.titleEnglish}"?`}
       />
    </Container>
  );
}
