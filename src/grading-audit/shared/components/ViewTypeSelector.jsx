import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const ViewTypeSelector = ({ value, onChange, disabled }) => {
  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <InputLabel id="view-type-label">
        View Type
      </InputLabel>

      <Select
        labelId="view-type-label"
        value={value || ""}
        label="View Type"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="SELF">
          My District
        </MenuItem>

        <MenuItem value="ASSIGNED">
          Assigned District
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default ViewTypeSelector;