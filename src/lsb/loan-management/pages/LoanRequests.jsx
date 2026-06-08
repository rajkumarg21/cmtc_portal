import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Pagination,
  TablePagination,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import useLoanRequests from "../hooks/useLoanRequests";
import LsbPageHeader from "../../components/LsbPageHeader";
import { useEffect, useState } from "react";
import { getLoanRequestDetails } from "../loanRequestApi";
import FileViewer from "../../../components/common/FileViewerBookingModal";

const LoanRequests = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
   // Details API data
  const [detailsMap, setDetailsMap] =
    useState({});

  const {
    data,
    loading,
    totalElements,
    handleRefreshStatus,
  } = useLoanRequests(page, rowsPerPage);

   // Fetch details API using applicationId
  useEffect(() => {

    const fetchDetails =
      async () => {

        try {

          const results =
            await Promise.all(
              data.map(
                async (row) => {

                  const response =
                    await getLoanRequestDetails(
                      row.applicationId
                    );

                  return {
                    applicationId:
                      row.applicationId,

                    details:
                      response?.content?.[0],
                  };
                }
              )
            );

          const map = {};

          results.forEach((item) => {
            map[item.applicationId] =
              item.details;
          });

          setDetailsMap(map);

        } catch (error) {
          console.error(error);
        }
      };

    if (data.length > 0) {
      fetchDetails();
    }

  }, [data]);
 
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <LsbPageHeader
        title="Loan Requests"
        subtitle="View and manage all loan subsidy requests"
      />

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Application ID</TableCell>
              <TableCell>FY</TableCell>
              <TableCell>Quarter</TableCell>
              <TableCell>Current level</TableCell>
              <TableCell>Total SHG Requests</TableCell>
              <TableCell>Total Loan Amount</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Supporting Document</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => {
            const details =
                detailsMap[
                row.applicationId
                ];
            return (
              <TableRow key={row.id}>
                <TableCell>{row.applicationId}</TableCell>
                <TableCell>{row.financialYear}</TableCell>
                <TableCell>{row.quarter}</TableCell>
                <TableCell>{row.currentLevel}</TableCell>
                <TableCell>{row.totalShgRequested}</TableCell>
                <TableCell>{row.totalLoanAmount}</TableCell>
                <TableCell>{row.createdAt
                    ? new Date(
                        row.createdAt
                      ).toLocaleDateString("en-GB")
                    : "-"}</TableCell>
                <TableCell> {details?.districtName ||
                      "-"}</TableCell>
                <TableCell> {details?.bankName  ||
                      "-"}</TableCell>      
                <TableCell>
                  <Chip label={row.status} color="warning" />
                </TableCell>
                <TableCell>
                {row.supportingDocPath ? (
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={`${import.meta.env.VITE_APP_BACKEND_URL}${row.supportingDocPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </Button>
                ) : (
                  "-"
                )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      navigate(`/lsb/loan-requests/${row.applicationId}`)
                    }
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  {/* <Button        // remove refresh button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleRefreshStatus(row.applicationId)}
                  >
                    Refresh Status
                  </Button> */}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />      
        </TableContainer>
    </Box>
  );
};

export default LoanRequests;