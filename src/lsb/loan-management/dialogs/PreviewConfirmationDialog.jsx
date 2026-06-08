import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const PreviewConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  formValues,
  excelValues,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Excel Values Detected</DialogTitle>

      <DialogContent>
        {/* <Typography variant="body2" mb={2}>
          Excel values differ from form values:
        </Typography> */}

        <Typography>
          SHG: {formValues.totalShgRequested} → {excelValues.shgCount}
        </Typography>

        <Typography>
          Amount: {formValues.totalLoanAmount} → {excelValues.loanAmount}
        </Typography>

        {/* <Typography mt={2}>
          Do you want to use Excel values?
        </Typography> */}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Use Excel Values
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewConfirmationDialog;