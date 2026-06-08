export const getResetUserFormData = (availableRoles = []) => ({
  username: "",
  email: "",
  fullName: "",
  originalDesignation: "",
  role: availableRoles?.[0] || "",
  password: "",
  enabled: true,
  mobileNo: "",

  districtId: "",
  districtName: "",
  blockId: "",
  blockName: "",
  cmtcCenterId: "",
  cmtcCenterName: "",

  assignedDistrictId: "",
  assignedDistrictName: "",
  assignedBlockId: "",
  assignedBlockName: "",
  assignedCmtcCenterId: "",
  assignedCmtcCenterName: "",
});