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
import AssessmentQuestionsTable from "./AssessmentQuestionsTable";
import { useAssessmentApi } from "../../hooks/useAssessmentApi";
import { useAssessmentForm } from "../../hooks/useAssessmentForm";
import { useTranslation } from "react-i18next";

const AssessmentFormDialog = ({
  open,
  onClose,
  cycleId,
  center,
  readOnly,   // ✅ added
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
        `Invalid marks in ${errors.length} question(s).\nCheck console.`
      );
      return;
    }

    await save(buildPayload("SUBMITTED"));
    onSuccess?.();
    onClose();
  };

  const handleDraft = async () => {
    await save(buildPayload("DRAFT"));
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
            {readOnly && (
              <Typography color="green" mb={1}>
                This form has already been submitted
              </Typography>
            )}

            <AssessmentQuestionsTable
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

export default AssessmentFormDialog;