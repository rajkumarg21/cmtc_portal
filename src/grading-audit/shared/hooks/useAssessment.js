// src/shared/hooks/useAssessment.js

import { useEffect, useMemo, useState } from "react";
import {
  CycleCategory,
  CycleType,
  AssessmentType,
} from "../constants/assessmentConstants";

const useAssessment = (initialCategory = null) => {
  const [cycleCategory, setCycleCategory] = useState(
    initialCategory
  );
  const [viewType, setViewType] = useState("");

  const [cycleType, setCycleType] = useState(null);

  useEffect(() => {
    if (cycleType === CycleType.EXTERNAL) {
      setViewType("SELF"); // default
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

  // Helpers
  const isInternal = cycleType === CycleType.INTERNAL;
  const isExternal = cycleType === CycleType.EXTERNAL;
  const isGrading = cycleCategory === CycleCategory.GRADING;
  const isAudit = cycleCategory === CycleCategory.AUDIT;

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

  };
};

export default useAssessment;