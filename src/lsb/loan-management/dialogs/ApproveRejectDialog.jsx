import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  updateRowStatus,
  updateRowStatusBatch,
} from "../loanRequestApi";

import {
  canProcessLoanRow,
} from "../utils/loanRowActions";
import { useNavigate } from "react-router-dom";

const ApproveRejectDialog = ({
  open,
  type,
  selectedRow,
  selectedRows,
  onClose,
  onSuccess,
}) => {

  const [remarks, setRemarks] =
    useState("");

  const [loading, setLoading] =
    useState(false);

    const navigate = useNavigate();//
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

  /**
   * =========================================
   * FLAGS
   * =========================================
   */

  const isApprove =
    type === "APPROVE" ||
    type === "BULK_APPROVE";

  // const isBulk =
  //   type === "BULK_APPROVE";
  const isBulk =                     //
  type === "BULK_APPROVE" ||
  type === "BULK_REJECT";

  /**
   * =========================================
   * DIALOG TITLE
   * =========================================
   */

  // const dialogTitle = isBulk
  //   ? "Confirm Bulk Approval"
  //   : isApprove
  //     ? "Confirm Approval"
  //     : "Confirm Rejection";

  const dialogTitle =    //
  type === "BULK_APPROVE"
    ? "Confirm Bulk Approval"
    : type === "BULK_REJECT"
      ? "Confirm Bulk Rejection"
      : isApprove
        ? "Confirm Approval"
        : "Confirm Rejection";

  /**
   * =========================================
   * RESET FORM ON OPEN/CLOSE
   * =========================================
   */

  useEffect(() => {

    if (!open) {
      setRemarks("");
    }

  }, [open]);

  /**
   * =========================================
   * SUBMIT
   * =========================================
   */

  const handleSubmit = async () => {

    try {

      setLoading(true);

      /**
       * SINGLE APPROVE
       */
      if (type === "APPROVE") {

        await updateRowStatus({
          loanAcNo: selectedRow.loanAcNo,
          applicationId:
            selectedRow.applicationId,
          action: "APPROVE",
          reason: remarks,
        });
      }

      /**
       * SINGLE REJECT
       */
      if (type === "REJECT") {

        await updateRowStatus({
          loanAcNo: selectedRow.loanAcNo,
          applicationId:
            selectedRow.applicationId,
          action: "REJECT",
          reason: remarks,
        });
      }

      /**
       * BULK APPROVE
       */
      if (type === "BULK_APPROVE") {

        const payload =
          selectedRows.map((row) => ({
            loanAcNo: row.loanAcNo,
            applicationId:
              row.applicationId,
            action: "APPROVE",
            reason: remarks,
          }));

        await updateRowStatusBatch(
          payload
        );
      }

              /**
         * BULK REJECT
         */
        if (type === "BULK_REJECT") {   // ADD BULK REJECT

          const payload =
            selectedRows.map((row) => ({
              loanAcNo: row.loanAcNo,
              applicationId:
                row.applicationId,
              action: "REJECT",
              reason: remarks,
            }));
             console.log(
                "BULK_REJECT",
                payload
              );

          await updateRowStatusBatch(
            payload
          );
        }

      // onSuccess?.();
              if (
          type === "APPROVE" ||
          type === "BULK_APPROVE"
        ) {
          setSuccessMessage(
            "Records approved successfully."
          );
        } else {
          setSuccessMessage(
            "Records rejected successfully."
          );
        }
        setSuccessOpen(true);

    } catch (error) {

      console.error(
        "Action failed",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  /**
   * =========================================
   * CLOSE
   * =========================================
   */

  const handleClose = () => {

    if (loading) return;

    setRemarks("");

    onClose?.();
  };
// add to redirect after ok
  const handleSuccessOk = () => {   
  setSuccessOpen(false);

  onSuccess?.();

  navigate("/lsb/loan-requests");
};

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >

      {/* =========================================
          TITLE
      ========================================= */}

      <DialogTitle>
        {dialogTitle}
      </DialogTitle>

      {/* =========================================
          CONTENT
      ========================================= */}

      <DialogContent>

        <Stack spacing={2} mt={1}>

          <Typography
            variant="body2"
            color="text.secondary"
          >

            {isBulk
              ? `Selected Rows : ${
                  selectedRows?.length || 0
                }`
              : `Selected SHG : ${
                  selectedRow?.shgName ||
                  "-"
                }`}

          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarks"
            placeholder="Enter remarks..."
            value={remarks}
            onChange={(e) =>
              setRemarks(
                e.target.value
              )
            }
              error={!remarks.trim()}// VALIDATE TO REMARK MANDATE
              helperText={
                !remarks.trim()
                  ? "Remarks is required"
                  : ""
              }
          />

        </Stack>

      </DialogContent>

      {/* =========================================
          ACTIONS
      ========================================= */}

      <DialogActions>

        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color={
            isApprove
              ? "success"
              : "error"
          }
          onClick={handleSubmit}
          // disabled={loading}
          disabled={  // VALIDATE
            loading ||
            !remarks.trim()
          }
        >

          {loading
            ? "Processing..."
            : isApprove
              ? "Confirm Approval"
              : "Confirm Rejection"}

        </Button>

      </DialogActions>

    </Dialog>
{/*  add successully reject approved dialog */}

        <Dialog
      open={successOpen}
      onClose={handleSuccessOk}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "success.main",
        }}
      >
        Success
      </DialogTitle>

      <DialogContent>
        <Typography align="center">
          {successMessage}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleSuccessOk}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>

    </>
  );
};

export default ApproveRejectDialog;