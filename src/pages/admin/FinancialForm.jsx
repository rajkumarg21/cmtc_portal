import React, { useState } from "react";
import axios from "axios";

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Grid,
  Stack,
  Snackbar,
  Alert,
  Divider
} from "@mui/material";

import { Add, Delete, Save } from "@mui/icons-material";

const emptyRow = () => ({
  id: Date.now(),

  districtName: "",
  blockName: "",
  cmtcEstablishmentDate: "",
  clfName: "",

  bankName: "",
  clfAccountName: "",
  clfAccountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  accountHolderDesignation: "",
  mobileNumber: "",

  foodPaymentTotal: "",
  materialPaymentTotal: "",
  servicePaymentTotal: "",
  trainerPaymentTotal: "",
  netSavingsTotal: "",
  bankAvailableAmount: "",

  fdTotalDetails: "",

  establishmentReceivedTotal: "",
  establishmentExpenseTotal: "",
  establishmentBalanceTotal: "",

  managerTotalPayment: "",
  accountantTotalPayment: "",
  accountantRegularPayment: "",
  managerRegularPayment: "",

  reportMonth: "",
  reportYear: "",
});

export default function CmtcReportForm() {

  const [rows, setRows] = useState([emptyRow()]);

  const [success, setSuccess] = useState(false);

  // Add Row
  const addRow = () => setRows([...rows, emptyRow()]);

  // Delete
  const deleteRow = (id) =>
    setRows(rows.filter((row) => row.id !== id));

  // Change
  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Submit
  const handleSubmit = async () => {

    try {

      for (let row of rows) {

        const payload = { ...row };
        delete payload.id;

        await axios.post(
          "/public/cmtc-reports",
          payload
        );

      }

      setSuccess(true);

    } catch (err) {

      console.error(err);

    }

  };

  return (
  <Box p={3}>
    <Typography variant="h5" fontWeight="bold" mb={3}>
      CMTC Financial Report
    </Typography>

    <Stack direction="row" spacing={2} mb={3}>
      <Button variant="contained" startIcon={<Add />} onClick={addRow}>
        Add Row
      </Button>
      <Button variant="contained" color="success" startIcon={<Save />} onClick={handleSubmit}>
        Submit
      </Button>
    </Stack>
    {rows.map((row) => (
    <Paper key={row.id} sx={{ p: 3, mb: 3 }}>

    {/* BASIC INFO */}

    <Typography fontWeight="bold">Basic Info</Typography>
    <Divider sx={{ mb: 2 }}/>
    <Grid container spacing={2}>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="District" value={row.districtName}
        onChange={(e)=>handleChange(row.id,"districtName",e.target.value)}/>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Block" value={row.blockName}
        onChange={(e)=>handleChange(row.id,"blockName",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField type="date" fullWidth label="Establishment Date"
      InputLabelProps={{shrink:true}}
      value={row.cmtcEstablishmentDate}
      onChange={(e)=>handleChange(row.id,"cmtcEstablishmentDate",e.target.value)}/> 
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
      <TextField fullWidth label="CLF Name"
      value={row.clfName}
      onChange={(e)=>handleChange(row.id,"clfName",e.target.value)}/>
      </Grid>
    </Grid>


    {/* BANK INFO */}
    <Typography fontWeight="bold" mt={3}>Bank Info</Typography>
    <Divider sx={{ mb: 2 }}/>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
      <TextField label="Bank Name" fullWidth value={row.bankName}
      onChange={(e)=>handleChange(row.id,"bankName",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
      <TextField label="Mobile" fullWidth value={row.mobileNumber}
      onChange={(e)=>handleChange(row.id,"mobileNumber",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
      <TextField label="Account Name" fullWidth value={row.clfAccountName}
      onChange={(e)=>handleChange(row.id,"clfAccountName",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Account Number" fullWidth value={row.clfAccountNumber}
      onChange={(e)=>handleChange(row.id,"clfAccountNumber",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="IFSC" fullWidth value={row.ifscCode}
      onChange={(e)=>handleChange(row.id,"ifscCode",e.target.value)}/> 
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Holder Name" fullWidth value={row.accountHolderName}
      onChange={(e)=>handleChange(row.id,"accountHolderName",e.target.value)}/>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Designation" fullWidth value={row.accountHolderDesignation}
      onChange={(e)=>handleChange(row.id,"accountHolderDesignation",e.target.value)}/>
      </Grid>
    </Grid>


    {/* PAYMENTS */}
    <Typography fontWeight="bold" mt={3}>Payments</Typography>
    <Divider sx={{ mb: 2 }}/>
    <Grid container spacing={2}>

    <Grid size={{ xs: 12, md: 4 }}>
    <TextField label="Food Payment" type="number" fullWidth
    value={row.foodPaymentTotal}
    onChange={(e)=>handleChange(row.id,"foodPaymentTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField label="Material Payment" type="number" fullWidth
    value={row.materialPaymentTotal}
    onChange={(e)=>handleChange(row.id,"materialPaymentTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField label="Service Payment" type="number" fullWidth
    value={row.servicePaymentTotal}
    onChange={(e)=>handleChange(row.id,"servicePaymentTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Trainer Payment" type="number" fullWidth
    value={row.trainerPaymentTotal}
    onChange={(e)=>handleChange(row.id,"trainerPaymentTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Net Savings" type="number" fullWidth
    value={row.netSavingsTotal}
    onChange={(e)=>handleChange(row.id,"netSavingsTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Bank Balance" type="number" fullWidth
    value={row.bankAvailableAmount}
    onChange={(e)=>handleChange(row.id,"bankAvailableAmount",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="FD Details" fullWidth
    value={row.fdTotalDetails}
    onChange={(e)=>handleChange(row.id,"fdTotalDetails",e.target.value)}/>
    </Grid>
  </Grid>

  {/* ESTABLISHMENT */}
  <Typography fontWeight="bold" mt={3}>Establishment</Typography>
  <Divider sx={{ mb: 2 }}/>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 4 }}>
    <TextField label="Received" type="number" fullWidth
    value={row.establishmentReceivedTotal}
    onChange={(e)=>handleChange(row.id,"establishmentReceivedTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
    <TextField label="Expense" type="number" fullWidth
    value={row.establishmentExpenseTotal}
    onChange={(e)=>handleChange(row.id,"establishmentExpenseTotal",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
    <TextField label="Balance" type="number" fullWidth
    value={row.establishmentBalanceTotal}
    onChange={(e)=>handleChange(row.id,"establishmentBalanceTotal",e.target.value)}/>
    </Grid>
  </Grid>


  {/* SALARY */}
  <Typography fontWeight="bold" mt={3}>Salary</Typography>
  <Divider sx={{ mb: 2 }}/>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Manager Payment"
    value={row.managerTotalPayment} fullWidth
    onChange={(e)=>handleChange(row.id,"managerTotalPayment",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Accountant Payment"
    value={row.accountantTotalPayment} fullWidth
    onChange={(e)=>handleChange(row.id,"accountantTotalPayment",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Manager Regular"
    value={row.managerRegularPayment} fullWidth
    onChange={(e)=>handleChange(row.id,"managerRegularPayment",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Accountant Regular"
    value={row.accountantRegularPayment} fullWidth
    onChange={(e)=>handleChange(row.id,"accountantRegularPayment",e.target.value)}/>
    </Grid>
  </Grid>

  {/* REPORT */}
  <Typography fontWeight="bold" mt={3}>Report</Typography>
  <Divider sx={{ mb: 2 }}/>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Month"
    value={row.reportMonth} fullWidth
    onChange={(e)=>handleChange(row.id,"reportMonth",e.target.value)}/>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
    <TextField label="Year"
    value={row.reportYear} fullWidth
    onChange={(e)=>handleChange(row.id,"reportYear",e.target.value)}/>
    </Grid>
  </Grid>

  <IconButton color="error" onClick={()=>deleteRow(row.id)}>
  <Delete/>
  </IconButton>
  </Paper>
))}

<Snackbar open={success} autoHideDuration={3000}>
<Alert severity="success">
Saved Successfully
</Alert>
</Snackbar>
</Box>
);
}
