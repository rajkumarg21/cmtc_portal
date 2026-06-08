import { useCallback, useMemo } from "react";

export const useUserPermissions = ({
  loggedInUser,
  hasRole,
  USER_ROLES,
}) => {

  // =========================
  // 1. DETECT LOGGED IN ROLE
  // =========================
  const loggedInRole = useMemo(() => {
    if (hasRole([USER_ROLES.PORTAL_ADMIN])) return USER_ROLES.PORTAL_ADMIN;
    if (hasRole([USER_ROLES.ZONAL_HEAD])) return USER_ROLES.ZONAL_HEAD;
    if (hasRole([USER_ROLES.DISTRICT_OFFICER])) return USER_ROLES.DISTRICT_OFFICER;
    if (hasRole([USER_ROLES.BLOCK_OFFICER])) return USER_ROLES.BLOCK_OFFICER;
    if (hasRole([USER_ROLES.CMTC_MANAGER])) return USER_ROLES.CMTC_MANAGER;
    if (hasRole([USER_ROLES.CMTC_STAFF])) return USER_ROLES.CMTC_STAFF;
    return null;
  }, [hasRole, USER_ROLES]);

  // =========================
  // 2. ROLE LEVEL MAP (SOURCE OF TRUTH)
  // =========================
  const roleLevel = useMemo(() => ({
    [USER_ROLES.PORTAL_ADMIN]: 1,
    [USER_ROLES.ZONAL_HEAD]: 2,
    [USER_ROLES.DISTRICT_OFFICER]: 3,
    [USER_ROLES.BLOCK_OFFICER]: 4,
    [USER_ROLES.CMTC_MANAGER]: 5,
    [USER_ROLES.CMTC_STAFF]: 6,
  }), [USER_ROLES]);

  // =========================
  // 3. CAN MODIFY USER (MAIN PERMISSION ENGINE)
  // =========================
  const canModifyUser = useCallback(
    (targetUser) => {
      if (!loggedInUser || !targetUser || !loggedInRole) return false;

      // can't modify self
      if (String(loggedInUser.id) === String(targetUser.id)) return false;

      // admin full access
      if (loggedInRole === USER_ROLES.PORTAL_ADMIN) return true;

      // zonal head: everything except admin
      if (
        loggedInRole === USER_ROLES.ZONAL_HEAD &&
        targetUser.role !== USER_ROLES.PORTAL_ADMIN
      ) return true;

      const loggedLevel = roleLevel[loggedInRole];
      const targetLevel = roleLevel[targetUser.role];

      // higher/equal role cannot be modified
      if (!loggedLevel || !targetLevel) return false;
      if (loggedLevel >= targetLevel) return false;

      // =========================
      // 4. HIERARCHY SCOPE CHECK
      // =========================
      switch (loggedInRole) {

        case USER_ROLES.DISTRICT_OFFICER:
          return (
            String(targetUser.districtId) === String(loggedInUser?.districtId) ||
            String(targetUser.assignedDistrictId) === String(loggedInUser?.districtId)
          );

        case USER_ROLES.BLOCK_OFFICER:
          return (
            String(targetUser.blockId) === String(loggedInUser?.blockId) ||
            String(targetUser.assignedBlockId) === String(loggedInUser?.blockId)
          );

        case USER_ROLES.CMTC_MANAGER:
          return (
            String(targetUser.cmtcCenterId) === String(loggedInUser?.cmtcCenterId) ||
            String(targetUser.assignedCmtcCenterId) === String(loggedInUser?.cmtcCenterId)
          );

        default:
          return false;
      }
    },
    [loggedInUser, loggedInRole, roleLevel, USER_ROLES]
  );

  // =========================
  // 5. CAN CREATE USER (NEW ADDITION)
  // =========================
  const canCreateUser = useCallback(
    (targetRole) => {
      if (!loggedInRole) return false;

      if (loggedInRole === USER_ROLES.PORTAL_ADMIN) return true;

      if (loggedInRole === USER_ROLES.ZONAL_HEAD) {
        return targetRole !== USER_ROLES.PORTAL_ADMIN;
      }

      const loggedLevel = roleLevel[loggedInRole];
      const targetLevel = roleLevel[targetRole];

      return loggedLevel < targetLevel;
    },
    [loggedInRole, roleLevel, USER_ROLES]
  );

  // =========================
  // 6. CAN VIEW USER (OPTIONAL BUT USEFUL)
  // =========================
  const canViewUser = useCallback(
    (targetUser) => {
      if (!loggedInUser || !targetUser || !loggedInRole) return false;

      if (loggedInRole === USER_ROLES.PORTAL_ADMIN) return true;

      if (loggedInRole === USER_ROLES.ZONAL_HEAD) {
        return targetUser.role !== USER_ROLES.PORTAL_ADMIN;
      }

      // default same hierarchy scope rule
      return true;
    },
    [loggedInUser, loggedInRole, USER_ROLES]
  );

  // =========================
  // RETURN API
  // =========================
  return {
    loggedInRole,
    canModifyUser,
    canCreateUser,
    canViewUser,
  };
};