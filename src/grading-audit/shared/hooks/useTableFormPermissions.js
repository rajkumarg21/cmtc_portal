import { useAuth } from "../../../context/AuthContext";
import { USER_ROLES } from "../../../utils/constants";

const useTableFormPermissions = () => {
  const { user } = useAuth();

  const getBasePermissions = (status, parentReadOnly = false) => {
    const isSubmitted = status === "SUBMITTED";

    const isAssessmentClosed =
      status === "CLOSED";
    const editableStatuses = ["OPEN","DRAFT"]; // future: ["OPEN", "REOPENED"]
    // const editableStatuses = ["OPEN"]; // future: ["OPEN", "REOPENED"]
    const isEditableStatus = editableStatuses.includes(status);

     const readOnly =
        parentReadOnly ||
        !isEditableStatus ||
        isAssessmentClosed;
    return {
      status,
      isSubmitted,
      isEditableStatus,
      readOnly,
    };
  };

  // 🔴 Audit
  const getAuditPermissions = (center, context = {}) => {
    const base = getBasePermissions(
      center.assessmentStatus,
      context.parentReadOnly
    );

    const auditSubmitRoles = [
      USER_ROLES.MISSION_STAFF,
    ];

    const canSubmit =
      auditSubmitRoles.includes(user?.role) &&
      base.isEditableStatus &&
      !base.readOnly;

    const canEdit = canSubmit; // 🔥 single source
    const readOnly = !canEdit;

    return {
      ...base,
      canSubmit,
      canEdit,
      readOnly,
    };
  };

  // 🟢 Grading
  const getGradingPermissions = (center, context = {}) => {
    const base = getBasePermissions(
      center.assessmentStatus,
      context.parentReadOnly
    );

    const gradingSubmitRoles = [
      USER_ROLES.DISTRICT_OFFICER,
    ];

    const canSubmit =
      gradingSubmitRoles.includes(user?.role) &&
      base.isEditableStatus &&
      !base.parentReadOnly;

    const canEdit = canSubmit;
    const readOnly = !canEdit;

    return {
      ...base,
      canSubmit,
      canEdit,
      readOnly,
    };
  };

  return {
    getAuditPermissions,
    getGradingPermissions,
  };
};

export default useTableFormPermissions;