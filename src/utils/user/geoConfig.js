export const getGeoConfig = (
  loggedInRole,
  selectedRole,
  USER_ROLES,
  CENTER_ROLES
) => {
  const isAdmin = loggedInRole === USER_ROLES.PORTAL_ADMIN;
  const isZonal = loggedInRole === USER_ROLES.ZONAL_HEAD;
  const isDistrict = loggedInRole === USER_ROLES.DISTRICT_OFFICER;
  const isBlock = loggedInRole === USER_ROLES.BLOCK_OFFICER;
  const isCenter = loggedInRole === USER_ROLES.CMTC_MANAGER;

  const isAdminOrZonal = isAdmin || isZonal;

  // 🔥 Dynamic disable rules (based on logged-in role)
  const disableDistrict = isDistrict || isBlock || isCenter;
  const disableBlock = isBlock || isCenter;
  const disableCenter = isCenter;

  /**
   * ------------------------------------------------------------
   * 🟡 DISTRICT LEVEL ROLES
   * ------------------------------------------------------------
   */
  const DISTRICT_LEVEL_ROLES = [
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.AUDITOR,
    USER_ROLES.AUDIT_ACCOUNTANT,
    USER_ROLES.MISSION_STAFF,
  ];

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 1: ADMIN / ZONAL → DISTRICT LEVEL USER
   * ------------------------------------------------------------
   */
  if (isAdminOrZonal && DISTRICT_LEVEL_ROLES.includes(selectedRole)) {
    return {
      type: "DISTRICT",

      showDistrict: true,
      showBlock: false,
      showCenter: false,

      disableDistrict: false,
      disableBlock: true,
      disableCenter: true,

      autoFillDistrict: false,
      autoFillBlock: false,
      autoFillCenter: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 2: DISTRICT OFFICER → DISTRICT LEVEL USER
   * ------------------------------------------------------------
   */
  if (
    isDistrict &&
    DISTRICT_LEVEL_ROLES.includes(selectedRole)
  ) {
    return {
      type: "DISTRICT",

      showDistrict: true,
      showBlock: false,
      showCenter: false,

      disableDistrict,
      disableBlock: true,
      disableCenter: true,

      autoFillDistrict: true,
      autoFillBlock: false,
      autoFillCenter: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 3: BLOCK OFFICER CREATION
   * ------------------------------------------------------------
   */
  if (
    ((isAdminOrZonal && selectedRole === USER_ROLES.BLOCK_OFFICER) ||
      (isDistrict && selectedRole === USER_ROLES.BLOCK_OFFICER))
  ) {
    return {
      type: "BLOCK",

      showDistrict: true,
      showBlock: true,
      showCenter: false,

      disableDistrict,
      disableBlock: false,
      disableCenter: true,

      autoFillDistrict: disableDistrict,
      autoFillBlock: false,
      autoFillCenter: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 4: BLOCK OFFICER → CENTER LEVEL USER
   * ------------------------------------------------------------
   */
  if (
    isBlock &&
    CENTER_ROLES.includes(selectedRole)
  ) {
    return {
      type: "CENTER",

      showDistrict: true,
      showBlock: true,
      showCenter: true,

      disableDistrict,
      disableBlock,
      disableCenter: false,

      autoFillDistrict: true,
      autoFillBlock: true,
      autoFillCenter: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 5: CENTER LEVEL ROLES (ADMIN / DISTRICT)
   * ------------------------------------------------------------
   */
  if (CENTER_ROLES.includes(selectedRole)) {
    return {
      type: "CENTER",

      showDistrict: true,
      showBlock: true,
      showCenter: true,

      disableDistrict,
      disableBlock,
      disableCenter,

      autoFillDistrict: disableDistrict,
      autoFillBlock: disableBlock,
      autoFillCenter: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🟢 CASE 6: CMTC MANAGER → STAFF (AUTO ASSIGN)
   * ------------------------------------------------------------
   */
  if (
    isCenter &&
    selectedRole === USER_ROLES.CMTC_STAFF
  ) {
    return {
      type: "AUTO_CENTER",

      showDistrict: false,
      showBlock: false,
      showCenter: false,

      disableDistrict: true,
      disableBlock: true,
      disableCenter: true,

      autoFillDistrict: true,
      autoFillBlock: true,
      autoFillCenter: true,
    };
  }

  /**
   * ------------------------------------------------------------
   * 🔴 DEFAULT CASE
   * ------------------------------------------------------------
   */
  return {
    type: "NONE",

    showDistrict: false,
    showBlock: false,
    showCenter: false,

    disableDistrict: true,
    disableBlock: true,
    disableCenter: true,

    autoFillDistrict: false,
    autoFillBlock: false,
    autoFillCenter: false,
  };
};