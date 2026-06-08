import { Chip } from "@mui/material";

const UserStatusChip = ({ status }) => {
  const map = {
    0: { label: "Pending", color: "warning" },
    1: { label: "Approved", color: "success" },
    2: { label: "Rejected", color: "error" },
  };

  const config = map[status] || { label: "Unknown", color: "default" };

  return <Chip label={config.label} color={config.color} size="small" />;
};

export default UserStatusChip;