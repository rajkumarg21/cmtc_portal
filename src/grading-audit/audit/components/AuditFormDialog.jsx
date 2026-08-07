import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Button,
  Box,
  Typography
} from "@mui/material";
import AuditQuestionsTable from "./AuditQuestionsTable";
// import { useAssessmentApi } from "../../hooks/useAssessmentApi";
import { useAssessmentApi } from "../../shared/hooks/useAssessmentApi";
import { useAssessmentForm } from "../../shared/hooks/useAssessmentForm";
import { useTranslation } from "react-i18next";

const AuditFormDialog = ({
  open,
  onClose,
  cycleId,
  center,
  isSubmitted,
  readOnly,   
  onSuccess
}) => {
  const { fetchForm, save, loading } = useAssessmentApi();
  const [data, setData] = useState(null);
  const { i18n } = useTranslation();

  const isHindi = i18n.language === "hi";

  const { form, updateField, validate, buildPayload } =
    useAssessmentForm(data);

  useEffect(() => {
    if (open && center) {
      loadForm();
    }
  }, [open, center]);

  const loadForm = async () => {
    const res = await fetchForm({
      cycleId,
      centerId: center.centerId
    });
    setData(res);
  };

  const handleSubmit = async () => {
    const errors = validate();

    if (errors.length > 0) {
      console.log("❌ Validation errors:", errors);
      alert(
        // `Invalid marks in ${errors.length} question(s).\nCheck console.`
         `Please fill all required fields for remaining ${errors.length} questions before submitting.`
      );
      return;
    }

    await save(buildPayload("SUBMITTED"));
    onSuccess?.();
    onClose();
  };

  const handleDraft = async () => {
    try{
         await save(buildPayload("DRAFT"));
          swal("Success", "Draft saved successfully", "success");
    } catch (error) {
      swal("Error", "Failed to save draft", "error");
  }
   
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isHindi
          ? center?.centerNameHi || center?.centerName
          : center?.centerName},{" "}
        {isHindi
          ? center?.blockNameHi || center?.blockNameEn
          : center?.blockNameEn},{" "}
        {isHindi
          ? form?.districtNameHi
          : form?.districtNameEn}
      </DialogTitle>

      <DialogContent>
        {loading && <CircularProgress />}

        {form && (
          <>
            {/* ✅ Info for submitted */}
            {isSubmitted && (
              <Typography color="green" mb={1}>
                This form has already been submitted
              </Typography>
            )}

            <AuditQuestionsTable
              questions={form.questions}
              onChange={updateField}
              readOnly={readOnly}   // ✅ pass down
            />

            {/* ✅ Hide buttons if read-only */}
            {!readOnly && (
              <Box mt={2} display="flex" gap={2}>
                <Button onClick={handleDraft}>
                  Save Draft
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuditFormDialog;