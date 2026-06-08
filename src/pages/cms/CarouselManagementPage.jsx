import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    Card,
    CardMedia,
    CardContent,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Chip } from "@mui/material";
import {
    getAllCarouselSlidesAdmin,
    createCarouselSlide,
    updateCarouselSlide,
    deleteCarouselSlide,
    approveCarouselSlide,
    rejectCarouselSlide,
    reorderCarouselSlides
} from './../../services/carouselService';
import {formatDateToStringDDMMYYYY} from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext';

// ---------------- Styled components ----------------
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.background.paper,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    '&:hover': {
        color: theme.palette.primary.dark,
    },
}));

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.error.main,
    '&:hover': {
        color: theme.palette.error.dark,
    },
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// ---------------- Main component ----------------
const CarouselManagementPage = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasRole } = useAuth();

    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(null);

    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [slideToApprove, setSlideToApprove] = useState(null);
    const [slideToReject, setSlideToReject] = useState(null);

    const pointerSensor = useSensor(PointerSensor);
    const sensors = useSensors(pointerSensor);


    // form states
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [fromDate, setFromDate] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [toDate, setToDate] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [isFormLoading, setIsFormLoading] = useState(false);

    const [orderChanged, setOrderChanged] = useState(false);
    const [originalSlides, setOriginalSlides] = useState([]);

    const handleSaveOrder = async () => {
        try {
            const ordered = slides.map((slide, index) => ({
                id: slide.id,
                priority: index + 1,
            }));

            await reorderCarouselSlides(ordered);

            toast.success("Order saved successfully!");
            setOriginalSlides(slides.map(s => s.id)); // update reference
            setOrderChanged(false); // hide button
        } catch (error) {
            console.error("Failed to save order:", error);
            toast.error("Failed to save order.");
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await getAllCarouselSlidesAdmin();
            const fetched = response.data;
            setSlides(fetched);
            setOriginalSlides(fetched.map(s => s.id)); // store order reference
            setOrderChanged(false);
        } catch (error) {
            console.error('Failed to fetch slides:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    const handleOpenDialog = (slide = null) => {
        if (slide) {
            setIsEditMode(true);
            setCurrentSlide(slide);
            setTitle(slide.title);
            setLink(slide.link);
            setFile(null);
            setImageUrl(slide.imageUrl||"");
            setPreview(slide.imageUrl ? `${import.meta.env.VITE_BASE_URL}${slide.imageUrl}` : null);
        } else {
            setIsEditMode(false);
            setCurrentSlide(null);
            setTitle('');
            setLink('');
            setFile(null);
            setPreview(null);
        }
        setFormMessage('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => setOpenDialog(false);
    const handleOpenDeleteDialog = (slide) => {
        setCurrentSlide(slide);
        setOpenDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setCurrentSlide(null);
    };
    const formatDateForBackend = (date) => {
        return date ? `${date}T00:00:00` : null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormMessage('');

        if (!file && !isEditMode) {
            toast.error('Please select an image.');
            return;
        }

        setIsFormLoading(true);

        try {
            let response;
            const formData = new FormData();
            formData.append(
                'item',
                JSON.stringify({
                    title, link, fromDate: formatDateForBackend(fromDate),
                    toDate: formatDateForBackend(toDate),
                    imageUrl
                })
            );
            if (file) formData.append('mediaFile', file);

            if (isEditMode) {
                response = await updateCarouselSlide(currentSlide.id, formData);
            } else {
                response = await createCarouselSlide(formData);
            }

            if (response) {
                fetchSlides();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error saving slide:', error);
            setFormMessage('Failed to save slide.');
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleApproveClick = (slide) => {
        setSlideToApprove(slide);
        setShowApproveConfirm(true);
    };

    const handleRejectClick = (slide) => {
        setSlideToReject(slide);
        setShowRejectConfirm(true);
    };

    const handleConfirmApprove = async () => {
        if (!slideToApprove) return;
        try {
            await approveCarouselSlide(slideToApprove.id);
            fetchSlides();
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setShowApproveConfirm(false);
            setSlideToApprove(null);
        }
    };

    const handleConfirmReject = async () => {
        if (!slideToReject) return;
        try {
            await rejectCarouselSlide(slideToReject.id);
            fetchSlides();
        } catch (error) {
            console.error('Rejection failed:', error);
        } finally {
            setShowRejectConfirm(false);
            setSlideToReject(null);
        }
    };

    const getStatusChip = (status) => {
        let color;
        let label = status.replace('_', ' ');
        switch (status) {
            case 'PUBLISHED':
            case 'ACTIVE':
                color = 'success';
                break;
            case 'PENDING_APPROVAL':
                color = 'warning';
                break;
            case 'REJECTED':
            case 'DELETED':
                color = 'error';
                break;
            default:
                color = 'default';
                break;
        }
        return <Chip label={label} color={color} size="small" />;
    };


    const handleDeleteConfirm = async () => {
        if (!currentSlide) return;
        try {
            await deleteCarouselSlide(currentSlide.id);
            fetchSlides();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            handleCloseDeleteDialog();
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom style={{ color: '#4A000E' }}>
                    Image Slider Management
                </Typography>
                <Typography variant="body1" color="text.secondary" style={{ color: '#4A000E' }}>
                    Manage the slides for your main hero carousel.
                </Typography>
            </Box>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mb: 2 }}
            >
                Add New Slide
            </Button>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <StyledPaper>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={({ active, over }) => {
                            if (over && active.id !== over.id) {
                                const oldIndex = slides.findIndex((s) => s.id === active.id);
                                const newIndex = slides.findIndex((s) => s.id === over.id);
                                const newOrder = arrayMove(slides, oldIndex, newIndex);
                                setSlides(newOrder);

                                // Check if order differs from original
                                const newOrderIds = newOrder.map(s => s.id);
                                const changed = newOrderIds.some((id, i) => id !== originalSlides[i]);
                                setOrderChanged(changed);
                            }
                        }}

                    >
                        <SortableContext
                            items={slides.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>Image</TableCell>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Link</TableCell>
                                            <TableCell>From Date</TableCell>
                                            <TableCell>To Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {slides.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No slides found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            slides.map((slide, index) => (
                                                <SortableRow
                                                    key={slide.id}
                                                    slide={slide}
                                                    index={index}
                                                    onEdit={handleOpenDialog}
                                                    onDelete={handleOpenDeleteDialog}
                                                    getStatusChip={getStatusChip}
                                                    hasRole={hasRole}
                                                    onApprove={handleApproveClick}
                                                    onReject={handleRejectClick}
                                                />
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </SortableContext>
                    </DndContext>

                    {/* Optional “Save Order” button */}
                    {orderChanged && (
                        <Box sx={{ mt: 2, textAlign: "right" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveOrder}
                            >
                                Save Order
                            </Button>
                        </Box>
                    )}

                </StyledPaper>
            )}

            {/* Add/Edit Slide Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>{isEditMode ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
                <DialogContent dividers>
                    <form onSubmit={handleSubmit} id="upload-form">
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                        <TextField
                            fullWidth
                            label="Image Title"
                            variant="outlined"
                            margin="normal"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}

                        />
                        <TextField
                            fullWidth
                            label="Link URL"
                            variant="outlined"
                            margin="normal"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}

                        />
                        <TextField
                            fullWidth
                            label="From Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="To Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                        <Box
                            sx={{
                                my: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<AddPhotoAlternateIcon />}
                            >
                                Select Image
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </Button>
                            {file && (
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ mt: 1 }}
                                >
                                    Selected File: {file.name}
                                </Typography>
                            )}
                        </Box>
                        {preview && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Image Preview:
                                </Typography>
                                <Card
                                    sx={{ maxWidth: 300, mx: 'auto', mt: 1, borderRadius: 2 }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={preview}
                                        alt="Image Preview"
                                    />
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            {title || 'No Title'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                        {formMessage && (
                            <Typography
                                variant="body1"
                                sx={{
                                    mt: 2,
                                    textAlign: 'center',
                                    color: formMessage.includes('success')
                                        ? 'success.main'
                                        : 'error.main',
                                }}
                            >
                                {formMessage}
                            </Typography>
                        )}

                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        endIcon={<CloudUploadIcon />}
                        disabled={isFormLoading}
                    >
                        {isFormLoading ? (
                            <CircularProgress size={24} />
                        ) : isEditMode ? (
                            'Save Changes'
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this carousel slide? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={showApproveConfirm} onClose={() => setShowApproveConfirm(false)}>
                <DialogTitle>Confirm Approval</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve this carousel slide?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowApproveConfirm(false)} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmApprove} color="success" autoFocus>
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog open={showRejectConfirm} onClose={() => setShowRejectConfirm(false)}>
                <DialogTitle>Confirm Rejection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reject this carousel slide?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRejectConfirm(false)} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmReject} color="error" autoFocus>
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>


        </Container>
    );
};

const HandleWrapper = styled('div')(({ isDragging }) => ({
    height: '1rem',
    verticalAlign: 'bottom',
    display: 'inline-block',
    marginRight: '0.5rem',
    cursor: isDragging
        ? "url('/cursors/grabbing-red.png') 12 12, grabbing"
        : "url('/cursors/grab-red.png') 12 12, grab",
    '& svg': {
        width: '100%',
        height: '100%',
    },
}));


export const DragHandle = (props) => {
    return (
        <HandleWrapper {...props}>
            <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="grip-vertical"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
            >
                <path
                    fill="currentColor"
                    d="M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zM288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32z"
                ></path>
            </svg>
        </HandleWrapper>
    );
};


// 🧱 Sortable Row Component for DnD Kit
const SortableRow = ({ slide, index, onEdit, onDelete, getStatusChip, hasRole, onApprove, onReject }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: isDragging ? "#f9f9f9" : "inherit",
        cursor: isDragging ? "grabbing" : "default", // <- row cursor

    };

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell>
                {/* Drag Handle */}
                <Box
                    {...listeners} // only listeners here
                    {...attributes} // only attributes here
                    sx={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        display: 'inline-block',
                        mr: 1,
                        userSelect: 'none', // prevent text selection while dragging
                    }}
                >
                    <DragHandle isDragging={isDragging} />
                </Box>
            </TableCell>

            <TableCell>
                <Box
                    component="img"
                    src={`${import.meta.env.VITE_BASE_URL}${slide.imageUrl}`}
                    alt={slide.title}
                    sx={{
                        width: 100,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 1,
                    }}
                />
            </TableCell>
            <TableCell>{slide.title}</TableCell>
            <TableCell>
                <a href={slide.link} target="_blank" rel="noopener noreferrer">
                    {slide.link}
                </a>
            </TableCell>
            <TableCell>{formatDateToStringDDMMYYYY(slide.fromDate)}</TableCell>
            <TableCell>{formatDateToStringDDMMYYYY(slide.toDate)}</TableCell>
            <TableCell>{getStatusChip(slide.status)}</TableCell>
            <TableCell align="right">
                <IconButton onClick={() => onEdit(slide)}>
                    <EditIcon />
                </IconButton>
                {hasRole(["PORTAL_ADMIN"]) && (
                    <IconButton onClick={() => onDelete(slide)} color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
                {slide.status === "PENDING_APPROVAL" &&
                    hasRole(["PORTAL_ADMIN", "PUBLISHER"]) && (
                        <>
                            <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => onApprove(slide)}
                                sx={{ ml: 1 }}
                            >
                                Approve
                            </Button>
                            {hasRole(["PORTAL_ADMIN"]) && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => onReject(slide)}
                                    sx={{ ml: 1 }}
                                >
                                    Reject
                                </Button>
                            )}
                        </>
                    )}
            </TableCell>
        </TableRow>

    );
};


export default CarouselManagementPage;
