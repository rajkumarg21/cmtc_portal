
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast, ToastContainer } from "react-toastify";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CustomisedReactQuill from "../../../components/common/CustomReactQuill";
import StatusChip from '../../../components/ui/StatusChip';
import { CONTENT_STATUS } from '../../../utils/constants';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Alert,
  Snackbar,
  Container,
} from "@mui/material";
import{
 deleteEventContent,
 getAllEvent,
 getAllEventsList,
 getEventById,
 updateEvent,
 createEvent,
approveEvent,
 rejectEvent,  } from  '../../../services/eventService';
import { useAuth } from '../../../context/AuthContext';

const MAX_LENGTHS = {
  titleHindi: 60,
  titleEnglish: 60,
  summaryHindi: 250,
  summaryEnglish: 250,
};
const EventManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    contentHindi: '',
    contentEnglish: '',
    summaryHindi: '',
    summaryEnglish: '',
    status: 'PENDING_APPROVAL',
    imageUrl: '',     
    pdfUrl: '',      
    videoUrl: '',  
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [itemToApprove, setItemToApprove] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const isEditing = id;

  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const userHasRole = hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN']);
    if (!userHasRole) {
      setLoading(false);
      setError('You do not have permission to access this page.');
      return;
    }

    try {
      const data = await getAllEventsList(page, pageSize, "id", "DESC");
          setEvents(data.content || []);
          setTotalRows(data.totalElements || 0);
 
      if (isEditing) {
        const pageData = await getEventById(id);
        setFormData({
          titleHindi: pageData.titleHindi || '',
          titleEnglish: pageData.titleEnglish || '',
          contentHindi: pageData.contentHindi || '',
          contentEnglish: pageData.contentEnglish || '',
          summaryHindi: pageData.summaryHindi||'',
          summaryEnglish:pageData.summaryEnglish|| '',
          status: pageData.status || 'PENDING_APPROVAL',
          imageUrl: pageData.imageUrl || '',    
          pdfUrl: pageData.pdfUrl || '',     
          videoUrl: pageData.videoUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load initial data: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to load initial data!');
      setEvents([]); // Ensure state is reset on error
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, id, isEditing, hasRole]); // Dependencies for useCallback

  useEffect(() => {
    fetchData(); // Call fetchData on component mount and when its dependencies change
  }, [fetchData]); // fetchData is a dependency because it's wrapped in useCallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!formData.titleHindi || !formData.titleEnglish) {
      setError("Both Hindi and English titles are required.");
      toast.error("Both Hindi and English titles are required.");
      setLoading(false);
      return;
    }
    if (!formData.contentHindi || !formData.contentEnglish) {
      setError("Both Hindi and English content are required.");
      toast.error("Both Hindi and English content are required.");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        ...formData,
      };

      
      if (payload.parentId === 0) {
        payload.parentId = null;
      }

      if (isEditing) {
       await  updateEvent(id, payload, imageFile, pdfFile, videoFile);
         setMessage('Event updated successfully and sent for approval!');
      } else {
        await createEvent(payload, imageFile, pdfFile, videoFile);
         setMessage('Event added successfully and sent for approval!');
      }
        // Reset form after successful creation
        await fetchData();
        setFormData({
          titleHindi: '',
          titleEnglish: '',
          summaryEnglish:'',
          summaryHindi:'',
          contentHindi: '',
          contentEnglish: '',
          status: 'PENDING_APPROVAL',
          imageUrl: '',
          pdfUrl: '',
          videoUrl: '',
        });
        setImageFile(null);
        setPdfFile(null);
        setVideoFile(null);

        setLoading(false);

       setTimeout(() => { navigate('/cms/Events');}, 500); // Navigate back to the list view after save

    } catch (err) {
      console.error('Operation failed:', err);
      const msg = err.response?.data?.message || err.message;
       toast.error(`Operation failed: ${msg}`);
      setError(msg);
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
          await deleteEventContent(itemToDelete.id);
          toast.success('Event deleted successfully!');
          await fetchData();
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
          await approveEvent(itemToApprove.id);
          toast.success('Event approved!');
          await fetchData();
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
          await rejectEvent(itemToReject.id);
          toast.success('Event Reject!');
          await fetchData();
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
              to={`/cms/event/edit/${params.row.id}`}
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
        {isEditing ? "Edit Success Story" : "Success Stories"}
      </Typography>

      {/* ======== FORM SECTION ======== */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          {isEditing ? "Edit Success Story Content" : "Add Success Story Content"}
        </Typography>

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
            {/* Titles */}
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

            {/* Summaries */}
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

            {/* Content Editors */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Content Description (Hindi)
              </Typography>
              <CustomisedReactQuill
                value={formData.contentHindi}
                onChange={(v) => setFormData({ ...formData, contentHindi: v })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Content Description (English)
              </Typography>
              <CustomisedReactQuill
                value={formData.contentEnglish}
                onChange={(v) => setFormData({ ...formData, contentEnglish: v })}
              />
            </Grid>

            {/* Upload Section */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                       onChange={(e) => {
                         const file = e.target.files[0];
                          if (file) {
                           if (file.size > 100 * 1024 ) {
                              setImageFile(null);
                              setError("Image file size should not exceed 100KB.");
                             e.target.value = null;
                            return;
                           }
                           setError("");
                            setImageFile(file);
                          }
                        }}
                    />
                  </Button>
                  {imageFile && (
                    <Typography variant="body2" mt={1}>
                      Selected: {imageFile.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload PDF
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={(e) => {
                         const file = e.target.files[0];
                          if (file) {
                           if (file.size > 100 * 1024 * 1024) {
                              setPdfFile(null);
                              setError("Pdf file size should not exceed 100MB.");
                             e.target.value = null;
                            return;
                           }
                           setError("");
                          setPdfFile(file);
                          }
                        }}
                    />
                  </Button>
                  {pdfFile && (
                    <Typography variant="body2" mt={1}>
                      Selected: {pdfFile.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload Video
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(e) => {
                         const file = e.target.files[0];
                         if (file) {
                          if (file.size > 25 * 1024 * 1024) {
                              setVideoFile(null);
                              setError("Video file size should not exceed 25MB.");
                              e.target.value = null;
                            return;
                            }
                           setError("");
                           setVideoFile(file);
                         }
                      }}
                    />
                  </Button>
                  {videoFile && (
                    <Typography variant="body2" mt={1}>
                      Selected: {videoFile.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Status and Submit */}
            <Grid item size={{ xs: 12, md: 6 }} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField label="Status" name="status" fullWidth value={formData.status} disabled />
            </Grid>

            <Grid item xs={12} md={6} sx={{ textAlign: "center", mt: 2 }}>
              <Button type="submit" variant="contained">
                {isEditing ? "Update Success Story " : "Submit Success Story"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* ======== TABLE SECTION ======== */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
                         All Success Stories
              </Typography>
       {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                ) : events.length === 0 ? (
                  <Typography align="center">No Success Stories found.</Typography>
                ) : (
                  <DataGrid
                    autoHeight
                    rows={events}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    paginationModel={{ page, pageSize }}
                    onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                       }}
                    loading={loading}
                  />
                )}
              </Paper>

          {/* ======== Dialog ======== */}

              <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message={`Delete  Event "${itemToDelete?.titleEnglish}"?`}
              />
        
              <ConfirmationDialog
                isOpen={showApproveConfirm}
                onClose={() => setShowApproveConfirm(false)}
                onConfirm={handleConfirmApprove}
                title="Confirm Approve"
                message={`Approve  Event  "${itemToApprove?.titleEnglish}"?`}
              />
              <ConfirmationDialog
                isOpen={showRejectConfirm}
                onClose={() => setShowRejectConfirm(false)}
                onConfirm={handleConfirmReject}
                title="Confirm Reject"
                message={`Reject Event "${itemToReject?.titleEnglish}"?`}
              />

            </Container>
          );
};
export default EventManagementPage;