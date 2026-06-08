import { useState } from "react";
import {
  getAssessmentForm,
  submitAssessment
} from "../services/assessmentService";

export const useAssessmentApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchForm = async (params) => {
    try {
      setLoading(true);
      setError("");
      const res = await getAssessmentForm(params);
      return res;
    } catch (err) {
      setError("Failed to load form");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const save = async (payload) => {
    return submitAssessment(payload);
  };

  return { loading, error, fetchForm, save };
};