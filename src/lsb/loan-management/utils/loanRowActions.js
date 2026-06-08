// loan-management/utils/loanRowActions.js

import { USER_ROLES } from "../../../utils/constants";

const ROLE_ALLOWED_STATUSES = {

  [USER_ROLES.LSB_BANK_CHECKER]: [
    "SUBMITTED_BY_BANK_MAKER",
  ],

  [USER_ROLES.LSB_NODAL_MAKER]: [
    "APPROVED_BY_BANK_CHECKER",
  ],

  [USER_ROLES.LSB_NODAL_CHECKER]: [
    "APPROVED_BY_NODAL_MAKER",
  ],

  [USER_ROLES.LSB_ADMIN]: [
    "APPROVED_BY_NODAL_CHECKER",
  ],
};

export const canProcessLoanRow = (
  role,
  status
) => {

  const allowedStatuses =
    ROLE_ALLOWED_STATUSES[
      role
    ] || [];

  return allowedStatuses.includes(
    status
  );
};