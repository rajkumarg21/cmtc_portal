import { useMemo } from "react";
import { USER_ROLES } from "../../utils/constants";

export const useUserRoleUniqueness = ({
  users,
  isEditing,
  id,
  formData,
}) => {
  const activeUsersExcludingCurrent = useMemo(() => {
    const currentId = isEditing ? String(id) : null;

    return (users || []).filter((u) => {
      if (!u) return false;

      const isSame = currentId && String(u.id) === currentId;

      return Boolean(u.enabled) && !isSame;
    });
  }, [users, isEditing, id]);

  const checkRoleUniquenessRules = () => {
    const role = formData.role;

    const districtId =
      formData.districtId || formData.assignedDistrictId;

    const blockId =
      formData.blockId || formData.assignedBlockId;

    const centerId =
      formData.cmtcCenterId || formData.assignedCmtcCenterId;

    const actives = activeUsersExcludingCurrent;

    if (role === USER_ROLES.DISTRICT_OFFICER) {
      if (!districtId) return null;

      const exists = actives.some(
        (u) =>
          u.role === USER_ROLES.DISTRICT_OFFICER &&
          String(u.districtId) === String(districtId)
      );

      if (exists)
        return "An ACTIVE District Officer already exists for this district.";
    }

    if (role === USER_ROLES.BLOCK_OFFICER) {
      if (!blockId) return null;

      const exists = actives.some(
        (u) =>
          u.role === USER_ROLES.BLOCK_OFFICER &&
          String(u.blockId) === String(blockId)
      );

      if (exists)
        return "An ACTIVE Block Officer already exists for this block.";
    }

    if (role === USER_ROLES.CMTC_MANAGER) {
      if (!centerId) return null;

      const exists = actives.some(
        (u) =>
          u.role === USER_ROLES.CMTC_MANAGER &&
          String(u.cmtcCenterId) === String(centerId)
      );

      if (exists)
        return "An ACTIVE CMTC Manager already exists for this CMTC Center.";
    }

    if (role === USER_ROLES.CMTC_STAFF) {
      if (!centerId) return null;

      const count = actives.filter(
        (u) =>
          u.role === USER_ROLES.CMTC_STAFF &&
          String(u.cmtcCenterId) === String(centerId)
      ).length;

      if (count >= 3)
        return "Maximum 3 ACTIVE CMTC Staff are allowed for this CMTC Center.";
    }

    return null;
  };

  return {
    checkRoleUniquenessRules,
  };
};