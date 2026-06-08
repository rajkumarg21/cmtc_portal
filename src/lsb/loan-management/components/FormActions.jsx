import { Stack, Button } from "@mui/material";

const FormActions = ({ onSubmit,loading, onReset, isReady }) => {
  return (
    <Stack direction="row" spacing={2}>
      <Button
        type="submit"
        variant="contained"
        // onClick={onSubmit}
        disabled={!isReady || loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </Button>

      <Button
        variant="outlined"
        onClick={onReset}
        disabled={loading}
      >
        Reset
      </Button>
    </Stack>
  );
};

export default FormActions;