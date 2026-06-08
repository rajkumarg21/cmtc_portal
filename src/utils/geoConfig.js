export const getGeoConfig = (
  loggedInRole,
  selectedRole,
  USER_ROLES,
  CENTER_ROLES
) => {
  // ================================
  // DISTRICT LEVEL ROLES
  // ================================
  const DISTRICT_LEVEL_ROLES = [
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.AUDITOR,
    USER_ROLES.AUDIT_ACCOUNTANT,
    USER_ROLES.MISSION_STAFF,
  ];

  // ================================
  // DISTRICT CREATION (ADMIN / ZONAL)
  // ================================
  if (
    (loggedInRole === USER_ROLES.ZONAL_HEAD ||
      loggedInRole === USER_ROLES.PORTAL_ADMIN) &&
    DISTRICT_LEVEL_ROLES.includes(selectedRole)
  ) {
    return {
      type: "DISTRICT",
      showDistrict: true,
      showBlock: false,
      showCenter: false,
    };
  }

  // ================================
  // DISTRICT CREATION (DISTRICT OFFICER)
  // ================================
  if (
    loggedInRole === USER_ROLES.DISTRICT_OFFICER &&
    [
      USER_ROLES.AUDITOR,
      USER_ROLES.AUDIT_ACCOUNTANT,
      USER_ROLES.MISSION_STAFF,
    ].includes(selectedRole)
  ) {
    return {
      type: "DISTRICT",
      showDistrict: false, // ❗ no dropdown
      showBlock: false,
      showCenter: false,
    };
  }

  // ================================
  // BLOCK OFFICER CREATION
  // ================================
  if (
    ((loggedInRole === USER_ROLES.ZONAL_HEAD ||
      loggedInRole === USER_ROLES.PORTAL_ADMIN) &&
      selectedRole === USER_ROLES.BLOCK_OFFICER) ||
    (loggedInRole === USER_ROLES.DISTRICT_OFFICER &&
      selectedRole === USER_ROLES.BLOCK_OFFICER)
  ) {
    return {
      type: "BLOCK",
      showDistrict:
        loggedInRole === USER_ROLES.ZONAL_HEAD ||
        loggedInRole === USER_ROLES.PORTAL_ADMIN,
      showBlock: true,
      showCenter: false,
    };
  }

  // ================================
  // CENTER ROLES (CMTC)
  // ================================
  if (CENTER_ROLES.includes(selectedRole)) {
    return {
      type: "CENTER",
      showDistrict:
        loggedInRole === USER_ROLES.ZONAL_HEAD ||
        loggedInRole === USER_ROLES.PORTAL_ADMIN,
      showBlock: true,
      showCenter: true,
    };
  }

  // ================================
  // CMTC MANAGER → STAFF AUTO ASSIGN
  // ================================
  if (
    loggedInRole === USER_ROLES.CMTC_MANAGER &&
    selectedRole === USER_ROLES.CMTC_STAFF
  ) {
    return {
      type: "AUTO_CENTER",
      autoAssignCenter: true,
    };
  }

  // ================================
  // DEFAULT
  // ================================
  return {
    type: "NONE",
    showDistrict: false,
    showBlock: false,
    showCenter: false,
  };
};