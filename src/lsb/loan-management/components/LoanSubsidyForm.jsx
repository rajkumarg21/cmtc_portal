import { Box, Paper, Stack } from "@mui/material";
import { useLoanSubsidyForm } from "../hooks/useLoanSubsidyForm";

/* Sections */
import BasicDetailsSection from "./BasicDetailsSection";
import FileUploadSection from "./FileUploadSection";
import ExcelProcessingStatus from "./ExcelProcessingStatus";
import FormActions from "./FormActions";

/* Dialogs */
import ExcelPreviewDialog from "../dialogs/ExcelPreviewDialog";
import PreviewConfirmationDialog from "../dialogs/PreviewConfirmationDialog";
import SubmitConfirmationDialog from "../dialogs/SubmitConfirmationDialog";
import SuccessDialog from "../dialogs/SuccessDialog";

const LoanSubsidyForm = () => {
  const form = useLoanSubsidyForm();

  return (
    <Box>
      <form onSubmit={form.handleSubmit(form.onSubmit)}>
        <Stack spacing={3}>

          {/* 🔹 Excel Status */}
          <ExcelProcessingStatus
            loading={form.excelLoading}
            error={form.excelError}
            isReady={form.isExcelReady()}
          />

          {/* 🔹 Form Card */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>

              {/* Basic Details */}
              <BasicDetailsSection control={form.control} />

              {/* File Upload */}
              <FileUploadSection
                loanFile={form.loanFile}
                supportingFile={form.supportingFile}
                onLoanFileChange={form.handleLoanFileChange}
                onSupportingFileChange={form.handleSupportingFileChange}
                loading={form.excelLoading}
                isReady={form.isExcelReady()}
                onPreview={form.openPreview}
              />

            </Stack>
          </Paper>

          {/* 🔹 Actions */}
          <FormActions
            onSubmit={form.onSubmit}
            loading={form.submitting}
            onReset={form.resetAll}
            isReady={form.isExcelReady()}
          />

        </Stack>
      </form>

      {/* ================= DIALOGS ================= */}

      {/* Excel Preview */}
      <ExcelPreviewDialog
        open={form.previewOpen}
        onClose={() => form.setPreviewOpen(false)}
        rows={form.rows}
        columns={form.headers}
        totals={{
          totalShg: form.shgCount,
          totalAmount: form.loanAmount,
        }}
        loading={form.excelLoading}
      />

      {/* Preview Confirmation */}
      <PreviewConfirmationDialog
        open={form.confirmPreviewOpen}
        onClose={() => form.setConfirmPreviewOpen(false)}
        onConfirm={form.confirmPreviewWithExcel}
        formValues={form.formValues}
        excelValues={{
          shgCount: form.shgCount,
          loanAmount: form.loanAmount,
        }}
      />

      {/* Submit Confirmation */}
      <SubmitConfirmationDialog
        open={form.submitConfirmOpen}
        onClose={() => form.setSubmitConfirmOpen(false)}
        onConfirm={form.confirmSubmitWithExcel}
        formValues={form.formValues}
        excelValues={{
          shgCount: form.shgCount,
          loanAmount: form.loanAmount,
        }}
      />
      {/* SuccessDialog open */}
      <SuccessDialog
        open={form.successOpen}
        onOk={form.handleSuccessOk}
      />
    </Box>
  );
};

export default LoanSubsidyForm;