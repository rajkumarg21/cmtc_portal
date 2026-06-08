import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  InputAdornment,
  Divider,
  TablePagination,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import BusinessIcon from "@mui/icons-material/Business";
import ImageIcon from "@mui/icons-material/Image";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllDistricts, getBlocksByDistrict } from "../../services/publicService";
import {
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  activateCenter,
  deactivateCenter,
  deleteCenter,
  getCentersByDistrict,
  getCentersByBlock
} from "../../services/cmtcCenterService";
import { useAuth } from "../../context/AuthContext.jsx";
import { USER_ROLES } from "../../utils/constants.js";

/* ✅ normalize any API response to array */
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.result)) return res.result;
  return [];
};

/* ✅ normalize select value: keep "" or convert numeric strings to numbers */
const normalizeSelectValue = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const s = String(v);
  return /^\d+$/.test(s) ? Number(s) : v;
};

/* ✅ normalize IDs coming from API objects */
const getDistrictId = (d) => d?.districtId ?? d?.id ?? d?.district_id ?? "";


const getBlockId = (b) => b?.blockId ?? b?.id ?? b?.block_id ?? "";

/* ✅ safe date to millis */
const toTime = (v) => {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
};

const SORT_OPTIONS = [
  { value: "LATEST", label: "Latest (Updated/Created)" },
  { value: "NAME_ASC", label: "Center Name (A–Z)" },
  { value: "NAME_DESC", label: "Center Name (Z–A)" },
  { value: "CODE_ASC", label: "Code (A–Z)" },
  { value: "CODE_DESC", label: "Code (Z–A)" },
];

/* ✅ safely coerce number fields ("" -> "", valid -> number) */
const normalizeNumberInput = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const s = String(v);
  if (s.trim() === "") return "";
  const n = Number(s);
  return Number.isFinite(n) ? n : "";
};

const isPositiveInt = (v) => {
  if (v === "" || v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
};

const CmtcCenterManagementPage = () => {
  const theme = useTheme();
  const { centerId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const isEditing = Boolean(centerId);

  const [centers, setCenters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  // ✅ snackbar (quick toast)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ✅ page banner (clear backend error/success)
  const [banner, setBanner] = useState({ open: false, message: "", severity: "success" });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState(null);

  // ✅ Search / filter / sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("LATEST");

  // ✅ pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // const [showForm, setShowForm] = useState(isEditing);
  const [showForm, setShowForm] = useState(false);
  const { user, userRole } = useAuth();

  useEffect(() => {
  if (isEditing) {
    setShowForm(true);
  }
}, [isEditing]);
  /**
   * ✅ Redesigned formData:
   * REMOVED: centerType, establishmentYear, trainingHalls, rooms
   * ADDED (mandatory): residentialCapacity, resPrice, nonResidentialCapacity, nonResPrice
   * NOTE: Backend still needs centerType, so we send centerType = "Both" in payload.
   */
  const [formData, setFormData] = useState({
    centerId: "",
    districtId: "",
    blockId: "",
    name: "",
    code: "",
    contactNumber: "",
    pincode: "",
    address: "",
    description: "",
    residentialCapacity: "",
    resPrice: "",
    nonResidentialCapacity: "",
    nonResPrice: "",
    isActive: true,

    imageUrl: "",
    imageFile: null,

    // ✅ NEW: Brochure (optional PDF)
    brochureUrl: "",
    brochureFile: null,
  });

  const showMessage = (msg, severity = "success") => {
    setSnackbar({ open: true, message: msg, severity });
    setBanner({ open: true, message: msg, severity }); // ✅ also show as banner
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));
  const handleCloseBanner = () => setBanner((prev) => ({ ...prev, open: false }));
  const getDistrictName = (d) =>
  isHindi
    ? d?.districtNameHi || d?.districtNameEn || ""
    : d?.districtNameEn || d?.districtNameHi || "";
 const getBlockName = (d) =>
  isHindi
    ? d?.blockNameHi || d?.blockNameEn || ""
    : d?.blockNameEn || d?.blockNameHi || "";
  /* =========================
     Fetchers (SAFE)
  ========================= */

  const fetchCenters = async () => {
    try {
      // const res = await getAllCenters();
      
      if(userRole === USER_ROLES.PORTAL_ADMIN){
        const res = await getAllCenters();
        setCenters(toArray(res));
      }else if(userRole === USER_ROLES.DISTRICT_OFFICER){
        const res = await getCentersByDistrict(user.districtId);
        console.log(res.data);
        setCenters(res.data);
      }else if(userRole === USER_ROLES.BLOCK_OFFICER){
        const res = await getCentersByBlock(user.blockId);
        setCenters(toArray(res.data));
      }
      console.log(centers);
    } catch (err){
      setCenters([]);
      showMessage("Failed to fetch centers",  "error");
    }
  };

//  directly API data se check
  const hasColumn = centers?.some(c => c?.contactNumber);


  const loadDistricts = async () => {
    try {
      const res = await getAllDistricts();
      setDistricts(toArray(res));
      //formData.districtId = user.districtId;
      //await loadBlocks(user.districtId);
      if (!isEditing) { 
        setFormData(prev => ({
          ...prev,
          districtId: user?.districtId || ""
        }));
       }

      if (user?.districtId) {
        await loadBlocks(user.districtId);
      }
    } catch {
      setDistricts([]);
      showMessage("Failed to load districts", "error");
    }
  };

  const loadBlocks = async (districtId,preserveExisting = false) => {
    try {
      const res = await getBlocksByDistrict(districtId);
      setBlocks(toArray(res));
      //formData.blockId = user.blockId;
      if (userRole === USER_ROLES.BLOCK_OFFICER && !preserveExisting) {
        setFormData(prev => ({
          ...prev,
          blockId: user?.blockId || ""
        }));
      }
    } catch {
      setBlocks([]);
      showMessage("Failed to load blocks", "error");
    }
  };

  const fetchCenterForEdit = async () => {
    if (!isEditing) return;

    try {
      const response = await getCenterById(centerId);
      const data = response?.data ?? response ?? {};

      const districtId = normalizeSelectValue(data.districtId ?? "");
      const blockId = normalizeSelectValue(data.blockId ?? "");

      setFormData((prev) => ({
        ...prev,
        centerId: data.centerId || data.id || "",
        districtId,
        blockId,
        name: data.name || "",
        code: data.code || "",
        contactNumber: data.contactNumber || "",
        pincode: data.pincode || "",
        address: data.address || "",
        description: data.description || "",
        residentialCapacity: data.residentialCapacity ?? "",
        resPrice: data.resPrice ?? "",
        nonResidentialCapacity: data.nonResidentialCapacity ?? "",
        nonResPrice: data.nonResPrice ?? "",
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,

        imageUrl: data.imageUrl || data.imageName || "",
        imageFile: null,

        // ✅ NEW: brochure (optional)
        brochureUrl: data.brochureUrl || data.brochureName || "",
        brochureFile: null,
      }));

      if (districtId) await loadBlocks(districtId);
    } catch {
      showMessage("Failed to load center details", "error");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCenters(), loadDistricts()]);
      await fetchCenterForEdit();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  /* =========================
     Form handlers
  ========================= */

  const clearError = (field) => {
    if (validationErrors?.[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Mobile: only digits, max 10
    if (name === "contactNumber") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError("contactNumber");
      return;
    }

    // ✅ Pincode: only digits, max 6 (required)
    if (name === "pincode") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError("pincode");
      return;
    }

    // ✅ numeric fields: allow empty or digits
    const numericFields = ["residentialCapacity", "resPrice", "nonResidentialCapacity", "nonResPrice"];
    if (numericFields.includes(name)) {
      if (value !== "" && !/^\d+$/.test(String(value))) return;
      const normalizedNum = normalizeNumberInput(value);
      setFormData((prev) => ({ ...prev, [name]: normalizedNum }));
      clearError(name);
      return;
    }

    const normalized = normalizeSelectValue(value);

    if (name === "districtId") {
      setFormData((prev) => ({ ...prev, districtId: normalized, blockId: "" }));
      setBlocks([]);
      if (normalized) loadBlocks(normalized);
      setValidationErrors((prev) => ({ ...prev, districtId: "", blockId: "" }));
      return;
    }

    if (name === "blockId") {
      setFormData((prev) => ({ ...prev, blockId: normalized }));
      clearError("blockId");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // 🔒 Role based locking logic
  const isDistrictLocked =
    userRole === USER_ROLES.DISTRICT_OFFICER ||
    userRole === USER_ROLES.BLOCK_OFFICER;

  const isBlockLocked =
    userRole === USER_ROLES.BLOCK_OFFICER;

  const validateForm = () => {
    const errors = {};

    // ✅ Mandatory (ALL fields)
    if (!formData.districtId) errors.districtId = t("validation_messages.districtRequired");
    if (!formData.blockId) errors.blockId = t("validation_messages.blockRequired");

    if (!formData.name?.trim()) errors.name = t("validation_messages.centerNameRequired");
    if (!formData.code?.trim()) errors.code = t("validation_messages.codeCodeRequired");

    if (!formData.contactNumber) errors.contactNumber = t("validation_messages.mobileNoRequired");
    else if (!/^\d{10}$/.test(String(formData.contactNumber)))
      errors.contactNumber = t("validation_messages.mobileDigitRequired");

    if (!formData.pincode) errors.pincode = t("validation_messages.pincodeRequired");
    else if (!/^\d{6}$/.test(String(formData.pincode))) errors.pincode = t("validation_messages.pincodeDigitRquired");

    if (!formData.address?.trim()) errors.address =  t("validation_messages.addressRequired");
    if (!formData.description?.trim()) errors.description = t("validation_messages.descriptionRequired");

    if (!isPositiveInt(formData.residentialCapacity)) errors.residentialCapacity = t("validation_messages.residentialCapacity");
    if (!isPositiveInt(formData.resPrice)) errors.resPrice = t("validation_messages.residentialPrice");
    if (!isPositiveInt(formData.nonResidentialCapacity))
      errors.nonResidentialCapacity = t("validation_messages.nonresidentialCapacity");
    if (!isPositiveInt(formData.nonResPrice)) errors.nonResPrice = t("validation_messages.nonresidentialPrice");

    // ✅ Image mandatory: either existing imageUrl or newly selected file
    const hasImage = Boolean(formData.imageFile) || Boolean(String(formData.imageUrl || "").trim());
    if (!hasImage) errors.imageFile = t("validation_messages.centerImageRequired");

    // ✅ Brochure optional, but if provided must be PDF
    if (formData.brochureFile) {
      const isPdf =
        formData.brochureFile.type === "application/pdf" || /\.pdf$/i.test(formData.brochureFile.name);
      if (!isPdf) errors.brochureFile =  t("validation_messages.brochureRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

const resetForm = async (options = { preserveRoleDefaults: true }) => {
  const { preserveRoleDefaults } = options;

  // Clear UI states (but DO NOT clear blocks immediately)
  setValidationErrors({});
  setBanner({ open: false, message: "", severity: "success" });

  const baseForm = {
    centerId: "",
    blockId: "",
    name: "",
    code: "",
    contactNumber: "",
    pincode: "",
    address: "",
    description: "",
    residentialCapacity: "",
    resPrice: "",
    nonResidentialCapacity: "",
    nonResPrice: "",
    isActive: true,
    imageUrl: "",
    imageFile: null,
    brochureUrl: "",
    brochureFile: null,
  };

  // 🔐 Compute role-based defaults FIRST
  let districtId = "";
  let blockId = "";
  let loadedBlocks = [];

  if (userRole === USER_ROLES.BLOCK_OFFICER) {
    districtId = user?.districtId || "";
    blockId = user?.blockId || "";
  } else if (userRole === USER_ROLES.DISTRICT_OFFICER) {
    districtId = user?.districtId || "";
    blockId = "";
  } else {
    // PORTAL_ADMIN or others
    districtId = "";
    blockId = "";
  }

  // 🔄 Load blocks BEFORE setting form (critical fix)
  if (districtId) {
    try {
      const res = await getBlocksByDistrict(districtId);
      loadedBlocks = Array.isArray(res) ? res : res?.data || [];
    } catch (err) {
      console.error("Failed to load blocks during reset", err);
      loadedBlocks = [];
    }
  }

  // Now update blocks + form together (single consistent render)
  setBlocks(loadedBlocks);

  setFormData({
    ...baseForm,
    districtId,
    blockId,
  });
};

  const buildPayload = () => {
    // ✅ backend requires centerType; UI removed it -> send "Both"
    const payload = {
      centerId: formData.centerId || null,
      districtId: formData.districtId,
      blockId: formData.blockId,

      name: formData.name?.trim(),
      code: formData.code?.trim(),

      contactNumber: formData.contactNumber,
      pincode: formData.pincode,
      address: formData.address?.trim(),
      description: formData.description?.trim(),

      // ✅ required pricing/capacity
      residentialCapacity: Number(formData.residentialCapacity),
      resPrice: Number(formData.resPrice),
      nonResidentialCapacity: Number(formData.nonResidentialCapacity),
      nonResPrice: Number(formData.nonResPrice),

      // ✅ implicit
      centerType: "Both",
      isActive: formData.isActive,

      // backend mapping safety
      amenityCenterMappingDto: [],
    };

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showMessage("Please fill all mandatory field.", "warning");
      return;
    }

    setSaving(true);
    try {
      const uploadedImageFile = formData.imageFile || null;
      const uploadedBrochureFile = formData.brochureFile || null; // ✅ optional
      const payload = buildPayload();

      if (isEditing) {
        // ✅ extra arg won't break even if service doesn't use it
        await updateCenter(centerId, payload, uploadedImageFile, uploadedBrochureFile);
        showMessage("Center updated successfully", "success");
      } else {
        // ✅ extra arg won't break even if service doesn't use it
        await createCenter(payload, uploadedImageFile, uploadedBrochureFile);
        showMessage("Center created successfully", "success");
      }

      await fetchCenters();
      navigate("/cms/cmtc-centers");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save center";
      showMessage(msg, "error");
    } finally {
      resetForm();
      setSaving(false);
    }
  };

  const handleToggleStatus = async (center) => {
    try {
      if (center?.isActive) {
        await deactivateCenter(center.centerId);
        showMessage("Center deactivated", "success");
      } else {
        await activateCenter(center.centerId);
        showMessage("Center activated", "success");
      }
      fetchCenters();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update status";
      showMessage(msg, "error");
    }
  };

  const handleDeleteClick = (center) => {
    setCenterToDelete(center);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!centerToDelete?.centerId) return;
      await deleteCenter(centerToDelete.centerId);
      showMessage("Center deleted", "success");
      setCenters((prev) => (Array.isArray(prev) ? prev.filter((c) => c.centerId !== centerToDelete.centerId) : []));
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete center";
      showMessage(msg, "error");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  /* =========================
     Filters + Sorting + Pagination
  ========================= */

  const districtOptions = useMemo(() => {
    const list = Array.isArray(districts) ? districts : [];
    const opts = list
      .map((d) => ({
        id: String(getDistrictId(d)),
        name: getDistrictName(d),
      }))
      .filter((x) => x.id && x.name);

    const map = new Map();
    opts.forEach((o) => map.set(o.id, o));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [districts]);

  const filteredCenters = useMemo(() => {
    const list = Array.isArray(centers) ? centers : [];
    const s = search.trim().toLowerCase();

    let out = list.filter((c) => {
      if (statusFilter === "ACTIVE") return !!c.isActive;
      if (statusFilter === "INACTIVE") return !c.isActive;
      return true;
    });

    if (districtFilter !== "ALL") {
      out = out.filter((c) => String(c?.districtId ?? "") === String(districtFilter));
    }

    if (s) {
      out = out.filter((c) => {
        const name = (c?.name || "").toLowerCase();
        const code = (c?.code || "").toLowerCase();
        const mobile = (c?.contactNumber || "").toLowerCase();
        const districtName = (c?.districtNameEn || c?.districtName || "").toLowerCase();
        const blockName = (c?.blockName || "").toLowerCase();
        return (
          name.includes(s) ||
          code.includes(s) ||
          mobile.includes(s) ||
          districtName.includes(s) ||
          blockName.includes(s)
        );
      });
    }

    const sorted = [...out].sort((a, b) => {
      if (sortBy === "LATEST") {
        const ta = toTime(a?.updatedAt) || toTime(a?.createdAt) || 0;
        const tb = toTime(b?.updatedAt) || toTime(b?.createdAt) || 0;
        return tb - ta;
      }
      if (sortBy === "NAME_ASC") return String(a?.name || "").localeCompare(String(b?.name || ""));
      if (sortBy === "NAME_DESC") return String(b?.name || "").localeCompare(String(a?.name || ""));
      if (sortBy === "CODE_ASC") return String(a?.code || "").localeCompare(String(b?.code || ""));
      if (sortBy === "CODE_DESC") return String(b?.code || "").localeCompare(String(a?.code || ""));
      return 0;
    });

    return sorted;
  }, [centers, search, statusFilter, districtFilter, sortBy]);

  const pagedCenters = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCenters.slice(start, start + rowsPerPage);
  }, [filteredCenters, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, districtFilter, sortBy]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  /* =========================
     Premium styling
  ========================= */
  const pageBg =
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, ${alpha("#0b1220", 1)} 0%, ${alpha("#070b12", 1)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${alpha("#ffffff", 1)} 52%, ${alpha(
        theme.palette.secondary?.main || "#7c3aed",
        0.05
      )} 100%)`;

  const cardSx = {
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
    boxShadow:
      theme.palette.mode === "dark" ? `0 18px 50px ${alpha("#000", 0.35)}` : `0 18px 50px ${alpha("#111827", 0.10)}`,
    background: theme.palette.mode === "dark" ? alpha("#0f1a2c", 0.78) : alpha("#ffffff", 0.92),
    backdropFilter: "blur(10px)",
  };

  const sectionTitleSx = {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 0.2,
  };

  const labelStrongSx = {
  };
  
  return (
    <Box sx={{ minHeight: "100vh", background:3, pageBg, py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 2.5, p: 2.2, borderRadius: 3, ...cardSx ,border:"1px solid grey",}}>
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
                >{t("admin.cmtcManagementHeading")}</Typography>
                <Typography sx={{ mt: 0.2, color: alpha(theme.palette.text.primary, 0.65), fontSize:"14px" }}>
                 {t("admin.cmtcManagementTitle")}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.2}>
              <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetForm} sx={{ borderRadius: 2 }}>
               {t("admin.resetForm")}
              </Button>

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                disabled={showForm}
                //onClick={() => navigate("/cms/cmtc-centers")}
                onClick={async () => {
                  resetForm();
                  await loadDistricts();   // 🔥 yeh line add karo
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                sx={{
                  borderRadius: 2,
                  boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.22)}`,
                }}
              >
               {t("admin.createCenter")}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ✅ Backend Message Banner */}
        {banner.open && (
          <Paper sx={{ ...cardSx, p: 1.4, mb: 2 }} elevation={0}>
            <Alert
              severity={banner.severity}
              variant="outlined"
              action={
                <IconButton size="small" onClick={handleCloseBanner}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
              sx={{ fontWeight: 750 }}
            >
              {banner.message}
            </Alert>
          </Paper>
        )}

        {/* FORM */}
        {showForm && (
          <Paper sx={{ ...cardSx, p: 3.2, mb: 2.8 ,border: "1px solid grey" }} elevation={0}>
            <Stack spacing={0.6} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h6"
                  component="h6"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    fontSize:"16px"
                  }}
                >
                  {isEditing ? t("center_management.editCenter") : t("center_management.addNewCenter")}
                </Typography>

                <IconButton
                  onClick={() => setShowForm(false)}
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    borderRadius: 2,
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography sx={{ color: alpha(theme.palette.text.primary, 0.6), fontSize:"14px" }}>
                {t("center_management.centerTitle")}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2.5, borderStyle: "dashed" }} />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2.2}>
                {/* ROW 1 (3 columns): District, Block, Center Name */}
                <Grid item xs={12} size={6}>
                  <TextField
                    select
                    fullWidth
                    label={t("admin.district")}
                    name="districtId"
                    value={formData.districtId ?? ""}
                    onChange={handleChange}
                    error={!!validationErrors.districtId}
                    helperText={validationErrors.districtId || " "}
                    aria-required
                    disabled={isDistrictLocked}
                    InputLabelProps={{ shrink: true }} // ✅ add this
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) =>
                        selected
                          ? getDistrictName(districts.find((d) => String(getDistrictId(d)) === String(selected)))
                          : t("center_management.selectDistrict"),
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select District
                    </MenuItem>

                    {(Array.isArray(districts) ? districts : []).map((dist) => {
                      const id = normalizeSelectValue(getDistrictId(dist));
                      return (
                        <MenuItem key={String(id)} value={id}>
                          {getDistrictName(dist)}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>

                <Grid item xs={12} size={6}>
                  <TextField
                    fullWidth
                    select
                    label={t("admin.block")}
                    name="blockId"
                    value={formData.blockId ?? ""}
                    onChange={handleChange}
                    error={!!validationErrors.blockId}
                    helperText={validationErrors.blockId || " "}
                    required
                    disabled={!formData.districtId || isBlockLocked}
                    InputLabelProps={{ shrink: true }} // ✅ add this
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) =>
                        selected
                          ? getBlockName(blocks.find((b) => String(getBlockId(b)) === String(selected)))
                          : t("center_management.selectBlock"),
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Block
                    </MenuItem>

                    {(Array.isArray(blocks) ? blocks : []).map((block) => {
                      const id = normalizeSelectValue(getBlockId(block));
                      return (
                        <MenuItem key={String(id)} value={id}>
                          {getBlockName(block)}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.centerName")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    required

                  />
                </Grid>

                {/* ROW 2 (3 columns): Center Code, Mobile, Pincode */}
                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.centerCode")}
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                    required
                    disabled={isEditing}
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.mobileNumber")}
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    error={!!validationErrors.contactNumber}
                    helperText={validationErrors.contactNumber}
                    inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.pinCode")}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={!!validationErrors.pincode}
                    helperText={validationErrors.pincode}
                    inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                {/* ROW 3 (3 columns): Address, Residential Capacity, Residential Price */}
                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.address")}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!validationErrors.address}
                    helperText={validationErrors.address}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.residentialCapacity")}
                    name="residentialCapacity"
                    type="number"
                    value={formData.residentialCapacity}
                    onChange={handleChange}
                    error={!!validationErrors.residentialCapacity}
                    helperText={validationErrors.residentialCapacity}
                    inputProps={{ min: 1 }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.residentialPrice")}
                    name="resPrice"
                    type="number"
                    value={formData.resPrice}
                    onChange={handleChange}
                    error={!!validationErrors.resPrice}
                    helperText={validationErrors.resPrice}
                    inputProps={{ min: 1 }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                {/* ROW 4 (3 columns): Non-Residential Capacity, Non-Residential Price, Description */}
                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.noResidentialCapacity")}
                    name="nonResidentialCapacity"
                    type="number"
                    value={formData.nonResidentialCapacity}
                    onChange={handleChange}
                    error={!!validationErrors.nonResidentialCapacity}
                    helperText={validationErrors.nonResidentialCapacity}
                    inputProps={{ min: 1 }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={6}>
                  <TextField
                    fullWidth
                    label={t("center_management.noResidentialPrice")}
                    name="nonResPrice"
                    type="number"
                    value={formData.nonResPrice}
                    onChange={handleChange}
                    error={!!validationErrors.nonResPrice}
                    helperText={validationErrors.nonResPrice}
                    inputProps={{ min: 1 }}
                    required
                    sx={labelStrongSx}
                  />
                </Grid>

                <Grid item xs={12} md={4} size={12}>
                  <TextField
                    fullWidth
                    label={t("center_management.description")}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                    required
                    multiline
                    minRows={2}
                    sx={labelStrongSx}
                  />
                </Grid>
                <Grid container spacing={2} alignItems="stretch">
                  {/* ROW 5 (3 columns): Upload Photo, Photo Status, Brochure Upload */}
                  <Grid item xs={12} md={4} size={6}>
                    <Box display="flex" flexDirection="column" height="100%">
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<ImageIcon />}
                        sx={{ p: 1.6, borderRadius: 2, flexGrow: 1 }}
                      >
                       {t("center_management.uploadCenterPic")}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setFormData((prev) => ({ ...prev, imageFile: file }));
                            if (file) clearError("imageFile");
                          }}
                        />
                      </Button>

                      {!!validationErrors.imageFile && (
                        <Typography sx={{ mt: 0.8, fontSize: 12.5, color: theme.palette.error.main }}>
                          {validationErrors.imageFile}
                        </Typography>
                      )}
                    </Box>
                  </Grid>


                  <Grid item xs={12} md={4} size={6}>
                    <Box
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
                        px: 1.6,
                        py: 1.2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 0.4,
                      }}
                    >
                      <Typography sx={{ fontSize: 13.5, color: alpha(theme.palette.text.primary, 0.75) }}>
                        {t("center_management.picStatus")}
                      </Typography>

                      {formData.imageFile ? (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                          Selected: {formData.imageFile.name}
                        </Typography>
                      ) : formData.imageUrl ? (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                          Existing: {String(formData.imageUrl).split("/").pop()}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.55) }}>
                         {t("center_management.picNotSelected")}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* ✅ NEW: Brochure Upload (optional PDF) */}
                  <Grid item xs={12} md={4} size={6}>
                    <Box display="flex" flexDirection="column" height="100%">
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ p: 1.6, borderRadius: 2, flexGrow: 1 }}
                      >
                        {t("center_management.uploadBrochure")}(PDF)
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;

                            if (!file) {
                              setFormData((prev) => ({ ...prev, brochureFile: null }));
                              return;
                            }

                            const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
                            if (!isPdf) {
                              setFormData((prev) => ({ ...prev, brochureFile: null }));
                              setValidationErrors((prev) => ({
                                ...prev,
                                brochureFile: "Brochure must be a PDF file",
                              }));
                              return;
                            }

                            setFormData((prev) => ({ ...prev, brochureFile: file }));
                            clearError("brochureFile");
                          }}
                        />
                      </Button>

                      {!!validationErrors.brochureFile && (
                        <Typography sx={{ mt: 0.8, fontSize: 12.5, color: theme.palette.error.main }}>
                          {validationErrors.brochureFile}
                        </Typography>
                      )}
                    </Box>
                  </Grid>


                  {/* ROW 6 (3 columns): Brochure Status, Spacer, Actions */}
                  <Grid item xs={12} md={4} size={6}>
                    <Box
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
                        px: 1.6,
                        py: 1.2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 0.4,
                      }}
                    >
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: alpha(theme.palette.text.primary, 0.75) }}>
                       {t("center_management.brochureStatus")}
                      </Typography>

                      {formData.brochureFile ? (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                          Selected: {formData.brochureFile.name}
                        </Typography>
                      ) : formData.brochureUrl ? (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                          Existing: {String(formData.brochureUrl).split("/").pop()}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.55) }}>
                         {t("center_management.brochureNotSelected")}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                </Grid>
                <Grid item xs={12} md={4} size={6} />

                <Grid item xs={12} md={4} size={6}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    justifyContent="flex-end"
                    alignItems="stretch"
                    sx={{ height: "100%" }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        flex: 1,
                        boxShadow: `0 14px 30px ${alpha(theme.palette.primary.main, 0.22)}`,
                      }}
                    >
                      {saving ? "Saving..." : isEditing ? t("center_management.updateCenter") : t("center_management.createCenter")}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={resetForm}
                      sx={{ borderRadius: 2, px: 3, py: 1.2, flex: 1 }}
                    >
                     {t("center_management.clear")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}



        {/* LIST */}
        <Paper sx={{ ...cardSx, p: 3.2 }} elevation={0}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid container spacing={2.2}>
              <Grid item xs={12} md={4} size={12}>
                <Box>
                  <Typography
                    variant="h6"
                    component="h6"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      mb: 1,
                      fontSize:"16px"
                    }}
                  >{t("admin.centers")}</Typography>
                  <Typography sx={{ color: alpha(theme.palette.text.primary, 0.6), fontSize:"14px"}}>
                   {t("admin.cmtcManagementText")}
                  </Typography>
                </Box>
              </Grid>
              <Stack direction={{ xs: "column", lg: "row" }} spacing={1.2} >
                <Grid container spacing={2.2}>
                  <Grid item xs={12} md={4} size={12}>
                    <TextField
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("admin.searchPlaceholder")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <FormControl sx={{ minWidth: 170 }}>
                  <InputLabel>{t("admin.status")}</InputLabel>
                  <Select value={statusFilter} label="status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="ALL">{t("center_management.all")}</MenuItem>
                    <MenuItem value="ACTIVE">{t("center_management.active")}</MenuItem>
                    <MenuItem value="INACTIVE">{t("center_management.inactive")}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>{t("admin.district")}</InputLabel>
                  <Select
                    value={districtFilter}
                    label="district"
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterAltOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="ALL">{t("center_management.allDistrict")}</MenuItem>
                    {districtOptions.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 240 }}>
                  <InputLabel>{t("admin.sort")}</InputLabel>
                  <Select
                    value={sortBy}
                    label="sort"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {SORT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Stack>

          <Divider sx={{ mb: 2.2, borderStyle: "dashed" }} />

          {!filteredCenters.length ? (
            <Typography align="center" sx={{ py: 4, fontWeight: 700, color: alpha(theme.palette.text.primary, 0.65) }}>
             {t("admin.noCenters")}
            </Typography>
          ) : (
            <>
              <TableContainer
                sx={{
                borderRadius: 1,
                border: "1px solid grey",
                }}
              >
                <Table stickyHeader >
                  <TableHead>
                    <TableRow  sx={{
                        "& th": {
                          borderBottom:"1px solid grey",
                          background:"#155a55",
                          color:"white"
                        },
                      }}>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.sNo")}</TableCell>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.center")}</TableCell>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("centerDetails.code")}</TableCell>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.district")}</TableCell>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.block")}</TableCell>
                     {hasColumn && (
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}> {t("center_management.mobileNumber")}</TableCell>
                      )}
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}}>{t("admin.deptStatus")}</TableCell>
                      <TableCell sx={{fontSize: "14px", fontWeight: 600,}} align="right">
                        {t("admin.deptActions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pagedCenters.map((center, idx) => {
                      const rowNumber = page * rowsPerPage + idx + 1;
                      const districtLabel = center?.districtNameEn || center?.districtName || "-";
                      const blockLabel = center?.blockNameEn || center?.blockName || "-";
                      return (
                        <TableRow
                          key={center.centerId}
                          hover
                          sx={{
                            "&:nth-of-type(odd)": { backgroundColor: alpha(theme.palette.primary.main, 0.03) },
                          }}
                        >
                          <TableCell  sx={{ fontSize: "14px" }}>{rowNumber}</TableCell>

                          <TableCell  sx={{ fontSize: "14px" }}>{center.name}</TableCell>

                          <TableCell  sx={{ fontSize: "14px" }}>{center.code}</TableCell>

                          <TableCell  sx={{ fontSize: "14px" }}>{districtLabel}</TableCell>
                          <TableCell  sx={{ fontSize: "14px" }}>{blockLabel}</TableCell>
                          {center.contactNumber && (
                          <TableCell sx={{ fontSize: "14px" }}>{center.contactNumber || "-"}</TableCell>
                          )}
                          <TableCell>
                            <Chip
                              label={center.isActive ? "Active" : "Inactive"}
                              color={center.isActive ? "success" : "error"}
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600 , fontSize:"14px" }}
                            />
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end"  flexWrap="nowrap">
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/cms/cmtc-centers/${center.centerId || center.id}`)}
                                  sx={{ border: "1px solid grey", borderRadius: 2 }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={center.isActive ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(center)}
                                  sx={{ border: "1px solid grey", borderRadius: 2 }}
                                >
                                  {center.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(center)}
                                  sx={{
                                   border: "1px solid grey",
                                    borderRadius: 2,
                                    color: theme.palette.error.main,
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredCenters.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setRowsPerPage(value === -1 ? filteredCenters.length : value);
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50 , { label: "All", value: -1 },]}
              />
            </>
          )}
        </Paper>

        {/* DELETE CONFIRMATION */}
        <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <DialogTitle sx={{ fontWeight: 900 }}>Delete Center?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <b>{centerToDelete?.name}</b>? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowDeleteConfirm(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CmtcCenterManagementPage;
