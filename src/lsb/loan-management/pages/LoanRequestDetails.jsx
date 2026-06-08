import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import RequestStatusChip from "../components/RequestStatusChip";

import ApproveRejectDialog from "../dialogs/ApproveRejectDialog";

import useLoanRequestDetails from "../hooks/useLoanRequestDetails";

import { getLoanRequestPermissions } from "../config/loanRequestPermissions";
import { useAuth } from "../../../context/AuthContext";
import { canProcessLoanRow } from "../utils/loanRowActions";

export const LoanRequestDetails =
  () => {
    const { applicationId } = useParams();
    const { userRole } = useAuth();
    const permissions =
      getLoanRequestPermissions(
        userRole
      );

    const {
      rows,
      loading,
      pagination,
      refresh,
    } = useLoanRequestDetails(
      applicationId
    );

    const [
      selectedRows,
      setSelectedRows,
    ] = useState([]);

    const [dialogOpen, setDialogOpen] =
      useState(false);

    const [dialogType, setDialogType] =
      useState("");

    const [selectedRow, setSelectedRow] =
      useState(null);

    const selectableRows = useMemo(() => {
      return rows.filter((row) =>
        canProcessLoanRow(
          userRole,
          row.processingStatus
        )
      );
    }, [rows, userRole]);

    const hasValidRows =      // ADD VALIDATION ON BULK APPROVE BUTTON
  selectableRows.length > 0;

    // const allSelected = useMemo(() => {
    //   return (
    //     selectableRows.length > 0 &&
    //     selectedRows.length ===
    //     selectableRows.length
    //   );
    // }, [
    //   selectableRows,
    //   selectedRows,
    // ]);



    // const handleSelectAll = () => {
    //   if (
    //     !permissions.allowRowSelection
    //   )
    //     return;

    //   if (allSelected) {
    //     setSelectedRows([]);
    //   } else {
    //     setSelectedRows(
    //       selectableRows
    //     );
    //   }
    // };


     // auto select all rows//
    useEffect(() => {

      if (rows?.length > 0) {

        const selectable =
          rows.filter((row) =>
            canProcessLoanRow(
              userRole,
              row.processingStatus
            )
          );

        setSelectedRows(
          selectable
        );
      }

    }, [rows, userRole]);//

    const openSingleActionDialog = (
      type,
      row
    ) => {
      setDialogType(type);
      setSelectedRow(row);
      setDialogOpen(true);
    };

    const openBulkActionDialog = (
      type
    ) => {
      setDialogType(type);
      setSelectedRow(null);
      setDialogOpen(true);
    };

    const handleDialogClose = () => {
      setDialogOpen(false);
      setSelectedRow(null);
    };

    const handleSelectRow = (
      row
    ) => {

      if (
        !permissions.allowRowSelection
      )
        return;

      if (
        !canProcessLoanRow(
          userRole,
          row.processingStatus
        )
      )
        return;

      setSelectedRows((prev) => {

        const exists = prev.some(
          (x) => x.id === row.id
        );

        if (exists) {
          return prev.filter(
            (x) => x.id !== row.id
          );
        }

        return [...prev, row];
      });
    };

    return (
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
            >
              Loan Request Details
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Application ID :
              {" "}
              {applicationId}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total Records :
              {" "}
              {
                pagination.totalElements
              }
            </Typography>

            <Typography
              variant="body2"
              color="primary"
              mt={1}
            >
              Current Role :
              {" "}
              {userRole}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
          >
            {permissions.showBulkApprove && (
              <Button
                variant="contained"
                color="success"
                // disabled={
                //   selectedRows.length ===
                //   0
                // }
                disabled={!hasValidRows}//
                onClick={() =>
                  openBulkActionDialog(
                    "BULK_APPROVE"
                  )
                }
              >
                Bulk Approve
              </Button>
            )}

            {permissions.showBulkReject && (
              <Button
                variant="contained"
                color="error"
                disabled={
                  selectedRows.length ===
                  0
                }
                onClick={() =>
                  openBulkActionDialog(
                    "BULK_REJECT"
                  )
                }
              >
                Bulk Reject
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Selected Count */}
        {permissions.allowRowSelection && (
          <Box mb={2}>
            <Typography
              variant="body2"
              color="primary"
            >
              Selected Rows :
              {" "}
              {
                selectedRows.length
              }
            </Typography>
          </Box>
        )}

        {/* Loader */}
        {loading ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            py={10}
          >
            <CircularProgress />
          </Stack>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ overflowX: 'auto' }}
          >
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {/* <TableCell padding="checkbox">
                    {permissions.allowRowSelection && (
                      <Checkbox
                        checked={
                          allSelected
                        }
                        indeterminate={
                          selectedRows.length >
                          0 &&
                          !allSelected
                        }
                        onChange={
                          handleSelectAll
                        }
                      />
                    )}
                  </TableCell> */}
                  {/* Removed Select All Checkbox */}
                  <TableCell padding="checkbox">
                  </TableCell>

                  <TableCell>
                    Row No
                  </TableCell>

                  <TableCell>
                    SHG Name
                  </TableCell>

                  <TableCell>
                    Savings A/C
                  </TableCell>

                  <TableCell>
                    Loan A/C
                  </TableCell>

                  <TableCell>
                    District
                  </TableCell>

                  <TableCell>
                    Bank
                  </TableCell>

                  <TableCell>
                    Loan Amount
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                  {/* <TableCell align="center">   // remove action column
                    Actions
                  </TableCell> */}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows?.length > 0 ? (
                  rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                    >
                      {/* <TableCell padding="checkbox">
                        {permissions.allowRowSelection &&
                          canProcessLoanRow(
                            userRole,
                            row.processingStatus
                          ) && (
                            <Checkbox
                              checked={selectedRows.some(
                                (x) => x.id === row.id
                              )}
                              onChange={() =>
                                handleSelectRow(row)
                              }
                            />
                          )}
                      </TableCell> */}
                       {/* Disabled Checked Checkbox */}
                      <TableCell padding="checkbox">

                        {permissions.allowRowSelection &&
                          canProcessLoanRow(
                            userRole,
                            row.processingStatus
                          ) && (
                            <Checkbox
                              checked={true}
                              disabled
                            />
                          )}

                      </TableCell>

                      <TableCell>
                        {
                          row.rowNumber
                        }
                      </TableCell>

                      <TableCell>
                        {row.shgName ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {row.sbAcNo ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {row.loanAcNo ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {row.districtName ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {row.bankName ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        ₹
                        {Number(
                          row.loanAmt || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </TableCell>

                      <TableCell>
                        <RequestStatusChip
                          status={
                            row.processingStatus
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          {canProcessLoanRow(
                            userRole,
                            row.processingStatus
                          ) && (
                              <>

                                {permissions.showApproveButton && (
                                  <Button
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={() =>
                                      openSingleActionDialog(
                                        "APPROVE",
                                        row
                                      )
                                    }
                                  >
                                    Approve
                                  </Button>
                                )}

                                {permissions.showRejectButton && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      openSingleActionDialog(
                                        "REJECT",
                                        row
                                      )
                                    }
                                  >
                                    Reject
                                  </Button>
                                )}
                              </>)
                          }
                          {/* {permissions.readOnly && (   // remove action column
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Read Only
                            </Typography>
                          )} */}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      align="center"
                    >
                      No Records Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog */}
        <ApproveRejectDialog
          open={dialogOpen}
          type={dialogType}
          selectedRow={selectedRow}
          selectedRows={selectedRows}
          onClose={
            handleDialogClose
          }
          onSuccess={() => {
            refresh();
            handleDialogClose();
          }}
        />
      </Box>
    );
  };

export default LoanRequestDetails;