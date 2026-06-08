import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, TextField, FormControl,
    InputLabel, Select, MenuItem, Button, CircularProgress,
    Alert, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { styled } from '@mui/system';
import {
    getAllRtiDocuments,
    uploadRtiDocument,
    editRtiDocument,
    deleteRtiDocument,
    approveRtiDocument,
    toggleRtiDocumentVisibility
} from '../../services/rtiDocumentService';
import { useAuth } from '../../context/AuthContext';
const API_BASE = import.meta.env.VITE_BASE_URL;

// Status constants - aap apne hisaab se update kar lena
const RTI_STATUS = {
    PUBLISHED: 'PUBLISHED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    DISABLED: 'DISABLED',
    REJECTED: 'REJECTED',
};

const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    border: `1px solid ${theme.palette.divider}`,
}));

const RtiDocumentManagementPage = () => {

    const { hasRole } = useAuth();

    const [rtiDocuments, setRtiDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');


    const [formData, setFormData] = useState({
        documentName: '',
        status: RTI_STATUS.PUBLISHED,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Delete dialog
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    // Approve dialog
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [itemToApprove, setItemToApprove] = useState(null);
    // Toggle visibility dialog (Enable/Disable)
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [itemToToggle, setItemToToggle] = useState(null);

    // Fetch RTI Documents
    const fetchRtiDocuments = async () => {
        setLoading(true);
        try {
            const response = await getAllRtiDocuments();
            setRtiDocuments(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch RTI documents: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // 
    useEffect(() => {
        if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
            setLoading(false);
            setError('You do not have permission to access this page.');
            return;
        }
        fetchRtiDocuments();
    }, [hasRole]);

    // 
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 
    const resetForm = () => {
        setFormData({
            documentName: '',
            status: RTI_STATUS.PUBLISHED,
        });
        setIsEditing(false);
        setEditItemId(null);
        setFile(null);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!file) {
            setError('Please select a PDF file.');
            return;
        }

        try {
            if (isEditing) {
                const editData = new FormData();
                editData.append('rtiDocumentFile', file);
                await editRtiDocument(editItemId, editData);
                setMessage('RTI document updated successfully!');
            } else {
                const uploadData = new FormData();
                uploadData.append('rtiDocumentFile', file);
                await uploadRtiDocument(uploadData);
                setMessage('RTI document uploaded successfully!');
            }
            resetForm();
            fetchRtiDocuments();
        } catch (err) {
            setError('Operation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    // Edit
    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditItemId(item.id);
        setFormData({
            documentName: item.documentName,
            status: item.status,
        });
    };

    // Delete
    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };
    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await deleteRtiDocument(itemToDelete.id);
            setMessage('RTI document deleted successfully!');
            setRtiDocuments(rtiDocuments.filter(doc => doc.id !== itemToDelete.id));
        } catch (err) {
            setError('Failed to delete RTI document: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    // Approve
    const handleApproveClick = async (item) => {
        setLoading(true);
        try {
            await approveRtiDocument(item.id);
            setMessage('RTI document approved successfully!');
            fetchRtiDocuments();
        } catch (err) {
            setError('Failed to approve RTI document: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleConfirmApprove = async () => {
        setShowApproveConfirm(false);
        if (!itemToApprove) return;

        setLoading(true);
        try {
            await approveRtiDocument(itemToApprove.id);
            setMessage('RTI document approved successfully!');
            fetchRtiDocuments();
        } catch (err) {
            setError('Failed to approve RTI document: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
            setItemToApprove(null);
        }
    };


    // Toggle Visibility
    const handleToggleVisibility = async (item) => {
        setLoading(true);
        try {
            const updated = await toggleRtiDocumentVisibility(item.id);
            setMessage(`RTI document ${updated.isVisible ? "enabled" : "disabled"} successfully!`);
            fetchRtiDocuments();
        } catch (err) {
            setError('Failed to update visibility: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleConfirmToggle = async () => {
        setShowToggleConfirm(false);
        if (!itemToToggle) return;

        setLoading(true);
        try {
            const updated = await toggleRtiDocumentVisibility(itemToToggle.id);
            setMessage(`RTI document ${updated.isVisible ? "enabled" : "disabled"} successfully!`);
            fetchRtiDocuments();
        } catch (err) {
            setError('Failed to update visibility: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
            setItemToToggle(null);
        }
    };


    // 
    const getStatusChip = (status) => {
        if (!status) {
            return <Chip label="Unknown" color="default" size="small" />;
        }
        let color;
        let label = status.replace('_', ' ');
        switch (status) {
            case RTI_STATUS.PUBLISHED:
                color = 'success';
                break;
            case RTI_STATUS.PENDING_APPROVAL:
                color = 'warning';
                break;
            case RTI_STATUS.DISABLED:
                color = 'default';
                break;
            case RTI_STATUS.REJECTED:
                color = 'error';
                break;
            default:
                color = 'default';
        }
        return <Chip label={label} color={color} size="small" />;
    };

    if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
        return (
            <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="error">
                    You do not have permission to access this page.
                </Typography>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" align="center" gutterBottom>
                RTI Document Management
            </Typography>

            <StyledBox>
                <Typography variant="h5" align="center" gutterBottom>
                    {isEditing ? "Edit RTI Document" : "Upload RTI Document (PDF)"}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {isEditing && editItemId && (
                        <Typography variant="body2" sx={{ mt: -1 }}>
                            Current File:{" "}
                            {rtiDocuments.find(d => d.id?.toString() === editItemId?.toString()) ? (
                                <a
                                    href={`${API_BASE}${rtiDocuments.find(d => d.id?.toString() === editItemId?.toString()).documentUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#1976d2", textDecoration: "underline" }}
                                >
                                    View File
                                </a>
                            ) : (
                                "No file available"
                            )}
                        </Typography>

                    )}

                    <Button variant="outlined" component="label" color="primary">
                        {isEditing ? "Select New PDF File" : "Select PDF File"}
                        <input
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </Button>

                    {/* {file && (
                        <Typography variant="body2" sx={{ mt: -1 }}>
                            Selected File: {file.name}
                        </Typography>
                    )} */}

                    {file && (
                        <Typography variant="body2" sx={{ mt: -1 }}>
                            Selected File:{" "}
                            <a
                                href={URL.createObjectURL(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1976d2", textDecoration: "underline" }}
                            >
                                {/* {file.name} */}
                                View File
                            </a>
                        </Typography>
                    )}

                    <Box display="flex" justifyContent="center" gap={2}>
                        <Button type="submit" variant="contained" color="success" disabled={!file}>
                            {isEditing ? "Update" : "Upload"}
                        </Button>
                        {isEditing && (
                            <Button variant="outlined" color="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                        )}
                    </Box>
                </Box>
            </StyledBox>

            <StyledBox>
                <Typography variant="h5" align="center" gutterBottom>
                    All RTI Documents
                </Typography>

                {rtiDocuments.length === 0 ? (
                    <Typography align="center" color="text.secondary">
                        No RTI documents found.
                    </Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Document Name</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>

                                {rtiDocuments.map((item) => (

                                    <TableRow key={item.id}>

                                        <TableCell>{item.id}</TableCell>

                                        <TableCell>{item.documentName}</TableCell>

                                        <TableCell>{getStatusChip(item.status)}</TableCell>

                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleEditClick(item)}
                                                sx={{ mr: 1 }}
                                            >
                                                Edit
                                            </Button>

                                            {item.status === "PENDING_APPROVAL" && (
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    size="small"
                                                    // onClick={() => handleApproveClick(item)}
                                                    onClick={() => {
                                                        setItemToApprove(item);
                                                        setShowApproveConfirm(true); // open confirmation dialog
                                                    }}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Approve
                                                </Button>
                                            )}

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                // onClick={() => handleToggleVisibility(item)}
                                                onClick={() => {
                                                    setItemToToggle(item);
                                                    setShowToggleConfirm(true); // open dialog
                                                }}
                                                sx={{
                                                    mr: 1,
                                                    color: item.isVisible ? "purple" : "blue",
                                                    borderColor: item.isVisible ? "purple" : "blue",
                                                    "&:hover": {
                                                        borderColor: item.isVisible ? "purple" : "blue",
                                                        backgroundColor: item.isVisible
                                                            ? "rgba(128, 0, 128, 0.1)"   //  purple hover
                                                            : "rgba(0, 0, 255, 0.1)",   //  blue hover
                                                    },
                                                }}
                                            >
                                                {item.isVisible ? "Disable" : "Enable"}
                                            </Button>


                                            {hasRole(['PORTAL_ADMIN']) && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteClick(item)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>

                                ))}
                            </TableBody>

                        </Table>
                    </TableContainer>
                )}
            </StyledBox>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this RTI document? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Approve Dialog */}
            <Dialog open={showApproveConfirm} onClose={() => setShowApproveConfirm(false)}>
                <DialogTitle>Confirm Approval</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve this RTI document? Once approved, it will be visible to all users.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowApproveConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmApprove} color="success" autoFocus>
                        Yes, Approve
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toggle Visibility Dialog */}
            <Dialog open={showToggleConfirm} onClose={() => setShowToggleConfirm(false)}>
                <DialogTitle>Confirm {itemToToggle?.isVisible ? "Disable" : "Enable"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {itemToToggle?.isVisible ? "disable" : "enable"} this RTI document?
                        {itemToToggle?.isVisible ? " It will no longer be visible to public users." : ""}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowToggleConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    {/* <Button 
                        onClick={handleConfirmToggle} 
                        color={itemToToggle?.isVisible ? "warning" : "success"} 
                        autoFocus
                    >
                        {itemToToggle?.isVisible ? "Disable" : "Enable"}
                    </Button> */}
                    <Button
                        onClick={handleConfirmToggle}
                        sx={{
                            color: itemToToggle?.isVisible ? "purple" : "blue", // text color
                            borderColor: itemToToggle?.isVisible ? "purple" : "green",
                            "&:hover": {
                                backgroundColor: itemToToggle?.isVisible ? "rgba(128,0,128,0.1)" : "rgba(0,128,0,0.1)",
                                borderColor: itemToToggle?.isVisible ? "purple" : "green",
                            },
                        }}
                        autoFocus
                    >
                        {itemToToggle?.isVisible ? "Yes, Disable" : "Yes, Enable"}
                    </Button>

                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RtiDocumentManagementPage;
