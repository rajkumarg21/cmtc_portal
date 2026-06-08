export const applyGeoConfigToForm = (config, loggedInUser, form) => {
  const updated = { ...form };

  // ✅ AUTO DISTRICT
  if (config.autoFillDistrict) {
    updated.districtId = loggedInUser?.districtId
      ? String(loggedInUser.districtId)
      : "";
    updated.districtName = loggedInUser?.districtName || "";

    updated.assignedDistrictId = updated.districtId;
    updated.assignedDistrictName = updated.districtName;
    
  }

  // ✅ AUTO BLOCK
  if (config.autoFillBlock) {
    updated.blockId = loggedInUser?.blockId
      ? String(loggedInUser.blockId)
      : "";
    updated.blockName = loggedInUser?.blockName || "";

    updated.assignedBlockId = updated.blockId;
    updated.assignedBlockName = updated.blockName;
  }

  // ✅ AUTO CENTER
  if (config.autoFillCenter) {
    updated.cmtcCenterId = loggedInUser?.cmtcCenterId
      ? String(loggedInUser.cmtcCenterId)
      : "";
    updated.cmtcCenterName = loggedInUser?.cmtcCenterName || "";

    updated.assignedCmtcCenterId = updated.cmtcCenterId;
    updated.assignedCmtcCenterName = updated.cmtcCenterName;
  }

  return updated;
};