// UserManagementPage.jsx
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

const UserForm = ({
  formData,
  validationErrors,
  handleChange,
  handleSubmit,
  handleRoleChange,
  renderGeographicalDropdown,
  availableRoles,
  ROLE_LABELS,
  getRoleIcon,
  isEditing,
  inputSx,
  t,
  USER_ROLES,
  isOriginalDesignationRequired,
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <input type="text" name="fakeuser" style={{ display: "none" }} />
      <input type="password" name="fakepass" style={{ display: "none" }} />
      <input type="text" name="fake_username" autoComplete="username" style={{ display: "none" }} />
      <input type="password" name="fake_password" autoComplete="current-password" style={{ display: "none" }} />
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            sx={inputSx}
            fullWidth
            label={t("admin.umFullName")}
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={!!validationErrors.fullName}
            helperText={validationErrors.fullName}
          />
        </Grid>

        {/* add original designation field*/}
        {isOriginalDesignationRequired && (
        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            sx={inputSx}
            fullWidth
            label={t("admin.umDesignation")}
            id="originalDesignation"
            name="originalDesignation"
            type="text"
            value={formData.originalDesignation}
            onChange={handleChange}
            required
            error={!!validationErrors.originalDesignation}
            helperText={validationErrors.originalDesignation}
          />
        </Grid>
        )}

        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            sx={inputSx}
            fullWidth
            label={t("admin.umUsername")}
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isEditing}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
          />
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            sx={inputSx}
            fullWidth
            label={t("admin.umEmail")}
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            sx={inputSx}
            fullWidth
            label={t("admin.umMobileNo")}
            id="mobileNo"
            name="mobileNo"
            type="tel"
            value={formData.mobileNo}
            onChange={handleChange}
            required
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 10,
            }}
            error={!!validationErrors.mobileNo}
            helperText={validationErrors.mobileNo}
          />
        </Grid>

        <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
         
          <FormControl fullWidth required error={!!validationErrors.role}>
           
            <InputLabel id="role-label">{t("admin.umRole")} </InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isEditing}
            >
              
              {availableRoles?.filter(Boolean).map((role) => (
                <MenuItem key={role} value={role}>
                  
                  <Box display="flex" alignItems="center">
                    
                    {getRoleIcon(role)}
                    <Box component="span" ml={1}>
                      
                      {ROLE_LABELS[role] || role.replace("_", " ")}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {validationErrors.role && (
              <Typography color="error" variant="caption">
                
                {validationErrors.role}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Geographical dropdowns */}
        {renderGeographicalDropdown()}

        <Grid item xs={12} md={6} size={{ xs: 12, sm: 6 }}>
          
          <TextField
            sx={inputSx}
            fullWidth
            label={isEditing ? t("admin.umNewPassword") : t("admin.umPassword")}
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            placeholder={
              isEditing ? "Leave blank to keep current password" : ""
            }
            error={!!validationErrors.password}
            helperText={validationErrors.password || "Minimum 6 characters"}
          />
        </Grid>

        <Grid item xs={12} size={12}>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.enabled}
                onChange={handleChange}
                name="enabled"
                id="enabled"
              />
            }
            label={t("admin.umAccountEnabled")}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", mt: 2 }}
        >
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isEditing ? t("admin.umUpdateUser") : t("admin.umCreateUser")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;
