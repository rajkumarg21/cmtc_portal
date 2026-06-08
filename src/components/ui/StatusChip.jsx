import React from 'react';
import { Chip } from '@mui/material';
import { CONTENT_STATUS } from '../../utils/constants'; // adjust path as needed

const StatusChip = ({ status, size = 'small' }) => {
  const getChipProps = (status) => {
    switch (status) {
      case CONTENT_STATUS.PUBLISHED:
        return { label: 'Published', color: 'success' };
      case CONTENT_STATUS.PENDING_APPROVAL:
        return { label: 'Pending Approval', color: 'warning' };
      case CONTENT_STATUS.REJECTED:
        return { label: 'Rejected', color: 'error' };
      case CONTENT_STATUS.DRAFT:
        return { label: 'Draft', color: 'default' };
      case CONTENT_STATUS.ARCHIVED:
        return { label: 'Archived', color: 'default' };
      default:
        return { label: status, color: 'default' };
    }
  };

  return <Chip {...getChipProps(status)} size={size} />;
};

export default StatusChip;
