import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const ViewTypeSelector = ({ value, onChange }) => {
  return (
    <FormControl size="small" fullWidth>
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