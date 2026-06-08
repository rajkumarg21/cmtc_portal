import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByBlock,
} from "../../services/cmtcCenterService";

import CmtcGalleryAdmin from "./CmtcGalleryAdmin.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { USER_ROLES } from "../../utils/constants.js";

export default function CmtcGalleryAdminPage() {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);

  const { t,i18n} = useTranslation();
  const isHindi = i18n.language === "hi";
  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [centerId, setCenterId] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const getDistrictId = (d) => d?.districtId ?? d?.id ?? "";
  const getDistrictLabel = (d) =>
    isHindi
      ? d?.districtNameHi || d?.districtNameEn || d?.name || String(getDistrictId(d))
      : d?.districtNameEn || d?.districtNameHi || d?.name || String(getDistrictId(d));

  const getBlockId = (b) => b?.blockId ?? b?.id ?? "";
  const getBlockLabel = (b) =>
    isHindi
      ? b?.blockNameHi || b?.blockNameEn || b?.blockName || b?.name || `Block-${getBlockId(b)}`
      : b?.blockNameEn || b?.blockNameHi || b?.blockName || b?.name || `Block-${getBlockId(b)}`;
  const {user,userRole} = useAuth();
  const getCenterId = (c) => c?.id ?? c?.centerId ?? c?.cmtc_centers_id ?? c?.cmtcCentersId ?? "";
  const getCenterLabel = (c) =>
    isHindi
      ? c?.centerNameHi || c?.centerNameEn || c?.name || c?.centerName || c?.center_name || c?.code || `Center-${getCenterId(c)}`
      : c?.centerNameEn || c?.centerNameHi || c?.name || c?.centerName || c?.center_name || c?.code || `Center-${getCenterId(c)}`;

  const selectedDistrict = useMemo(
    () => districts.find((d) => String(getDistrictId(d)) === String(districtId)),
    [districts, districtId]
  );
  const selectedBlock = useMemo(
    () => blocks.find((b) => String(getBlockId(b)) === String(blockId)),
    [blocks, blockId]
  );
  const selectedCenter = useMemo(
    () => centers.find((c) => String(getCenterId(c)) === String(centerId)),
    [centers, centerId]
  );

  // 1) Load districts once
  useEffect(() => {
    (async () => {
      setLoadingDistricts(true);
      try {
        const res = await getAllDistricts();
        const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setDistricts(data);
        if(userRole === USER_ROLES.DISTRICT_OFFICER || userRole === USER_ROLES.BLOCK_OFFICER){
          setDistrictId(user.districtId)
        }
      } catch (e) {
        toast.error("Failed to load districts");
      } finally {
        setLoadingDistricts(false);
      }
    })();
  }, []);

  // 2) District -> load blocks and auto-select first block
  useEffect(() => {
    if (!districtId) {
      setBlocks([]);
      setCenters([]);
      setBlockId("");
      setCenterId("");
      return;
    }

    (async () => {
      setLoadingBlocks(true);
      try {
        const bRes = await getBlocksByDistrict(districtId);
        const bData = Array.isArray(bRes?.data) ? bRes.data : bRes?.data?.data || [];
        setBlocks(bData);

        if(userRole === USER_ROLES.BLOCK_OFFICER){
          setBlockId(user.blockId);
        }

        setCenters([]);
        setCenterId("");
      } catch (e) {
        toast.error("Failed to load blocks");
        setBlocks([]);
        setCenters([]);
        setBlockId("");
        setCenterId("");
      } finally {
        setLoadingBlocks(false);
      }
    })();
  }, [districtId]);

  // 3) Block -> load centers and auto-select first center
  useEffect(() => {
    if (!blockId) {
      setCenters([]);
      setCenterId("");
      return;
    }

    (async () => {
      setLoadingCenters(true);
      try {
        const cRes = await getCentersByBlock(blockId);
        const cData = Array.isArray(cRes?.data) ? cRes.data : cRes?.data?.data || [];
        setCenters(cData);

        const firstCenterId = cData?.length ? String(getCenterId(cData[0])) : "";
        setCenterId(firstCenterId);
      } catch (e) {
        toast.error("Failed to load centers by block");
        setCenters([]);
        setCenterId("");
      } finally {
        setLoadingCenters(false);
      }
    })();
  }, [blockId]);

  // Small helper: enterprise select styling
  const selectSx = {
    "& .MuiSelect-select": { display: "flex", alignItems: "center" },
  };

  // 🔒 Role based locking
  const isDistrictLocked =
    userRole === USER_ROLES.DISTRICT_OFFICER ||
    userRole === USER_ROLES.BLOCK_OFFICER;

  const isBlockLocked =
    userRole === USER_ROLES.BLOCK_OFFICER;

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        bgcolor: "#f6f8fb",
        minHeight: "100vh",
        
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto"}}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid grey",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h6"
                component="h6"
                sx={{
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  mb: 1,
                  fontSize: "16px"
                  }}
                >
               {t("admin.cmtcGalleryHeading")}
              </Typography>
              <Typography sx={{ mt: 0.5, color: "text.secondary" ,  fontSize: "14px" }}>
                {t("admin.cmtcGalleryTitle")}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {centerId ? (
                <Chip
                  label={t("admin.centerSelected")}
                  color="success"
                  variant="outlined"
                  
                />
              ) : (
                <Chip
                  label={t("admin.selectionRequired")}
                  color="warning"
                  variant="outlined"
                  
                />
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Filters */}
          <Grid container spacing={2}>
            {/* District */}
            <Grid item xs={12} md={4} size={6}>
              <FormControl fullWidth disabled={loadingDistricts || isDistrictLocked}>
                {/* IMPORTANT: shrink=true so label never collapses/overlaps */}
                <InputLabel shrink id="district-label">
                  {t("admin.district")}
                </InputLabel>
                <Select
                  labelId="district-label"
                  value={districtId}
                  onChange={(e) => setDistrictId(String(e.target.value))}
                  displayEmpty
                  label="District"
                  sx={selectSx}
                  renderValue={(val) => {
                    if (!val) return <Typography sx={{ color: "text.secondary" }}>{t("center_management.selectDistrict")}</Typography>;
                    return <Typography>{getDistrictLabel(selectedDistrict)}</Typography>;
                  }}
                  endAdornment={
                    loadingDistricts ? (
                      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                        <CircularProgress size={18} />
                      </Box>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>{t("center_management.selectDistrict")}</em>
                  </MenuItem>
                  {districts.map((d) => {
                    const id = String(getDistrictId(d));
                    return (
                      <MenuItem key={id} value={id}>
                        {getDistrictLabel(d)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Block */}
            <Grid item xs={12} md={4} size={6}>
              <FormControl fullWidth disabled={!districtId || loadingBlocks || isBlockLocked}>
                <InputLabel shrink id="block-label">
                 {t("admin.block")}
                </InputLabel>
                <Select
                  labelId="block-label"
                  value={blockId}
                  onChange={(e) => setBlockId(String(e.target.value))}
                  displayEmpty
                  label="Block"
                  sx={selectSx}
                  renderValue={(val) => {
                    if (!districtId) return <Typography sx={{ color: "text.secondary" }}>{t("cmtc_gallery_mng.selectDistrictFirst")}</Typography>;
                    if (!val) return <Typography sx={{ color: "text.secondary" }}>{t("center_management.selectBlock")}</Typography>;
                    return <Typography>{getBlockLabel(selectedBlock)}</Typography>;
                  }}
                  endAdornment={
                    loadingBlocks ? (
                      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                        <CircularProgress size={18} />
                      </Box>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>{t("center_management.selectBlock")}</em>
                  </MenuItem>
                  {blocks.map((b) => {
                    const id = String(getBlockId(b));
                    return (
                      <MenuItem key={id} value={id}>
                        {getBlockLabel(b)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Center */}
            <Grid item xs={12} md={4} size={6}>
              <FormControl fullWidth disabled={!blockId || loadingCenters}>
                <InputLabel shrink id="center-label">
                 {t("admin.cmtcCenter")}
                </InputLabel>
                <Select
                  labelId="center-label"
                  value={centerId}
                  onChange={(e) => setCenterId(String(e.target.value))}
                  displayEmpty
                  label="CMTC Center"
                  sx={selectSx}
                  renderValue={(val) => {
                    if (!blockId) return <Typography sx={{ color: "text.secondary" }}>{t("cmtc_gallery_mng.selectBlockFirst")}</Typography>;
                    if (!val) return <Typography sx={{ color: "text.secondary" }}>{t("cmtc_gallery_mng.selectCenter")}</Typography>;
                    return <Typography>{getCenterLabel(selectedCenter)}</Typography>;
                  }}
                  endAdornment={
                    loadingCenters ? (
                      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                        <CircularProgress size={18} />
                      </Box>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>Select Center</em>
                  </MenuItem>
                  {centers.map((c) => {
                    const id = String(getCenterId(c));
                    return (
                      <MenuItem key={id} value={id}>
                        {getCenterLabel(c)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Context summary */}
          <Box sx={{ mt: 2 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#fbfcff",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Typography sx={{ color: "text.secondary" , fontSize :"14px"}}>
                   {t("admin.currentSelection")}:
                  <b> {districtId ? getDistrictLabel(selectedDistrict) : "—"}</b> /{" "}
                  <b>{blockId ? getBlockLabel(selectedBlock) : "—"}</b> /{" "}
                  <b>{centerId ? getCenterLabel(selectedCenter) : "—"}</b>
                </Typography>

                {centerId ? (
                  <Chip label={t("admin.readyToUpload")} color="success" size="small" />
                ) : (
                  <Chip label={t("admin.selectProceed")} color="warning" size="small" />
                )}
              </Stack>
            </Paper>
          </Box>
        </Paper>

        {/* Gallery */}
        <Box sx={{ mt: 2 ,}}>
          {centerId ? <CmtcGalleryAdmin centerId={centerId} /> : null}
        </Box>
      </Box>
    </Box>
  );
}
