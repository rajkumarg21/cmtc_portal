import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box,
  Chip,
} from "@mui/material";

const CenterDetailsDialog = ({ open, onClose, center, t, i18n }) => {
  if (!center) return null;

  const isHindi = i18n.language === "hi";

  const getDistrictName = () =>
    isHindi ? center.districtNameHi : center.districtNameEn;

  const getBlockName = () =>
    isHindi ? center.bloackNameHi || center.blockName : center.blockName;

  const renderField = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || t("centerDetails.na")}
      </Typography>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      
      {/* HEADER */}
      <DialogTitle>
        {center.centerName}
      </DialogTitle>

      <DialogContent dividers>

        {/* ================= BASIC DETAILS ================= */}
        <Typography variant="h6" gutterBottom>
          {t("centerDetails.centerDescription")}
        </Typography>

        <Grid container spacing={2}>
          {renderField(t("centerDetails.centerCode"), center.code)}
          {renderField(t("centerDetails.centerType"), center.centerType)}
          {renderField(t("centerDetails.establishmentYear"), center.establishmentYear)}
          {renderField(t("centerDetails.district"), getDistrictName())}
          {renderField(t("centerDetails.block"), getBlockName())}
          {renderField(t("centerDetails.pincode"), center.pincode)}
          {renderField(t("centerDetails.serviceContact"), center.contactNumber)}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ================= CAPACITY ================= */}
        <Typography variant="h6" gutterBottom>
          {t("centerDetails.capacityAndPricing")}
        </Typography>

        <Grid container spacing={2}>
          {renderField(
            t("centerDetails.residentialCapacity"),
            center.residentialCapacity
          )}
          {renderField(
            t("centerDetails.nonResidentialCapacity"),
            center.nonResidentialCapacity
          )}
          {renderField(
            t("centerDetails.residentialPricePerTrainee"),
            center.resPrice
          )}
          {renderField(
            t("centerDetails.nonResidentialPricePerTrainee"),
            center.nonResPrice
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ================= DESCRIPTION ================= */}
        <Typography variant="h6" gutterBottom>
          {t("centerDetails.centerDescription")}
        </Typography>

        <Typography variant="body2">
          {center.description || t("centerDetails.noDescription")}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ================= OFFICERS ================= */}
        <Typography variant="h6" gutterBottom>
          {t("centerDetails.centerOfficers")}
        </Typography>

        {center.officers?.length ? (
          <Grid container spacing={2}>
            {center.officers.map((officer) => (
              <Grid item xs={12} sm={6} key={officer.id}>
                <Box
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    {officer.officerName}
                  </Typography>

                  <Typography variant="body2">
                    {t("booking.designation")}: {officer.officerDesignation}
                  </Typography>

                  <Typography variant="body2">
                    {t("centerDetails.serviceContact")}: {officer.officerMobile}
                  </Typography>

                  <Typography variant="body2">
                    Email: {officer.officerEmail}
                  </Typography>

                  <Box mt={1}>
                    <Chip
                      size="small"
                      label={officer.isActive ? "Active" : "Inactive"}
                      color={officer.isActive ? "success" : "default"}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2">
            {t("centerDetails.noOfficerDetails")}
          </Typography>
        )}

      </DialogContent>

      {/* FOOTER */}
      <DialogActions>
        <Button onClick={onClose}>
          {t("booking.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CenterDetailsDialog;