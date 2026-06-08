import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";

const FileUploadSection = ({
  loanFile,
  supportingFile,
  onLoanFileChange,
  onSupportingFileChange,
  loading,
  isReady,
  onPreview,
}) => {
  return (
    <Stack spacing={3}>
      
      {/* ===== EXCEL FILE ===== */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Upload Loan Details Excel *
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={loading}
          >
            Upload File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={onLoanFileChange}
            />
          </Button>

          {/* Status */}
          {loading && <Chip label="Processing..." color="warning" />}
          {!loading && isReady && (
            <Chip label="Ready" color="success" />
          )}
        </Stack>

        {/* Selected file */}
        {loanFile && (
          <Typography variant="body2" color="success.main" mt={1}>
            {loanFile.name}
          </Typography>
        )}

        {/* Preview button */}
        {loanFile && (
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            sx={{ mt: 1 }}
            onClick={onPreview}
            disabled={!isReady || loading}
          >
            Preview Excel
          </Button>
        )}
      </Box>

      {/* ===== SUPPORTING DOC ===== */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Upload Supporting Document
        </Typography>

        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
        >
          Upload Document
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={onSupportingFileChange}
          />
        </Button>

        {supportingFile && (
          <Typography variant="body2" color="success.main" mt={1}>
            {supportingFile.name}
          </Typography>
        )}
      </Box>

    </Stack>
  );
};

export default FileUploadSection;