import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const SubmitConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  formValues,
  excelValues,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* <DialogTitle color="warning.main">
        Value Mismatch Detected
      </DialogTitle> */}

      <DialogContent>
        {/* <Typography variant="body2" mb={2}>
          Form values do not match Excel:
        </Typography> */}
        <Typography>  
          Are you sure you want to submit this loan subsidy request?
        </Typography>

        {/* <Typography>
          SHG: {formValues.totalShgRequested} → {excelValues.shgCount}
        </Typography>

        <Typography>
          Amount: {formValues.totalLoanAmount} → {excelValues.loanAmount}
        </Typography>

        <Typography mt={2}>
          Use Excel values and continue?
        </Typography> */}
      </DialogContent>

      <DialogActions>
        {/* <Button onClick={onClose}>Keep Form Values</Button>
        <Button variant="contained" color="success" onClick={onConfirm}>
          Use Excel Values
        </Button> */}
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="Success" onClick={onConfirm}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitConfirmationDialog;