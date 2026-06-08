import { Grid, TextField, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { getCurrentPreviousFinancialYears } from "../../../services/financialYearService";

// const years = ["2023-24", "2024-25", "2025-26"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];

const BasicDetailsSection = ({ control }) => {
  const [financialYears, setFinancialYears] = useState([]);

  const fetchFinancialYears = async () => {
    try {
      console.log("before api call");
      const data = await getCurrentPreviousFinancialYears();
      console.log("after api call");
      console.log("financial years", data);

      setFinancialYears(data);
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  return (
    <Grid container spacing={2}>
      {/* Financial Year */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <Controller
          name="financialYear"
          control={control}
          rules={{ required: "Financial Year is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
               value={field.value || ""}   // add to validate empty field
              select
              label="Financial Year"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {financialYears.map((year) => (
                <MenuItem key={year.id} value={year.financialYear}>
                  {year.financialYear}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      {/* Quarter */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <Controller
          name="quarter"
          control={control}
          rules={{ required: "Quarter is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              value={field.value || ""} // add to validate empty field
              select
              label="Quarter"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {quarters.map((q) => (
                <MenuItem key={q} value={q}>
                  {q}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      {/* Total SHG */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <Controller
          name="totalShgRequested"
          control={control}
          rules={{ required: "Total SHG is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Total SHG Requested"
              fullWidth
              type="number"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
          disabled
        />
      </Grid>

      {/* Loan Amount */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <Controller
          name="totalLoanAmount"
          control={control}
          rules={{ required: "Loan Amount is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Total Loan Amount"
              fullWidth
              type="number"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
          disabled
        />
      </Grid>
    </Grid>
  );
};

export default BasicDetailsSection;
