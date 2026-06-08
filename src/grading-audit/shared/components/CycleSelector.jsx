import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { CycleType } from "../constants/assessmentConstants";

/**
 * Shared Cycle Type Selector
 * - Modern dropdown
 * - Default: none selected
 * - Used in Grading & Audit
 */
const CycleTypeSelector = ({ value, onChange }) => {
  return (
    <FormControl size="small" fullWidth >
      <InputLabel id="cycle-type-label">
        Select Type
      </InputLabel>

      <Select
        labelId="cycle-type-label"
        value={value || ""}
        label="Select Cycle Type"
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
      >
        {/* Optional empty state */}
        <MenuItem value={null}>
          <em>None</em>
        </MenuItem>

        <MenuItem value={CycleType.INTERNAL}>
          Internal
        </MenuItem>

        <MenuItem value={CycleType.EXTERNAL}>
          External
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default CycleTypeSelector;