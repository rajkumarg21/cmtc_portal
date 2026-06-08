// src/pages/cmtc/TrainingCenterAmenityManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  Box,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Numbers as NumbersIcon,
  Remove as RemoveIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  ToggleOn as ToggleOnIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";

import {
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByBlock,
  getCentersByDistrict,
  getCenterDetails,
} from "../../services/cmtcCenterService";

import {
  getCenterAmenities,
  addCenterAmenity,
  updateCenterAmenity,
  deleteCenterAmenity,
  getAvailableAmenitiesForCenter,
  getAllAmenityTypes,
  getCenterAmenityStats,
} from "../../services/amenityService";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLES } from "../../utils/constants";
import { useTranslation } from "react-i18next";
/**
 * ------------------------------------------------------------------
 * Helpers (normalize API shapes safely) - from reference file
 * ------------------------------------------------------------------
 */
const safeStr = (v) => (v === null || v === undefined ? "" : String(v));

const TrainingCenterAmenityManagement = () => {
  /**
   * ------------------------------------------------------------------
   * ✅ District / Block / Center Dropdown States (from reference file)
   * ------------------------------------------------------------------
   */
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedCenter, setSelectedCenter] = useState(null);

  /**
   * ------------------------------------------------------------------
   * Existing states (UNCHANGED)
   * ------------------------------------------------------------------
   */
  const [amenityTypes, setAmenityTypes] = useState([]);
  const [centerAmenities, setCenterAmenities] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const {user,userRole} = useAuth();

  const [loading, setLoading] = useState({
    districts: true,
    blocks: false,
    centers: false,
    centerDetails: false,
    types: true,
    amenities: false,
  });

  const [stats, setStats] = useState({
    totalAmenities: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Multi-select form states
  const [multiSelectData, setMultiSelectData] = useState({
    selectedAmenities: [], // Array of amenity IDs
    amenityDetails: {}, // Map of amenityId -> {quantity: number, selected: boolean, notes: string}
  });

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔒 Role based locking
  const isDistrictLocked =
    userRole === USER_ROLES.DISTRICT_OFFICER ||
    userRole === USER_ROLES.BLOCK_OFFICER;

  const isBlockLocked =
    userRole === USER_ROLES.BLOCK_OFFICER;



  const normalizeDistrict = (d) => ({
  id: d?.districtId ?? d?.id ?? d?.district_id,
  name:
    isHindi
      ? d?.districtNameHi || d?.districtNameEn
      : d?.districtNameEn || d?.districtNameHi || "District",
  code: d?.districtCode ?? d?.code ?? "",
});

const normalizeBlock = (b) => ({
   id: b?.blockId ?? b?.id ?? b?.block_id,
  name:
    isHindi
      ? b?.blockNameHi || b?.blockNameEn
      : b?.blockNameEn || b?.blockNameHi || "Block",
});


const normalizeCenter = (c) => {
  const centerId =
    c?.centerId ?? c?.id ?? c?.cmtcCentersId ?? c?.cmtc_centers_id;
  return {
    ...c,
    centerId,
    id: centerId,
    name: isHindi
      ? c?.centerNameHi || c?.centerNameEn || c?.name
      : c?.centerNameEn || c?.centerNameHi || c?.name,
    code: c?.code ?? c?.centerCode ?? c?.center_code ?? "",
    districtNameEn:
      c?.districtNameEn ?? c?.district_name_en ?? c?.districtName ?? "",
    address: c?.address ?? c?.centerAddress ?? "",
    pincode: c?.pincode ?? c?.pinCode ?? "",
    contactNumber: c?.contactNumber ?? c?.mobile ?? c?.phone ?? "",
    capacity: c?.capacity ?? c?.totalCapacity ?? "",
    centerType: c?.centerType ?? c?.center_type ?? "",
    isActive: c?.isActive ?? c?.active ?? true,
  };
};
  /**
   * ------------------------------------------------------------------
   * Initial Load (districts + amenity types)
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    fetchDistricts();
    fetchAmenityTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ------------------------------------------------------------------
   * When district changes -> load blocks and auto-select first
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    if (!selectedDistrictId) return;

    fetchBlocks(selectedDistrictId);

    // reset downstream selections
    setSelectedBlockId("");
    setCenters([]);
    setSelectedCenter(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId]);

  /**
   * ------------------------------------------------------------------
   * When block changes -> load centers and auto-select first
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    if (!selectedBlockId) return;

    fetchCentersByBlock(selectedBlockId);
    setSelectedCenter(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId]);

  /**
   * ------------------------------------------------------------------
   * When center changes -> load amenities + stats (UNCHANGED)
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    if (selectedCenter && (selectedCenter.centerId || selectedCenter.id)) {
      const id = selectedCenter.centerId || selectedCenter.id;
      fetchCenterData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter?.centerId, selectedCenter?.id]);

  /**
   * ------------------------------------------------------------------
   * Filter amenities (UNCHANGED)
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    filterAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedType, centerAmenities]);

  /**
   * ------------------------------------------------------------------
   * Snackbar helpers (UNCHANGED)
   * ------------------------------------------------------------------
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /**
   * ------------------------------------------------------------------
   * ✅ District / Block / Center API calls (from reference file)
   * ------------------------------------------------------------------
   */
  const fetchDistricts = async () => {
    setLoading((p) => ({ ...p, districts: true }));
    try {
      const resp = await getAllDistricts();
      const raw = resp?.data ?? resp;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      const normalized = list.map(normalizeDistrict);

      setDistricts(normalized);

      if(user?.districtId){
        setSelectedDistrictId(user?.districtId);
      }

    } catch (e) {
      showSnackbar("Failed to load districts", "error");
    } finally {
      setLoading((p) => ({ ...p, districts: false }));
    }
  };

  const fetchBlocks = async (districtId) => {
    setLoading((p) => ({ ...p, blocks: true }));
    try {
      const resp = await getBlocksByDistrict(districtId);
      const raw = resp?.data ?? resp;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      const normalized = list.map(normalizeBlock);

      setBlocks(normalized);

      // Auto-select first block
      if (normalized.length > 0) {
        if(user?.blockId){
          setSelectedBlockId(user?.blockId);
        }
        // setSelectedBlockId(String(normalized[0].id));
      } else {
        setSelectedBlockId("");
        setCenters([]);
        setSelectedCenter(null);

        // fallback: if no blocks in district, try centers by district
        fetchCentersByDistrict(districtId);
      }
    } catch (e) {
      showSnackbar("Failed to load blocks", "error");
      setBlocks([]);
      setSelectedBlockId("");
      setCenters([]);
      setSelectedCenter(null);
    } finally {
      setLoading((p) => ({ ...p, blocks: false }));
    }
  };

  const fetchCentersByDistrict = async (districtId) => {
    setLoading((p) => ({ ...p, centers: true }));
    try {
      const resp = await getCentersByDistrict(districtId);
      const raw = resp?.data ?? resp;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      const normalized = list.map(normalizeCenter);

      setCenters(normalized);

      // Auto-select first center
      if (normalized.length > 0) {
        await setCenterById(normalized[0].centerId);
      } else {
        setSelectedCenter(null);
      }
    } catch (e) {
      showSnackbar("Failed to load centers", "error");
      setCenters([]);
      setSelectedCenter(null);
    } finally {
      setLoading((p) => ({ ...p, centers: false }));
    }
  };

  const fetchCentersByBlock = async (blockId) => {
    setLoading((p) => ({ ...p, centers: true }));
    try {
      const resp = await getCentersByBlock(blockId);
      const raw = resp?.data ?? resp;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      const normalized = list.map(normalizeCenter);

      setCenters(normalized);

      // Auto-select first center
      if (normalized.length > 0) {
        await setCenterById(normalized[0].centerId);
      } else {
        setSelectedCenter(null);
      }
    } catch (e) {
      showSnackbar("Failed to load centers", "error");
      setCenters([]);
      setSelectedCenter(null);
    } finally {
      setLoading((p) => ({ ...p, centers: false }));
    }
  };

  /**
   * ------------------------------------------------------------------
   * ✅ Set selected center by ID (from reference file)
   * ------------------------------------------------------------------
   */
  const setCenterById = async (centerId) => {
    if (!centerId) return;
    setLoading((p) => ({ ...p, centerDetails: true }));
    try {
      // Prefer full details so header shows proper address/contact/capacity
      const resp = await getCenterDetails(centerId);
      const raw = resp?.data ?? resp;
      const normalized = normalizeCenter(raw);
      setSelectedCenter(normalized);
    } catch (e) {
      // fallback to list item if details API fails
      const fallback = centers.find(
        (c) => String(c.centerId) === String(centerId)
      );
      if (fallback) setSelectedCenter(normalizeCenter(fallback));
    } finally {
      setLoading((p) => ({ ...p, centerDetails: false }));
    }
  };

  /**
   * ------------------------------------------------------------------
   * Amenity types (UNCHANGED)
   * ------------------------------------------------------------------
   */
  const fetchAmenityTypes = async () => {
    try {
      const data = await getAllAmenityTypes();
      setAmenityTypes(data);
      setLoading((prev) => ({ ...prev, types: false }));
    } catch (error) {
      showSnackbar("Failed to load amenity types", "error");
      setLoading((prev) => ({ ...prev, types: false }));
    }
  };

  /**
   * ------------------------------------------------------------------
   * Center data loader (UNCHANGED)
   * ------------------------------------------------------------------
   */
  const fetchCenterData = async (centerId) => {
    setLoading((prev) => ({ ...prev, amenities: true }));
    try {
      const [amenities, available, statsData] = await Promise.all([
        getCenterAmenities(centerId),
        getAvailableAmenitiesForCenter(centerId),
        getCenterAmenityStats(centerId),
      ]);

      if (amenities && amenities.length > 0) {
        console.log(
          "🔍 First amenity full details:",
          JSON.stringify(amenities[0], null, 2)
        );
      }

      // Normalize center amenities
      const normalizedAmenities = (amenities || []).map((a) => ({
        ...a,
        amenityId: a.amenityId || a.id,
        amenityName: a.amenityName || a.name || a.title,
        amenityCode: a.amenityCode || a.code,
        amenityDescription: a.amenityDescription || a.description,
        amenityTypeName: a.amenityTypeName || a.typeName,
        amenityTypeColor: a.amenityTypeColor || a.typeColor,
        amenityTypeId: a.amenityTypeId || a.typeId,
        valueType: a.valueType || "QUANTITY",
        quantity: a.quantity !== undefined ? a.quantity : a.amount || 0,
        // Convert 0/1 to true/false for boolean values
        selected:
          a.selected !== undefined && a.selected !== null
            ? a.selected === true ||
              a.selected === 1 ||
              a.selected === "1" ||
              a.selected === "true"
            : false,
        status: a.status || t("cmtc_amenity.available"),
        notes: a.notes || "",
      }));
      setCenterAmenities(normalizedAmenities);
      console.log(
        "🔍 Normalized Amenities with valueType:",
        normalizedAmenities.map((a) => ({
          id: a.id,
          name: a.amenityName,
          valueType: a.valueType,
          quantity: a.quantity,
          selected: a.selected,
        }))
      );

      // Normalize available amenities
      const normalizedAvailable = (available || []).map((a) => ({
        ...a,
        amenityId: a.amenityId || a.id || a.centerAmenityId,
        amenityName: a.amenityName || a.name || a.title,
        amenityCode: a.amenityCode || a.code,
        amenityTypeName: a.amenityTypeName || a.typeName,
        amenityTypeColor: a.amenityTypeColor || a.typeColor,
        description: a.description || a.amenityDescription,
        defaultQuantity: a.defaultQuantity || 0,
        valueType: a.valueType || "QUANTITY",
        amenityTypeId: a.amenityTypeId || a.typeId,
      }));
      setAvailableAmenities(normalizedAvailable);

      setStats(
        statsData || { totalAmenities: 0, available: 0, lowStock: 0, outOfStock: 0 }
      );
    } catch (error) {
      showSnackbar("Failed to load center amenities", "error");
    } finally {
      setLoading((prev) => ({ ...prev, amenities: false }));
    }
  };

  /**
   * ------------------------------------------------------------------
   * Filters (UNCHANGED)
   * ------------------------------------------------------------------
   */
  const filterAmenities = () => {
    let filtered = centerAmenities;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (amenity) => amenity.amenityTypeId === parseInt(selectedType)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (amenity) =>
          amenity.amenityName?.toLowerCase().includes(term) ||
          amenity.amenityDescription?.toLowerCase().includes(term) ||
          amenity.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredAmenities(filtered);
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle multi-select checkbox toggle
  const handleAmenityToggle = (amenityId) => {
    setMultiSelectData((prev) => {
      const isSelected = prev.selectedAmenities.includes(amenityId);
      const selectedAmenities = isSelected
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId];

      // Initialize details for newly selected amenity
      const amenityDetails = { ...prev.amenityDetails };
      if (!isSelected) {
        const amenity = availableAmenities.find((a) => a.amenityId === amenityId);
        if (amenity) {
          amenityDetails[amenityId] = {
            quantity: amenity.defaultQuantity || 1,
            selected: true, // Default to Yes for boolean amenities
            notes: "",
          };
        }
      } else {
        // Remove details when unselected
        delete amenityDetails[amenityId];
      }

      return { selectedAmenities, amenityDetails };
    });
  };

  // Handle quantity change for specific amenity
  const handleQuantityChange = (amenityId, quantity) => {
    setMultiSelectData((prev) => ({
      ...prev,
      amenityDetails: {
        ...prev.amenityDetails,
        [amenityId]: {
          ...prev.amenityDetails[amenityId],
          quantity: Math.max(0, quantity),
        },
      },
    }));
  };

  // Handle boolean toggle for specific amenity
  const handleBooleanToggle = (amenityId, selected) => {
    setMultiSelectData((prev) => ({
      ...prev,
      amenityDetails: {
        ...prev.amenityDetails,
        [amenityId]: {
          ...prev.amenityDetails[amenityId],
          selected,
        },
      },
    }));
  };

  // Handle notes change for specific amenity
  const handleNotesChange = (amenityId, notes) => {
    setMultiSelectData((prev) => ({
      ...prev,
      amenityDetails: {
        ...prev.amenityDetails,
        [amenityId]: {
          ...prev.amenityDetails[amenityId],
          notes,
        },
      },
    }));
  };

  // Handle bulk add amenities
  const handleBulkAddAmenities = async () => {
    if (multiSelectData.selectedAmenities.length === 0) {
      showSnackbar("Please select at least one amenity", "error");
      return;
    }

    const centerId = Number(selectedCenter?.centerId || selectedCenter?.id);
    const errors = [];

    // Process each selected amenity
    for (const amenityId of multiSelectData.selectedAmenities) {
      const amenity = availableAmenities.find((a) => a.amenityId === amenityId);
      const details = multiSelectData.amenityDetails[amenityId];

      if (!amenity || !details) continue;

      const payload = {
        centerId,
        amenityId: Number(amenityId),
        quantity: amenity.valueType === "QUANTITY" ? Number(details.quantity) : null,
        selected: amenity.valueType === "BOOLEAN" ? Boolean(details.selected) : null,
        notes: details.notes || "",
      };

      try {
        await addCenterAmenity(payload);
      } catch (error) {
        errors.push(
          `${amenity.amenityName}: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }

    if (errors.length === 0) {
      showSnackbar(`${multiSelectData.selectedAmenities.length} amenities added successfully!`);
      setAddModalOpen(false);
      resetMultiSelectForm();
      fetchCenterData(centerId);
    } else {
      showSnackbar(
        `Added ${multiSelectData.selectedAmenities.length - errors.length} amenities. ${errors.length} failed.`,
        "warning"
      );
      console.error("Add amenities errors:", errors);
    }
  };

  const handleUpdateAmenity = async () => {
    const payload = {
      quantity:
        selectedAmenity.valueType === "QUANTITY"
          ? selectedAmenity.quantity
          : null,
      selected:
        selectedAmenity.valueType === "BOOLEAN"
          ? selectedAmenity.selected
          : null,
      notes: selectedAmenity.notes,
    };

    try {
      await updateCenterAmenity(selectedAmenity.id, payload);
      showSnackbar("Amenity updated successfully");
      setEditModalOpen(false);
      fetchCenterData(selectedCenter?.centerId || selectedCenter?.id);
    } catch (error) {
      showSnackbar("Failed to update amenity", "error");
    }
  };

  const handleDeleteAmenity = async () => {
    try {
      await deleteCenterAmenity(selectedAmenity.id);
      showSnackbar("Amenity removed from center successfully");
      setDeleteModalOpen(false);
      fetchCenterData(selectedCenter?.centerId || selectedCenter?.id);
    } catch (error) {
      showSnackbar("Failed to delete amenity", "error");
    }
  };

  const openAddModal = () => {
    resetMultiSelectForm();
    setModalSearchTerm("");
    setCurrentTab(0);
    setAddModalOpen(true);
  };

  const openEditModal = (amenity) => {
    setSelectedAmenity(amenity);
    setEditModalOpen(true);
  };

  const openDeleteModal = (amenity) => {
    setSelectedAmenity(amenity);
    setDeleteModalOpen(true);
  };

  const openViewModal = (amenity) => {
    setSelectedAmenity(amenity);
    setViewModalOpen(true);
  };

  // Reset multi-select form
  const resetMultiSelectForm = () => {
    setMultiSelectData({
      selectedAmenities: [],
      amenityDetails: {},
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "LOW_STOCK":
        return "warning";
      case "OUT_OF_STOCK":
        return "error";
      default:
        return "default";
    }
  };

  // Filter available amenities for modal based on tab and search
  const getFilteredAvailableAmenities = () => {
    return availableAmenities.filter((amenity) => {
      // Filter by tab
      if (currentTab > 0) {
        const type = amenityTypes[currentTab - 1];
        if (!type || amenity.amenityTypeId !== type.id) {
          return false;
        }
      }

      // Filter by search term
      if (modalSearchTerm) {
        const term = modalSearchTerm.toLowerCase();
        return (
          (amenity.amenityName || "").toLowerCase().includes(term) ||
          (amenity.amenityCode || "").toLowerCase().includes(term) ||
          (amenity.description || "").toLowerCase().includes(term) ||
          (amenity.amenityTypeName || "").toLowerCase().includes(term)
        );
      }

      return true;
    });
  };

  /**
   * ------------------------------------------------------------------
   * Loading skeleton (updated to districts/types)
   * ------------------------------------------------------------------
   */
  if (loading.districts || loading.types) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const dropdownBusy = loading.blocks || loading.centers || loading.centerDetails;

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight:600 , fontSize:"16px" }}>
            {t("admin.cmtcAmenityManagement")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{fontSize:"14px" }}>
           {t("admin.cmtcAmenityManagementTitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddModal}
          disabled={!selectedCenter || loading.amenities || dropdownBusy}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          {t("admin.addAmenity")}
        </Button>
      </Box>

      {/* ✅ District / Block / Center Dropdown Row (REPLACED cards selection) */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: "1px solid grey",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 ,fontSize:"16px" }}>
           {t("admin.selectLocationCenter")}
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {/* District */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="district-label"> {t("admin.district")}</InputLabel>
              <Select
                labelId="district-label"
                label="District"
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(String(e.target.value))}
                disabled={loading.districts || isDistrictLocked}
              >
                {districts.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Block */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="block-label"> {t("admin.block")}</InputLabel>
              <Select
                labelId="block-label"
                label="Block"
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(String(e.target.value))}
                disabled={!selectedDistrictId || loading.blocks || isBlockLocked}
              >
                {blocks.length === 0 ? (
                  <MenuItem value="">
                    <em>{loading.blocks ? t("cmtc_amenity.loadingBlocks") : t("cmtc_amenity.noBlocks")}</em>
                  </MenuItem>
                ) : (
                  blocks.map((b) => (
                    <MenuItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Center */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="center-label"> {t("admin.cmtcCenter")}</InputLabel>
              <Select
                labelId="center-label"
                label="Training Center"
                value={safeStr(selectedCenter?.centerId)}
                onChange={(e) => setCenterById(e.target.value)}
                disabled={
                  (!selectedBlockId && !selectedDistrictId) ||
                  loading.centers ||
                  loading.centerDetails
                }
              >
                {centers.length === 0 ? (
                  <MenuItem value="">
                    <em>{loading.centers ? t("cmtc_amenity.loadingCenters") : t("cmtc_amenity.noCenters")}</em>
                  </MenuItem>
                ) : (
                  centers.map((c) => (
                    <MenuItem key={c.centerId} value={String(c.centerId)}>
                      {c.name} {c.code ? `(${c.code})` : ""}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Subtle loader row */}
          {dropdownBusy && (
            <Grid item size={{ xs: 12 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 0.5 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                 {t("cmtc_amenity.updatingSelection")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {selectedCenter && (
        <>
          {/* Selected Center Info & Stats */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" gutterBottom sx={{fontSize:"16px" , fontWeight:600}}  >
                  {selectedCenter.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{fontSize:"14px"}}>
                  {selectedCenter.address} • {selectedCenter.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{fontSize:"14px"}}>
                  Contact: {selectedCenter.contactNumber} • Capacity:{" "}
                  {selectedCenter.capacity}
                </Typography>
              </Grid>
              <Grid item  size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2}>
                  <Grid item size={{ md: 12 }}> 
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                      <Typography variant="h4" color="primary">
                        {stats.totalAmenities}
                      </Typography>
                      <Typography variant="body2">{t("admin.totalAmenities")}</Typography>
                    </Paper>
                  </Grid>
                  {/* <Grid item size={{ md: 6 }}>
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {stats.available}
                      </Typography>
                      <Typography variant="body2">{t("admin.available")}</Typography>
                    </Paper>
                  </Grid> */}
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Type Filter */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2,border:"1px solid grey" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">{t("admin.filterbyType")}</Typography>
              <TextField
                size="small"
                placeholder={t("admin.searchAmenities")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                  sx: { borderRadius: 2 },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={t("admin.allAmenities")}
                onClick={() => handleTypeChange("all")}
                color={selectedType === "all" ? "primary" : "default"}
                variant={selectedType === "all" ? "filled" : "outlined"}
                sx={{ borderRadius: 1 }}
              />
              {amenityTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={`${type.typeName} (${type.amenityCount || 0})`}
                  onClick={() => handleTypeChange(type.id.toString())}
                  color={
                    selectedType === type.id.toString() ? "primary" : "default"
                  }
                  variant={
                    selectedType === type.id.toString() ? "filled" : "outlined"
                  }
                  sx={{
                    borderColor: type.colorCode,
                    color:
                      selectedType === type.id.toString()
                        ? "white"
                        : type.colorCode,
                    bgcolor:
                      selectedType === type.id.toString()
                        ? type.colorCode
                        : "transparent",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: `${type.colorCode}20`,
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Loading indicator for amenities */}
          {loading.amenities ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Amenities Grid View - FIXED Grid v2 syntax */}
              <Grid container spacing={3}>
                {filteredAmenities.map((amenity) => (
                  <Grid
                    item
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={amenity.id}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        border: "1px solid #0a524d",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          boxShadow: 4,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent  sx={{ flexGrow: 1, p: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ fontWeight: 600, fontSize: "14px", lineHeight: 1.4 }}
                              >
                                {amenity.amenityName}
                              </Typography>
                              <Chip
                                label={amenity.amenityTypeName}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: 1,
                                  height: 22,
                                  fontSize: "11px",
                                  maxWidth: "100%",
                                  "& .MuiChip-label": {
                                  px: 0.5,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis", 
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                         
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "13px", color: "text.secondary" }}
                        >
                          {amenity.amenityDescription}
                        </Typography>

                        <Box sx={{ p:1 }}>
                          {amenity.valueType === "QUANTITY" && (
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              sx={{ fontWeight: 600 }}
                            >
                              Quantity: {amenity.quantity || 0}
                            </Typography>
                          )}

                          {amenity.valueType === "BOOLEAN" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                Status:
                              </Typography>
                              <Chip
                                label={
                                  amenity.selected === true
                                    ? "Available"
                                    : "Not Available"
                                }
                                color={
                                  amenity.selected === true
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                                variant="outlined"
                                icon={
                                  amenity.selected === true ? (
                                    <CheckCircleIcon />
                                  ) : (
                                    <WarningIcon />
                                  )
                                }
                              />
                            </Box>
                          )}
                        </Box>

                        {amenity.notes && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 1,
                              bgcolor: "grey.50",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Notes: {amenity.notes}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions
                        sx={{
                          justifyContent: "flex-end",
                          p: 2,
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditModal(amenity)}
                            color="primary"
                            sx={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 1.5,
                              width: 30,
                              height: 30,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteModal(amenity)}
                            color="error"
                            sx={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 1.5,
                              width: 30,
                              height: 30,
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {filteredAmenities.length === 0 && (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                  <InfoIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                   {t("admin.noAmenities")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {searchTerm
                      ? t("admin.noAmenitiesText2")
                      : t("admin.noAmenitiesText1")}
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </>
      )}

      {/* Enhanced Multi-Select Add Amenities Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 2,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AddIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t("cmtc_amenity.addMultipleAmenities")} {selectedCenter?.name}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.8)",
              display: "block",
              mt: 0.5,
            }}
          >
            {t("cmtc_amenity.selectMultipleAmenities")}
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            height: "70vh",
          }}
        >
          <Grid container sx={{ height: "100%" }}>
            {/* Left Panel: Amenity Selection */}
            <Grid
              item
              size={{ xs: 12, md: 6 }}
              sx={{
                borderRight: "1px solid",
                borderColor: "divider",
              }}
            >
              <Paper
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-root": {
                        minHeight: 48,
                        textTransform: "none",
                        fontWeight: 500,
                      },
                    }}
                  >
                    <Tab label={t("cmtc_amenity.allAmenities")} />
                    {amenityTypes.map((type) => (
                      <Tab
                        key={type.id}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: type.colorCode,
                                mr: 1,
                              }}
                            />
                            {type.typeName}
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>
                </Box>

                {/* Search */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder={t("cmtc_amenity.searchAmenitiesModal")}
                    size="small"
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                      sx: { borderRadius: 2 },
                    }}
                  />
                </Box>

                {/* Amenity List with Checkboxes */}
                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  <List dense>
                    {getFilteredAvailableAmenities().map((amenity) => {
                      const isSelected =
                        multiSelectData.selectedAmenities.includes(
                          amenity.amenityId
                        );

                      return (
                        <React.Fragment key={amenity.amenityId}>
                          <ListItem
                            component="div"
                            onClick={() => handleAmenityToggle(amenity.amenityId)}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: isSelected ? "primary.50" : "transparent",
                              border: "1px solid",
                              borderColor: isSelected
                                ? "primary.main"
                                : "divider",
                              "&:hover": {
                                bgcolor: isSelected
                                  ? "primary.100"
                                  : "action.hover",
                                cursor: "pointer",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {isSelected ? (
                                <CheckBoxIcon color="primary" />
                              ) : (
                                <CheckBoxOutlineBlankIcon />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {amenity.amenityName || amenity.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {amenity.amenityCode || amenity.code}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    mt: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Chip
                                    label={
                                      amenity.valueType === "QUANTITY"
                                        ? "Number Input"
                                        : "Yes/No"
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        amenity.valueType === "QUANTITY"
                                          ? "success.50"
                                          : "info.50",
                                      color:
                                        amenity.valueType === "QUANTITY"
                                          ? "success.main"
                                          : "info.main",
                                      fontSize: "0.65rem",
                                      height: 20,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {(
                                      amenity.description ||
                                      amenity.amenityDescription ||
                                      ""
                                    ).substring(0, 50)}
                                    ...
                                  </Typography>
                                </Box>
                              }
                              secondaryTypographyProps={{ component: "div" }}
                            />
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>

                  {getFilteredAvailableAmenities().length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <InfoIcon
                        sx={{
                          fontSize: 48,
                          color: "text.disabled",
                          mb: 2,
                        }}
                      />
                      <Typography variant="body1" color="text.secondary">
                       {t("cmtc_amenity.noAmenitiesAvailable")}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {modalSearchTerm
                          ? t("cmtc_amenity.noAmenitiesSearch")
                          : t("cmtc_amenity.allAmenitiesAdded")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Right Panel: Configuration Panel */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "primary.50",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "primary.dark" }}
                  >
                   {t("cmtc_amenity.configureAmenities")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {multiSelectData.selectedAmenities.length}  {t("cmtc_amenity.selectedCount")}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  {multiSelectData.selectedAmenities.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <InfoIcon
                        sx={{
                          fontSize: 48,
                          color: "text.disabled",
                          mb: 2,
                        }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        {t("cmtc_amenity.selectFromLeft")}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {t("cmtc_amenity.checkToConfigure")}
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {multiSelectData.selectedAmenities.map((amenityId) => {
                        const amenity = availableAmenities.find(
                          (a) => a.amenityId === amenityId
                        );
                        const details =
                          multiSelectData.amenityDetails[amenityId] || {};

                        if (!amenity) return null;

                        return (
                          <Paper
                            key={amenityId}
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {amenity.amenityName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {amenity.amenityCode}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleAmenityToggle(amenityId)}
                                sx={{ color: "error.main" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* QUANTITY Input */}
                            {amenity.valueType === "QUANTITY" && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mb: 1, display: "block" }}
                                >
                                 {t("cmtc_amenity.enterQuantity")}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleQuantityChange(
                                        amenityId,
                                        (details.quantity || 0) - 1
                                      )
                                    }
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={
                                      details.quantity ??
                                      amenity.defaultQuantity ??
                                      1
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        amenityId,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    sx={{ width: 100 }}
                                    inputProps={{
                                      min: 0,
                                      style: { textAlign: "center" },
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleQuantityChange(
                                        amenityId,
                                        (details.quantity || 0) + 1
                                      )
                                    }
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            )}

                            {/* BOOLEAN Switch */}
                            {amenity.valueType === "BOOLEAN" && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mb: 1, display: "block" }}
                                >
                                 {t("cmtc_amenity.availability")}
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={details.selected !== false}
                                      onChange={(e) =>
                                        handleBooleanToggle(
                                          amenityId,
                                          e.target.checked
                                        )
                                      }
                                      color="primary"
                                    />
                                  }
                                  label={
                                    details.selected !== false
                                      ? t("cmtc_amenity.yesAvailable")
                                      : t("cmtc_amenity.noAvailable")
                                  }
                                />
                              </Box>
                            )}

                            {/* Notes for all types */}
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mb: 1, display: "block" }}
                              >
                               {t("cmtc_amenity.notesOptional")}
                              </Typography>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder={t("cmtc_amenity.addNotes")}
                                value={details.notes || ""}
                                onChange={(e) =>
                                  handleNotesChange(amenityId, e.target.value)
                                }
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    fontSize: "0.875rem",
                                  },
                                }}
                              />
                            </Box>
                          </Paper>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            {t("cmtc_amenity.cancel")}
          </Button>

          <Button
            onClick={handleBulkAddAmenities}
            variant="contained"
            disabled={multiSelectData.selectedAmenities.length === 0}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
           {t("cmtc_amenity.addAmenities")}{multiSelectData.selectedAmenities.length}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Amenity Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <EditIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
             {t("cmtc_amenity.editAmenity")}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.8)",
              display: "block",
              mt: 0.5,
            }}
          >
            {selectedAmenity?.amenityName}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedAmenity && (
            <Box sx={{ mt: 2 }}>
              {/* Display amenity info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>{t("cmtc_amenity.Type")}:</strong> {selectedAmenity.amenityTypeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("cmtc_amenity.valueType")}:</strong>{" "}
                  {selectedAmenity.valueType === "BOOLEAN"
                    ? "Yes/No"
                    : "Quantity"}
                </Typography>
              </Box>

              {/* QUANTITY Input */}
              {selectedAmenity.valueType === "QUANTITY" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                   {t("cmtc_amenity.quantity")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newQty = (selectedAmenity.quantity || 0) - 1;
                        setSelectedAmenity({
                          ...selectedAmenity,
                          quantity: Math.max(0, newQty),
                        });
                      }}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={selectedAmenity.quantity || 0}
                      onChange={(e) =>
                        setSelectedAmenity({
                          ...selectedAmenity,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      sx={{ width: 100 }}
                      inputProps={{ min: 0, style: { textAlign: "center" } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedAmenity({
                          ...selectedAmenity,
                          quantity: (selectedAmenity.quantity || 0) + 1,
                        });
                      }}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* BOOLEAN Switch */}
              {selectedAmenity.valueType === "BOOLEAN" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Availability
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedAmenity.selected !== false}
                        onChange={(e) =>
                          setSelectedAmenity({
                            ...selectedAmenity,
                            selected: e.target.checked,
                          })
                        }
                        color="primary"
                      />
                    }
                    label={
                      selectedAmenity.selected !== false
                        ? t("cmtc_amenity.yesAvailable")
                        : t("cmtc_amenity.noAvailable")
                    }
                  />
                </Box>
              )}

              {/* Notes */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t("cmtc_amenity.notesOptional")}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder= {t("cmtc_amenity.addNotes")}
                  value={selectedAmenity.notes || ""}
                  onChange={(e) =>
                    setSelectedAmenity({
                      ...selectedAmenity,
                      notes: e.target.value,
                    })
                  }
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": { fontSize: "0.875rem" },
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Button
            onClick={() => setEditModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            {t("cmtc_amenity.cancel")}
          </Button>

          <Button
            onClick={handleUpdateAmenity}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
           {t("cmtc_amenity.saveChanges")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>{t("cmtc_amenity.removeAmenity")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
           {t("cmtc_amenity.removeConfirmation")} "{selectedAmenity?.amenityName}" from{" "}
            {selectedCenter?.name}?
            This action will delete the amenity association but not the amenity
            itself.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAmenity} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TrainingCenterAmenityManagement;
