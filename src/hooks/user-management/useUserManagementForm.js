import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getCentersByBlock,
  getDistrictsWithBlocks,
} from "../../services/cmtcCenterService";

import { getGeoConfig } from "../../utils/user/geoConfig";
import { applyGeoConfigToForm } from "../../utils/user/geoFormUtils";

export const useUserManagementForm = ({i18n,
  showSnackbar,
  loggedInRole,
  loggedInUser,
  USER_ROLES,
  CENTER_ROLES,}) => {
  // =========================
  // FORM STATE
  // =========================
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    originalDesignation: "",
    role: "",
    password: undefined,
    enabled: true,
    mobileNo: "",

    districtId: "",
    districtName: "",
    blockId: "",
    blockName: "",
    cmtcCenterId: "",
    cmtcCenterName: "",

    assignedDistrictId: "",
    assignedBlockId: "",
    assignedCmtcCenterId: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // =========================
  // GEO STATE
  // =========================
  const [districts, setDistricts] = useState([]);
  const [districtsWithBlocks, setDistrictsWithBlocks] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [cmtcCenters, setCmtcCenters] = useState([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue =
      name === "mobileNo" ? value.replace(/[^0-9]/g, "") : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : newValue,
    }));
  };

  // =========================
  // ROLE CHANGE
  // =========================
  const handleRoleChange = useCallback((e) => {
    const newRole = e.target.value;

    const config = getGeoConfig(
        loggedInRole,
        newRole,
        USER_ROLES,
        CENTER_ROLES
    );

    setFormData((prev) =>
        applyGeoConfigToForm(config, loggedInUser, {
        ...prev,
        role: newRole,

        districtId: "",
        districtName: "",
        blockId: "",
        blockName: "",
        cmtcCenterId: "",
        cmtcCenterName: "",

        assignedDistrictId: "",
        assignedBlockId: "",
        assignedCmtcCenterId: "",
        })
    );
    // setBlocksFromDistrict(formData.districtId);
    }, [loggedInRole, loggedInUser]);



  // =========================
  // FETCH DISTRICTS
  // =========================
  const fetchDistrictsWithBlocks = useCallback(async () => {
    try {
      setLoadingDistricts(true);

      const res = await getDistrictsWithBlocks();
      const data = res.data || [];

      setDistricts(data);
      setDistrictsWithBlocks(data);
    } catch (e) {
      showSnackbar?.("Failed to load districts", "error");
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // =========================
  // BLOCK SET FROM DISTRICT
  // =========================
  const setBlocksFromDistrict = useCallback(
    (districtId) => {
      const selected = districtsWithBlocks.find(
        (d) => String(d.districtId) === String(districtId)
      );

      setBlocks(selected?.blocks || []);
      setCmtcCenters([]); // important reset
    },
    [districtsWithBlocks]
  );

  // =========================
  // FETCH CENTERS
  // =========================
  const fetchCentersByBlock = useCallback(
    async (blockId) => {
      if (!blockId) {
        setCmtcCenters([]);
        return;
      }

      try {
        setLoadingCenters(true);

        const res = await getCentersByBlock(blockId);
        setCmtcCenters(res.data || []);
      } catch (e) {
        showSnackbar?.("Failed to load centers", "error");
      } finally {
        setLoadingCenters(false);
      }
    },
    [showSnackbar]
  );

  // =========================
  // RESET GEO
  // =========================
  const resetGeo = useCallback(() => {
    setBlocks([]);
    setCmtcCenters([]);
  }, []);

  // =========================
  // 🔥 NEW: EDIT MODE SUPPORT (IMPORTANT)
  // =========================
  const hydrateGeoForEdit = useCallback(
    async (userData, loggedInRole, USER_ROLES) => {
      if (!userData) return;

      try {
        // District Officer
        if (loggedInRole === USER_ROLES.DISTRICT_OFFICER) {
          if (userData?.blockId) {
            await fetchCentersByBlock(userData.blockId);
          }
          return;
        }

        // Block Officer
        if (loggedInRole === USER_ROLES.BLOCK_OFFICER) {
          if (userData?.blockId) {
            await fetchCentersByBlock(userData.blockId);
          }
          return;
        }

        // CMTC center load
        if (userData?.blockId) {
          await fetchCentersByBlock(userData.blockId);
        }
      } catch (e) {
        console.error("Geo hydration failed", e);
      }
    },
    [fetchCentersByBlock]
  );

  // =========================
  // DERIVED MAPS
  // =========================
  const districtNameById = useMemo(() => {
    const map = {};
    districtsWithBlocks.forEach((d) => {
      map[String(d.districtId)] =
        i18n.language === "hi" ? d.districtNameHi : d.districtNameEn;
    });
    return map;
  }, [districtsWithBlocks, i18n.language]);

  const blockNameById = useMemo(() => {
    const map = {};
    districtsWithBlocks.forEach((d) => {
      (d.blocks || []).forEach((b) => {
        map[String(b.blockId)] =
          i18n.language === "hi" ? b.blockNameHi : b.blockNameEn;
      });
    });
    return map;
  }, [districtsWithBlocks, i18n.language]);

  const centerNameById = useMemo(() => {
    const map = {};
    cmtcCenters.forEach((c) => {
      map[String(c.centerId ?? c.id)] = c.name ?? c.centerName;
    });
    return map;
  }, [cmtcCenters]);

  // =========================
// CMTC CENTER CHANGE
// =========================
const handleCmtcCenterChange = (event, value) => {
  setFormData((prev) => ({
    ...prev,
    cmtcCenterId: value?.centerId ? String(value.centerId) : "",
    cmtcCenterName: value?.name || "",
    assignedCmtcCenterId: value?.centerId ? String(value.centerId) : "",
    assignedCmtcCenterName: value?.name || "",
  }));
};
  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchDistrictsWithBlocks();
  }, [fetchDistrictsWithBlocks]);

    useEffect(() => {
        if (!formData.districtId) return;

        setBlocksFromDistrict(formData.districtId);
        }, [formData.districtId, setBlocksFromDistrict]);
        
    useEffect(() => {
        if (!formData.blockId) return;

        fetchCentersByBlock(formData.blockId);
    }, [formData.blockId, ]);

        // -----------------------------
    // Validate Form
    // -----------------------------
    const validateForm = () => {
      const errors = {};
    
      if (!formData.username?.trim()) {
        errors.username = "Username is required";
      }
    
      if (!formData.fullName?.trim()) {
        errors.fullName = "Full name is required";
      }
    
      if (!formData.email?.trim()) {
        errors.email = "Email is required";
      }
    
      if (!formData.mobileNo?.trim()) {
        errors.mobileNo = "Mobile number is required";
      }
    
      if (!formData.role) {
        errors.role = "Role is required";
      }
    
      // optional (important for your case)
      if (
        (formData.role === USER_ROLES.CMTC_MANAGER ||
          formData.role === USER_ROLES.CMTC_STAFF) &&
        !formData.cmtcCenterId
      ) {
        errors.cmtcCenter = "CMTC Center is required";
      }
    
      setValidationErrors(errors);
    
      return Object.keys(errors).length === 0;
    };
  return {
    // form
    formData,
    validateForm,
    setFormData,
    validationErrors,
    setValidationErrors,
    handleChange,
    handleRoleChange,

    // geo
    districts,
    blocks,
    cmtcCenters,

    // maps
    districtNameById,
    blockNameById,
    centerNameById,

    // loading
    loadingDistricts,
    loadingBlocks,
    loadingCenters,

    // actions
    fetchDistrictsWithBlocks,
    fetchCentersByBlock,
    setBlocksFromDistrict,
    resetGeo,

    // 🔥 NEW
    hydrateGeoForEdit,
    handleCmtcCenterChange,
  };
};