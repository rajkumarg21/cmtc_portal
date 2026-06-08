import { Button, Stack } from "@mui/material";

const UserActions = ({ user, onApprove, onReject }) => {
  if (user.status !== 0) return null; // only pending

  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="contained"
        color="success"
        onClick={() => onApprove(user.id)}
      >
        Approve
      </Button>

      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={() => onReject(user.id)}
      >
        Reject
      </Button>
    </Stack>
  );
};

export default UserActions;