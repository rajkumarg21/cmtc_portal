import { useState, useEffect } from "react";

export const useAssessmentForm = (data) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!data) return;

    setForm({
      ...data,
      cycleId: data.cycleId,
      centerId: data.centerId,
      questions: data.questions.map(q => ({
        ...q,
        obtainedMarks: q.obtainedMarks ?? "",
        remark: q.remark ?? ""
      }))
    });
  }, [data]);

  const updateField = (questionId, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.questionId !== questionId) return q;

        // 🔒 Apply validation only for marks
        if (field === "obtainedMarks") {
          if (value === "") {
            return { ...q, obtainedMarks: "" };
          }

          let numericValue = Number(value);

          // Prevent negative
          if (numericValue < 0) return q;

          // Prevent exceeding maxMarks
          if (q.maxMarks !== undefined && numericValue > q.maxMarks) {
            return q; // block update
          }

          return { ...q, obtainedMarks: numericValue };
        }

        // Default behavior for other fields
        return { ...q, [field]: value };
      })
    }));
  };

const validate = () => {
  const errors = [];

  form.questions.forEach(q => {
    // if (q.maxMarks == null) return;

    if (q.obtainedMarks === "" || q.obtainedMarks === null) {
      errors.push({
        questionId: q.questionId,
        message: "Marks required"
      });
      return;
    }

    const marks = Number(q.obtainedMarks);

    if (isNaN(marks)) {
      errors.push({
        questionId: q.questionId,
        message: "Invalid number"
      });
      return;
    }

    if (marks < 0) {
      errors.push({
        questionId: q.questionId,
        message: "Cannot be negative"
      });
      return;
    }

    if (marks > q.maxMarks) {
      errors.push({
        questionId: q.questionTextHi,
        message: `Max allowed is ${q.maxMarks}`
      });
    }
  });

  return errors;
};
  const buildPayload = (status) => ({
    assessmentId: form.assessmentId,
    cycleId: data.cycleId,
    centerId: data.centerId,

    status,
    questions: form.questions.map(q => ({
      questionId: q.questionId,
      obtainedMarks: q.obtainedMarks,
      remark: q.remark,
      issueObserved : q.issueObserved,
      correctionDone : q.correctionDone,
      qualityRemark : q.qualityRemark
    }))
  });

  return { form, updateField, validate, buildPayload };
};