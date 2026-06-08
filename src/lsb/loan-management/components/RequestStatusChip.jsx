import { Chip } from "@mui/material";

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "warning",
  },

  APPROVED: {
    label: "Approved",
    color: "success",
  },

  REJECTED: {
    label: "Rejected",
    color: "error",
  },

  PARTIAL_APPROVED: {
    label: "Partial Approved",
    color: "info",
  },

  IN_PROGRESS: {
    label: "In Progress",
    color: "primary",
  },

  PROCESSING: {
    label: "Processing",
    color: "secondary",
  },
};

const RequestStatusChip = ({
  status,
  size = "small",
  variant = "filled",
}) => {
  const config =
    statusConfig[status] || {
      label: status || "Unknown",
      color: "default",
    };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        minWidth: 110,
      }}
    />
  );
};

export default RequestStatusChip;