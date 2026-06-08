// loan-management/config/loanRequestPermissions.js

import { USER_ROLES } from "../../../utils/constants";

export const LOAN_REQUEST_PERMISSIONS =
{
  [USER_ROLES.LSB_BANK_MAKER]: {
    readOnly: true,

    showBulkApprove: false,
    showBulkReject: false,

    showApproveButton: false,
    showRejectButton: false,

    allowRowSelection: false,
     // allowed statuses tO BULK APPROVED BUTTON ENABLE DISABLE
    allowedStatuses: [],
  },

  [USER_ROLES.LSB_BANK_CHECKER]:
    {
      readOnly: true,

      showBulkApprove: true,
      showBulkReject: true,

      showApproveButton: false,
      showRejectButton: false,

      allowRowSelection: true,
       // enable bulk approve only
      // for these status
      allowedStatuses: [
        "SUBMITTED_BY_BANK_MAKER",
      ],
    },

  [USER_ROLES.LSB_NODAL_MAKER]:
    {
      readOnly: true,

      showBulkApprove: true,
      showBulkReject: false,

      showApproveButton: false,
      showRejectButton: false,

      allowRowSelection: true,
      allowedStatuses: [
        "APPROVED_BY_BANK_CHECKER",
      ],
    },

  [USER_ROLES.LSB_NODAL_CHECKER]:
    {
      readOnly: false,

      showBulkApprove: true,
      showBulkReject: false,

      showApproveButton: false,
      showRejectButton: false,

      allowRowSelection: true,
      allowedStatuses: [
        "APPROVED_BY_NODAL_MAKER",
      ],
    },

  [USER_ROLES.LSB_ADMIN]: {
    readOnly: true,

    showBulkApprove: true,
    showBulkReject: false,

    showApproveButton: false,
    showRejectButton: false,

    allowRowSelection: false,
    allowedStatuses: [
      "APPROVED_BY_NODAL_CHECKER",
    ],
  },
};

export const getLoanRequestPermissions =
  (role) => {
    return (
      LOAN_REQUEST_PERMISSIONS[
        role
      ] ||
      {
        readOnly: true,

        showBulkApprove: false,
        showBulkReject: false,

        showApproveButton: false,
        showRejectButton: false,

        allowRowSelection: false,
        allowedStatuses: [],
      }
    );
  };