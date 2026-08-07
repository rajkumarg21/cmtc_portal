// src/shared/hooks/useAssessment.js

import { useEffect, useMemo, useState } from "react";
import {
  CycleCategory,
  CycleType,
  AssessmentType,
} from "../constants/assessmentConstants";
import { AUDIT_ROLES, USER_ROLES } from "../../../utils/constants";

const useAssessment = (initialCategory = null, userRole = null) => {
  const [cycleCategory, setCycleCategory] = useState(
    initialCategory
  );
  const [viewType, setViewType] = useState("");

  const [cycleType, setCycleType] = useState(null);

  // Helpers
  const isInternal = cycleType === CycleType.INTERNAL;
  const isExternal = cycleType === CycleType.EXTERNAL;
  const isGrading = cycleCategory === CycleCategory.GRADING;
  const isAudit = cycleCategory === CycleCategory.AUDIT;
  
  const canModifyViewType = !AUDIT_ROLES.includes(userRole);
  
  useEffect(() => {
    if (cycleType === CycleType.EXTERNAL) {
      setViewType("ASSIGNED"); // default
    } else {
      setViewType("");
    }
  }, [cycleType]);

  // 🔥 Derived Assessment Type
  const assessmentType = useMemo(() => {
    if (!cycleCategory || !cycleType) return null;

    if (cycleCategory === CycleCategory.GRADING) {
      return cycleType === CycleType.INTERNAL
        ? AssessmentType.INTERNAL_GRADING
        : AssessmentType.EXTERNAL_GRADING;
    }

    if (cycleCategory === CycleCategory.AUDIT) {
      return cycleType === CycleType.INTERNAL
        ? AssessmentType.INTERNAL_AUDIT
        : AssessmentType.EXTERNAL_AUDIT;
    }

    return null;
  }, [cycleCategory, cycleType]);


  // Reset Function (important when switching pages)
  const resetAssessment = () => {
    setCycleCategory(null);
    setCycleType(null);
  };



  return {
    cycleCategory,
    setCycleCategory,
    cycleType,
    setCycleType,
    assessmentType,
    isInternal,
    isExternal,
    isGrading,
    isAudit,
    resetAssessment,
    viewType,
    setViewType,
    canModifyViewType,

  };
};

export default useAssessment;