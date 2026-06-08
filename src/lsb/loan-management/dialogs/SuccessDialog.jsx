import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const SuccessDialog = ({ open, onOk }) => {
  return (
    <Dialog open={open}>
      <DialogContent sx={{ textAlign: "center", p: 4 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <CheckCircleOutlineIcon
            color="success"
            sx={{ fontSize: 80 }}
          />
        </Box>

        <Typography variant="h5" gutterBottom>
          Success
        </Typography>

        <Typography>
          Loan Subsidy Request Submitted Successfully.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onOk}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;