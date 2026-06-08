import React from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  Alert,
} from "@mui/material";

import Autocomplete from "@mui/material/Autocomplete";

export const GeographicalFields = ({
  formData,
  validationErrors,
  loggedInRole,
  USER_ROLES,
  CENTER_ROLES,
  districts,
  blocks,
  cmtcCenters,
  loadingDistricts,
  loadingBlocks,
  loadingCenters,
  handleDistrictChange,
  handleBlockChange,
  handleCmtcCenterChange,
  inputSx,
  t,
  loggedInUser,
  getGeoConfig
}) => {
  const selectedRole = formData.role;

  const config = getGeoConfig(
    loggedInRole,
    selectedRole,
    USER_ROLES,
    CENTER_ROLES
  );

  // ✅ AUTO CENTER (only special case)
  if (config.autoFillCenter) {
    return (
      <Grid item xs={12}>
        <Alert severity="info">
          This staff member will be automatically assigned to your CMTC Center:{" "}
          <strong>{loggedInUser?.cmtcCenterName}</strong>
        </Alert>
      </Grid>
    );
  }

  return (
    <>
      {/* ✅ DISTRICT */}
      {config.showDistrict && (
        <Grid item size={{xs:12,md:6}}>
          <DistrictDropdown
            districts={districts}
            value={formData.districtId}
            onChange={handleDistrictChange}
            error={validationErrors.district}
            loading={loadingDistricts}
            t={t}
            disabled={config.disableDistrict}
          />
        </Grid>
      )}

      {/* ✅ BLOCK */}
      {config.showBlock && (
        <Grid item size={{xs:12,md:6}}>
          <BlockDropdown
            blocks={blocks}
            value={formData.blockId}
            onChange={handleBlockChange}
            error={validationErrors.block}
            loading={loadingBlocks}
            inputSx={inputSx}
            t={t}
            disabled={config.disableBlock}
          />
        </Grid>
      )}

      {/* ✅ CENTER */}
      {config.showCenter && (
        <Grid item size={{xs:12,md:6}}>
          <CenterDropdown
            centers={cmtcCenters}
            value={formData.cmtcCenterId}
            onChange={handleCmtcCenterChange}
            error={validationErrors.cmtcCenter}
            loading={loadingCenters}
            inputSx={inputSx}
            t={t}
            disabled={config.disableCenter}
          />
        </Grid>
      )}
    </>
  );
};

const DistrictDropdown = ({
  districts = [],
  value,
  onChange,
  error,
  loading,
  t,
  disabled = false,
}) => (
  <FormControl
    fullWidth
    required
    error={!!error}
    disabled={loading || disabled}
  >
    <InputLabel>{t("admin.district")}</InputLabel>

    <Select
      value={value || ""}
      onChange={onChange}
      label={t("admin.district")}
    >
      {districts.map((d) => (
        <MenuItem key={d.districtId} value={String(d.districtId)}>
          {d.districtNameHi || d.districtNameEn}
        </MenuItem>
      ))}
    </Select>

    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </FormControl>
);

const BlockDropdown = ({
  blocks = [],
  value,
  onChange,
  error,
  loading,
  inputSx,
  t,
  disabled = false,
}) => {
  const selectedValue =
    blocks.find((b) => String(b.blockId) === String(value)) || null;

  return (
    <Autocomplete
      options={blocks}
      value={selectedValue}
      getOptionLabel={(o) => o.blockNameHi || o.blockNameEn || ""}
      isOptionEqualToValue={(o, v) => o.blockId === v.blockId}
      onChange={onChange}
      disabled={loading || disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={inputSx}
          label={t("admin.Bblock")}
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};

const CenterDropdown = ({
  centers = [],
  value,
  onChange,
  error,
  loading,
  inputSx,
  t,
  disabled = false,
}) => {
  const selectedValue =
    centers.find((c) => String(c.centerId) === String(value)) || null;

  return (
    <Autocomplete
      options={centers}
      value={selectedValue}
      getOptionLabel={(o) => o.name || ""}
      isOptionEqualToValue={(o, v) =>
        String(o.centerId) === String(v.centerId)
      }
      onChange={onChange}
      disabled={loading || disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={inputSx}
          label={t("admin.cmtcCenter")}
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};