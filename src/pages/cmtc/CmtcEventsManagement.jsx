import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Container,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import CustomisedReactQuill from "../../components/common/CustomReactQuill";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  getAdminEventSummaryList,
  getAdminEventById,
  updateEvent,
  createEvent,
  deleteEvent
} from '../../services/cmtcEventsService';

import { USER_ROLES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

/* ✅ HOOKS */
import useLocationData from "../../hooks/useLocationData";
import useCmtcData from "../../hooks/useCmtcData";
import { getByteSize } from '../../utils/helpers';

const MAX_CONTENT_BYTES = 16 * 1024 * 1024; // 16 MB

const CmtcEventsManagementPage = () => {
   const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, hasRole } = useAuth();
  const isEditing = Boolean(id);
  const [showForm, setShowForm] = useState(false);
  /* ================= ROLE PERMISSIONS ================= */

  const canChangeDistrict = hasRole([
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.ZONAL_HEAD
  ]);

  const canChangeBlock = hasRole([
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.ZONAL_HEAD,
    USER_ROLES.DISTRICT_OFFICER
  ]);

  const canChangeCenter = hasRole([
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.ZONAL_HEAD,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER
  ]);

  const isCmtcLocked = hasRole([
    USER_ROLES.CMTC_MANAGER,
    USER_ROLES.CMTC_STAFF
  ]);
  const initialForm = {
    centerId: '',
    titleHindi: '',
    titleEnglish: '',
    summaryHindi: '',
    summaryEnglish: '',
    contentHindi: '',
    contentEnglish: '',
    status: '',
    imageUrl: '',
    pdfUrl: '',
    videoUrl: '',
  };

  const initialFiles = {
    imageFile: null,
    pdfFile: null,
    videoFile: null,
  };


  const { t,i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [imagePreview, setImagePreview] = useState(null);



  /* ================= HOOKS ================= */
  const location = useLocationData({ isHindi });
  const cmtc = useCmtcData({ canChangeCenter });

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(initialForm);
  const [files, setFiles] = useState(initialFiles);

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await location.fetchDistricts();


      if (isEditing) {
        const data = await getAdminEventById(id);

        const districtId = data?.districtId;
        const blockId = data?.blockId;

        // IMPORTANT: fetch blocks before setting block
        location.setSelectedDistrict(districtId);
        if (districtId) {
          await location.fetchBlocks(districtId);
        }
        location.setSelectedBlock(blockId);

        setFormData({
          centerId: data.centerId || '',
          titleHindi: data.titleHindi || '',
          titleEnglish: data.titleEnglish || '',
          summaryHindi: data.summaryHindi || '',
          summaryEnglish: data.summaryEnglish || '',
          contentHindi: data.contentHindi || '',
          contentEnglish: data.contentEnglish || '',
          status: data.status || 'PENDING_APPROVAL',
          imageUrl: data.imageUrl || '',
          pdfUrl: data.pdfUrl || '',
          videoUrl: data.videoUrl || '',
        });
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }

      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id, isEditing, location.fetchDistricts, location.fetchBlocks]);

  useEffect(() => {
    if (location.selectedDistrict) {
      location.fetchBlocks(location.selectedDistrict);
    }
  }, [location.fetchBlocks]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= BLOCK → CENTER ================= */

  useEffect(() => {
    if (location.selectedBlock) {
      cmtc.fetchCenters(location.selectedBlock);
      if (!isEditing) {
        setFormData(p => ({ ...p, centerId: '' }));
      }
    } else {
      cmtc.resetCenters();
    }
  }, [location.selectedBlock]);

  useEffect(() => {
    if (!user || isEditing) return;
    if (!location.selectedDistrict) return;

    // fetch blocks first
    location.fetchBlocks(location.selectedDistrict).then(() => {
      if (
        hasRole([USER_ROLES.BLOCK_OFFICER]) &&
        user.blockId
      ) {
        location.setSelectedBlock(user.blockId);
      }
    });
  }, [location.selectedDistrict, user, isEditing]);

  const fetchEventsList = useCallback(async () => {
    try {
      const res = await getAdminEventSummaryList(
        page,
        rowsPerPage,
        "id",
        "DESC"
      );

      setEvents(res.content || []);
      setTotalEvents(res.totalElements || 0);
    } catch (err) {
      toast.error("Failed to load events list");
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchEventsList();
  }, [fetchEventsList, i18n.language]);

  useEffect(() => {
    if (!location.districts.length) return;

    // 🔹 District Officer / Block Officer
    if (hasRole([USER_ROLES.DISTRICT_OFFICER, USER_ROLES.BLOCK_OFFICER])) {
      if (user?.districtId) {
        location.setSelectedDistrict(user.districtId);
      }
    }
  }, [location.districts]);


  /* ================= HANDLERS ================= */
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
      const value = parseInt(e.target.value, 10);
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles?.[0] || null;

    setFiles(prev => ({
      ...prev,
      [name]: file,
    }));

    // ✅ Image preview
    if (name === "imageFile" && file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      await deleteEvent(id); 
      setEvents((prev) => prev.filter((e) => e.id !== id)); 
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.centerId) {
      toast.error("CMTC Center is required");
      return;
    }

    // ✅ CONTENT SIZE VALIDATION
    const hindiBytes = getByteSize(formData.contentHindi);
    const englishBytes = getByteSize(formData.contentEnglish);

    if (hindiBytes > MAX_CONTENT_BYTES) {
      toast.error(
        isHindi
          ? "हिंदी विवरण  16 एमबी सीमा से अधिक है"
          : "Hindi detail exceeds 16 MB limit"
      );
      return;
    }

    if (englishBytes > MAX_CONTENT_BYTES) {
      toast.error(
        isHindi
          ? "अंग्रेज़ी विवरण  16 एमबी सीमा से अधिक है"
          : "English detail exceeds 16 MB limit"
      );
      return;
    }



    try {
      const payload = {
        ...formData,
        districtId: location.selectedDistrict,
        blockId: location.selectedBlock,
      };

      if (isEditing) {
        await updateEvent(
          id,
          payload,
          files.imageFile,
          files.pdfFile,
          files.videoFile
        );
        toast.success("Event updated ");
      } else {
        await createEvent(
          payload,
          files.imageFile,
          files.pdfFile,
          files.videoFile
        );
        toast.success("Event created ");
      }

      resetForm();
      navigate("/admin/cmtc-events");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (isEditing) {
      setShowForm(true);
    }
  }, [isEditing]);
  const resetForm = useCallback(() => {
    setFormData(initialForm);
    setFiles(initialFiles);
    setImagePreview(null);
  }, []);
 const cardSx = {
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
    boxShadow:
      theme.palette.mode === "dark" ? `0 18px 50px ${alpha("#000", 0.35)}` : `0 18px 50px ${alpha("#111827", 0.10)}`,
    background: theme.palette.mode === "dark" ? alpha("#0f1a2c", 0.78) : alpha("#ffffff", 0.92),
    backdropFilter: "blur(10px)",
  };


  if (loading) return <LoadingSpinner />;

  /* ================= JSX ================= */

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <ToastContainer />
       <Box sx={{ mb: 2.5, p: 2.2, borderRadius: 3 ,border:"1px solid grey", ...cardSx}}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box >
              <Typography
                variant="h6"
                component="h6"
                sx={{
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  mb: 1,
                  fontSize:"16px"
                  }}
                > {isEditing ? t("admin.editEvent") : t("admin.addEvent")}</Typography>
                <Typography sx={{ mt: 0.2, color: alpha(theme.palette.text.primary, 0.65), fontSize:"14px" }}>
                  {t("admin.eventText")} 
                </Typography>
            </Box>
          </Stack>
      
          <Stack direction="row" spacing={1.2}>
            <Button
              variant="contained"
              onClick={() => {
              resetForm();
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            >
            {t("admin.createEvent")}
            </Button>
          </Stack>
        </Stack>
      </Box>

    {showForm && (      
      <Paper sx={{ p: 3 , mb: 2 , border:"1px solid grey", borderRadius:3}}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ p: 2 }} >
        <Button onClick={() => setShowForm(false)}  variant="outlined">
          Close
        </Button>
      </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            {/* ===== LOCATION ===== */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label={t("admin.district")}
                value={location.selectedDistrict}
                onChange={(e) => location.setSelectedDistrict(e.target.value)}
                disabled={isEditing || !canChangeDistrict}
                fullWidth
              >
                {location.districts.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label={t("admin.block")}
                value={location.selectedBlock}
                onChange={(e) => location.setSelectedBlock(e.target.value)}
                fullWidth
                disabled={isEditing || !canChangeBlock || !location.selectedDistrict}
              >
                {location.blocks.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label={t("admin.cmtcCenter")}
                name="centerId"
                value={formData.centerId}
                onChange={handleChange}
                fullWidth
                required
                disabled={isEditing || !canChangeCenter || isCmtcLocked}
              >
                {cmtc.centers.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* ===== TITLES ===== */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("admin.titleHindi")}
                name="titleHindi"
                value={formData.titleHindi}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("admin.titleEnglish")}
                name="titleEnglish"
                value={formData.titleEnglish}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* ===== SUMMARY ===== */}

            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("admin.summaryHindi")}
                name="summaryHindi"
                value={formData.summaryHindi}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("admin.summaryEnglish")}
                name="summaryEnglish"
                value={formData.summaryEnglish}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>

            {/* ===== CONTENT ===== */}

            <Grid item xs={12}>
              <Typography variant="subtitle1">{t("admin.contentHindi")}</Typography>
              <CustomisedReactQuill
                value={formData.contentHindi}
                onChange={(v) =>
                  setFormData(p => ({ ...p, contentHindi: v }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">{t("admin.contentEnglish")}</Typography>
              <CustomisedReactQuill
                value={formData.contentEnglish}
                onChange={(v) =>
                  setFormData(p => ({ ...p, contentEnglish: v }))
                }
              />
            </Grid>

            {/* ===== FILE UPLOADS ===== */}
            <Grid item xs={12} textAlign="center">
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Event Preview"
                  sx={{
                    mt: 2,
                    maxHeight: 250,
                    maxWidth: "100%",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                />
              )}
            </Grid>

            <Grid item size={{ xs: 12, md: 12 }}>
              <Button component="label" variant="outlined" fullWidth>
               {t("admin.uploadImage")}
                <input
                  type="file"
                  hidden
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>



            {/* ===== SUBMIT ===== */}

            <Grid item xs={12} textAlign="center" mt={2}>
              {isEditing && (
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 2 }}
                  onClick={() => {
                    resetForm();
                    navigate("/admin/cmtc-events");
                  }}

                >
                  Cancel
                </Button>
              )}

              <Button type="submit" variant="contained" size="large">
                {isEditing ? t("admin.updateEvent") : t("admin.createEvent")}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      )}

      <Paper sx={{ p: 3 , mb: 2 , border:"1px solid grey", borderRadius:3}}>
        <Typography variant="h6" gutterBottom sx={{fontSize:"16px" , fontWeight:600}}>
          {t("admin.existingEvent")}
        </Typography>

        <TableContainer sx={{
                borderRadius: 1,
                border: "1px solid grey",
                overflow: "hidden",
                }}>
          <Table size="small">
            <TableHead>
              <TableRow  sx={{
                "& th": {
                borderBottom:"1px solid grey",
                background:"#155a55",
                color:"white"
                },
                }}>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.sNo")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}> {t("admin.title")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}> {t("admin.cmtcCenter")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}> {t("admin.status")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.action")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.preview")}</TableCell>
                <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.delete")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ fontSize: "14px" }}>
                    {t("admin.noEvent")}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event, index) => (
                  <TableRow key={event.id}>
                    <TableCell  sx={{ fontSize: "14px" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>

                    <TableCell  sx={{ fontSize: "14px" }}>
                      {isHindi ? event.titleHindi : event.titleEnglish}
                    </TableCell>

                    <TableCell  sx={{ fontSize: "14px" }}>
                      {event.centerName || "-"}
                    </TableCell>

                    <TableCell  sx={{ fontSize: "14px" }}>
                      <Chip
                        size="small"
                        label={event.status}
                        color={
                          event.status === "APPROVED"
                            ? "success"
                            : event.status === "REJECTED"
                              ? "error"
                              : "warning"
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ fontSize: "14px" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/admin/cmtc-events/${event.id}`)
                        }
                      >
                       <EditOutlinedIcon fontSize="small" />
                      </Button>
                    </TableCell>
                    <TableCell  sx={{ fontSize: "14px" }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/cmtc-events/${event.id}`)}
                      >
                       {t("admin.view")}
                      </Button>
                    </TableCell>
                    <TableCell  sx={{ fontSize: "14px" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(event.id)}
                      >
                      <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalEvents}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, { label: "All", value: -1 },]}
        />
      </Paper>

    </Container>
  );
};

export default CmtcEventsManagementPage;
