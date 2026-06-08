import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";

const AssessmentCycleDropdown = ({
  cycles = [],
  loading = false,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <FormControl
      size="small"
      fullWidth
      disabled={disabled}
    >
      <InputLabel id="cycle-label">
        Select Cycle
      </InputLabel>

      <Select
        labelId="cycle-label"
        value={value || ""}
        label="Select Cycle"
        onChange={(e) => {
          const selected = cycles.find(
            (c) => c.id === e.target.value
          );
          onChange(selected || null);
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>

        {loading && (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} />
              Loading...
            </Box>
          </MenuItem>
        )}

        {cycles.map((cycle) => (
          <MenuItem key={cycle.id} value={cycle.id}>
            {cycle.cycleYear} - {cycle.periodLabel} (
            {cycle.frequency})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AssessmentCycleDropdown;