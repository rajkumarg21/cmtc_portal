import {
    Box,
    Button,
    Container,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Stack,
    MenuItem,
    Select,
    FormControl,
    InputLabel,

} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getAdminAllAds,
    createAd,
    updateAd,
    deleteAd,
    approveAd,
    rejectAd,
    // you should implement this service to upload images and return imageUrl
} from "../../services/adsService";
import { Edit, Delete, CheckCircle, Cancel } from "@mui/icons-material";
import { USER_ROLES, CONTENT_STATUS } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext';
import StatusChip from '../../components/ui/StatusChip';

const AdvertisementManagementPage = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [entryToApprove, setEntryToApprove] = useState(null);
    const [entryToReject, setEntryToReject] = useState(null);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const { hasRole } = useAuth();



    const [filters, setFilters] = useState({
        status: "",
        active: "",
        startDate: "",
        endDate: "",
        minPriority: "",
        maxPriority: "",
    });

    const [form, setForm] = useState({
        title: "",
        description: "",
        alternateText: "",
        targetLink: "",
        startDate: "",
        endDate: "",
        priority: 1,
        active: true,
        status: CONTENT_STATUS.PENDING_APPROVAL,
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const data = await getAdminAllAds();
            setAds(data);
        } catch (error) {
            console.error("Error fetching ads", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (entry) => {
        setEntryToApprove(entry);
        setOpenDialog(true);
    };

    const handleRejectClick = (entry) => {
        setEntryToReject(entry);
        setOpenRejectDialog(true);
    };

    // Replace the old handleCloseRejectDialog with:
    const handleCloseRejectDialog = () => {
        // close the reject dialog and clear selected entry
        setOpenRejectDialog(false);
        setEntryToReject(null);
    };

    // Replace handleRejectConfirm with:
    const handleRejectConfirm = async () => {
        if (!entryToReject) return;
        try {
            setLoading(true);
            await rejectAd(entryToReject.id);
            toast.success("Entry rejected successfully.");
            await fetchAds(); // refresh list from server
        } catch (error) {
            console.error("Error rejecting:", error);
            toast.error("Failed to reject entry.");
        } finally {
            setLoading(false);
            handleCloseRejectDialog();
        }
    };


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEntryToApprove(null);
    };

    const handleApproveConfirm = async () => {
        if (!entryToApprove) return;
        try {
            setLoading(true);
            await approveAd(entryToApprove.id);   // ✅ use correct service
            toast.success("Entry approved successfully.");
            await fetchAds();                     // ✅ refresh ads instead of fetchEntries
        } catch (error) {
            console.error("Error approving:", error);
            toast.error("Failed to approve entry.");
        } finally {
            setLoading(false);
            handleCloseDialog();
        }
    };


    const handleDeleteClick = (entryToDelete) => {
        setEntryToDelete(entryToDelete);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setEntryToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!entryToDelete) return;

        try {
            setLoading(true);
            await deleteAd(entryToDelete.id);
            setAds((prev) => prev.filter((ad) => ad.id !== entryToDelete)); // ✅ remove from state
            toast.success("Entry deleted successfully.");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete entry.");
        } finally {
            setLoading(false);
            handleCloseDeleteDialog();
        }
    };



    const handleOpen = (ad = null) => {
        setSelectedAd(ad);
        setForm(
            ad
                ? {
                    title: ad.title ?? "",
                    description: ad.description ?? "",
                    alternateText: ad.alternateText || "",
                    targetLink: ad.targetLink || "",
                    startDate: ad.startDate ? ad.startDate.slice(0, 16) : "",
                    endDate: ad.endDate ? ad.endDate.slice(0, 16) : "",
                    priority: ad.priority || 1,
                    active: ad.active,
                    status: ad.status,
                }
                : {
                    title: "",
                    description: "",
                    alternateText: "",
                    targetLink: "",
                    startDate: "",
                    endDate: "",
                    priority: 1,
                    active: true,
                    status: "PENDING_APPROVAL",
                }
        );
        setImageFile(null);
        setPreview(ad ? `${import.meta.env.VITE_BASE_URL}${ad.imageUrl}` : null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedAd(null);
        setImageFile(null);
        setPreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
         if (!file) return;
        if ( file.size >100 * 1024) {
       alert("Image size should not exceed 100 KB.");
       e.target.value = null;
      return;
  }
        setImageFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!imageFile && !selectedAd) {
            toast.error("Image is required");
            return;
        }
        const payload = { ...form };
        try {
            if (selectedAd) {
                await updateAd(selectedAd.id, payload, imageFile);
            } else {
                await createAd(payload, imageFile);
            }

            fetchAds();
            handleClose();
            toast.success("HSG PRODUCTS saved successfully!");
        } catch (error) {
            console.error("Error saving ad", error);
            toast.error("Failed to save HSG PRODUCTS");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this ad?")) {
            try {
                await deleteAd(id);
                fetchAds();
                toast.success("HSG PRODUCTS deleted successfully!");
            } catch (error) {
                console.error("Error deleting ad", error);
                toast.error("Failed to delete HSG PRODUCTS");
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveAd(id);
            fetchAds();
            toast.success("HSG PRODUCTS approved!");
        } catch (error) {
            console.error("Error approving ad", error);
            toast.error("Failed to approve HSG PRODUCTS");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectAd(id);
            fetchAds();
            toast.success("HSG PRODUCTS rejected!");
        } catch (error) {
            console.error("Error rejecting ad", error);
            toast.error("Failed to reject HSG PRODUCTS");
        }
    };

    const filteredAds = ads.filter((ad) => {
        if (filters.status && ad.status !== filters.status) return false;
        if (filters.active && (ad.active ? "Yes" : "No") !== filters.active) return false;
        if (filters.startDate && new Date(ad.startDate) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(ad.endDate) > new Date(filters.endDate)) return false;
        if (filters.minPriority && ad.priority < parseInt(filters.minPriority)) return false;
        if (filters.maxPriority && ad.priority > parseInt(filters.maxPriority)) return false;
        return true;
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">HSG PRODUCTS Management</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                    Add New Ad
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 1.5, mb: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" >
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            size="small"
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
                            <MenuItem value="PENDING_APPROVAL">Pending</MenuItem>
                            <MenuItem value="REJECTED">Rejected</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 100 }}>
                        <InputLabel>Active</InputLabel>
                        <Select
                            value={filters.active}
                            label="Active"
                            size="small"
                            onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        required
                    />

                    <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        required
                    />

                    <TextField
                        label="Min Priority"
                        type="number"
                        value={filters.minPriority}
                        size="small"
                        sx={{ width: 150 }}
                        onChange={(e) => setFilters({ ...filters, minPriority: e.target.value })}
                    />

                    <TextField
                        label="Max Priority"
                        type="number"
                        size="small"
                        sx={{ width: 150 }}
                        value={filters.maxPriority}
                        onChange={(e) => setFilters({ ...filters, maxPriority: e.target.value })}
                    />

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                            setFilters({
                                status: "",
                                active: "",
                                startDate: "",
                                endDate: "",
                                minPriority: "",
                                maxPriority: "",
                            })
                        }
                    >
                        Clear
                    </Button>
                </Stack>
            </Paper>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Preview</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Alt Text</TableCell>
                                <TableCell>Link</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAds.map((ad) => (
                                <TableRow key={ad.id}>
                                    <TableCell>
                                        {ad.imageUrl ? (
                                            <img
                                                src={`${import.meta.env.VITE_BASE_URL}${ad.imageUrl}`}
                                                alt={ad.alternateText}
                                                style={{ width: 100, borderRadius: 8 }}
                                            />
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>{ad.title}</TableCell>
                                    <TableCell>{ad.description}</TableCell>
                                    <TableCell>{ad.alternateText}</TableCell>
                                    <TableCell>
                                        {ad.targetLink ? (
                                            <a href={ad.targetLink} target="_blank" rel="noopener noreferrer">
                                                {ad.targetLink}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell><StatusChip status={ad.status} /></TableCell>
                                    <TableCell>{ad.active ? "Yes" : "No"}</TableCell>
                                    {/* <TableCell>{ad.startDate || "—"}</TableCell>
                                    <TableCell>{ad.endDate || "—"}</TableCell> */}
                                    <TableCell>
                                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString("en-GB") : "—"}
                                    </TableCell>
                                    <TableCell>
                                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString("en-GB") : "—"}
                                    </TableCell>
                                    <TableCell>{ad.priority}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1}>
                                            <IconButton color="primary" onClick={() => handleOpen(ad)}>
                                                <Edit />
                                            </IconButton>
                                            {ad.status === CONTENT_STATUS.PENDING_APPROVAL && hasRole([USER_ROLES.PUBLISHER, USER_ROLES.PORTAL_ADMIN]) && (
                                                <>
                                                    <Button variant="outlined" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleApproveClick(ad)}>
                                                        Approve
                                                    </Button>
                                                    <Button variant="outlined" color="error" size="small" sx={{ mr: 1 }} onClick={() => handleRejectClick(ad)}>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {hasRole(['PORTAL_ADMIN']) && (
                                                <IconButton color="error" onClick={() => handleDeleteClick(ad)}>
                                                    <Delete />
                                                </IconButton>)
                                            }
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAds.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No HSG PRODUCTS found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for Create / Edit */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedAd ? "Edit HSG PRODUCTS" : "Add HSG PRODUCTS"}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />

                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        minRows={2}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Alt Text"
                        fullWidth
                        value={form.alternateText}
                        onChange={(e) => setForm({ ...form, alternateText: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Link (optional)"
                        fullWidth
                        value={form.targetLink}
                        onChange={(e) => setForm({ ...form, targetLink: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Start Date"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="End Date"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Priority"
                        type="number"
                        fullWidth
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    />

                    <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                        {imageFile ? imageFile.name : "Upload Image"}
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>

                    {preview && (
                        <Box mt={2}>
                            <Typography variant="body2">Image Preview:</Typography>
                            <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 8 }} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Aprrove dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{"Publish this Edition?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleApproveConfirm} color="success" autoFocus>
                        Yes, Publish
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject dialog */}
            <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
                <DialogTitle>{"Reject this Edition?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to Reject.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRejectDialog} color="primary">Cancel</Button>
                    <Button onClick={handleRejectConfirm} color="error" autoFocus>
                        Yes, Reject
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Delete dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>{"Are you sure you want to delete?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>


        </Container>
    );
};

export default AdvertisementManagementPage;
