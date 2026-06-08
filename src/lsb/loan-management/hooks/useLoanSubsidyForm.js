import { useState } from "react";
import { useForm } from "react-hook-form";
import { useExcelProcessor } from "./useExcelProcessor";
import api from "../../../services/apiService";
import { fileToBase64 } from "../utils/fileUtils";
import { useNavigate } from "react-router-dom";

export const useLoanSubsidyForm = () => {
  /* ================= FORM ================= */
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,  // add to validate
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      financialYear: "",
      quarter: "",
      totalShgRequested: "",
      totalLoanAmount: "",
    },
  });

  /* ================= EXCEL ================= */
  const {
    excelData,
    rows,
    headers,
    loading: excelLoading,
    error: excelError,
    shgCount,
    loanAmount,
    processFile,
  } = useExcelProcessor();

  /* ================= FILE STATE ================= */
  const [loanFile, setLoanFile] = useState(null);
  const [supportingFile, setSupportingFile] = useState(null);

  /* ================= MODALS ================= */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmPreviewOpen, setConfirmPreviewOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isPreviewViewed, setIsPreviewViewed] = useState(false);//
  const navigate = useNavigate();//

  /* ================= LOADING ================= */
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);//

  /* ================= WATCH FORM ================= */
  const formValues = watch();

  /* ================= FILE HANDLERS ================= */
  const handleLoanFileChange = async (e) => {
    console.log("loan file changed")
    const file = e.target.files[0];
    if (!file) return;

    setLoanFile(file);
    await processFile(file);
  };

  const handleSupportingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSupportingFile(file);
  };

  /* ================= DERIVED ================= */
  const isExcelReady = () => {
    return !excelLoading && !excelError && excelData.length > 0;
  };

  /* ================= PREVIEW ================= */
  const openPreview =  () => {
    if (!isExcelReady()) return;

     setIsPreviewViewed(true);//

    // check mismatch before preview
    if (
      Number(formValues.totalShgRequested) !== shgCount ||
      Number(formValues.totalLoanAmount) !== loanAmount
    ) {
      setConfirmPreviewOpen(true);
    } else {
      setPreviewOpen(true);
    }
  };

  const confirmPreviewWithExcel = () => {
    setValue("totalShgRequested", shgCount);
    setValue("totalLoanAmount", loanAmount);

    setConfirmPreviewOpen(false);
    setPreviewOpen(true);
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
      //   if (                         // add to validate empty field    
      //   !data.financialYear ||
      //   !data.quarter 
      
      // ) {
      //   return;
      // }
        // Validate all required fields before submit
      const isValid = await trigger([
        "financialYear",
        "quarter",
      ]);

      if (!isValid) return;
      
      if (!isPreviewViewed) {
      alert("Please preview Excel before submitting.");
      return;
      }

       
      // Stop submit if auto-fill not completed
        if (
          !formValues.totalShgRequested ||
          !formValues.totalLoanAmount
        ) {
          return;
        }

    if (!isExcelReady()) return;

    // mismatch check before submit
    if (
      Number(data.totalShgRequested) !== shgCount ||
      Number(data.totalLoanAmount) !== loanAmount
    ) {
      setSubmitConfirmOpen(true);
      return;
    }

    await finalSubmit(data);
  };

  const confirmSubmitWithExcel = async () => {
    setValue("totalShgRequested", shgCount);
    setValue("totalLoanAmount", loanAmount);

    const updatedData = {
      ...formValues,
      totalShgRequested: shgCount,
      totalLoanAmount: loanAmount,
    };

    setSubmitConfirmOpen(false);
    await finalSubmit(updatedData);
  };

  const finalSubmit = async (data) => {
    try {
      setSubmitting(true);

      // 🔹 Convert files to base64
      const loanFileBase64 = loanFile
        ? await fileToBase64(loanFile)
        : null;

      const supportingFileBase64 = supportingFile
        ? await fileToBase64(supportingFile)
        : null;

      // 🔹 Prepare payload (match backend DTO)
      const payload = {
        financialYear: data.financialYear,
        quarter: data.quarter,
        totalShgRequested: Number(data.totalShgRequested),
        totalLoanAmount: Number(data.totalLoanAmount),

        loanDetailsFileName: loanFile?.name,
        loanDetailsFileType: loanFile?.type,
        loanDetailsFileBase64: loanFileBase64,

        supportingDocName: supportingFile?.name,
        supportingDocType: supportingFile?.type,
        supportingDocBase64: supportingFileBase64,
      };

      console.log("FINAL PAYLOAD:", payload);

      // 🔹 API CALL
      const response = await api.post("/shg-loan-details/save",payload);

      console.log("SUCCESS:", response.data);

      // 🔹 Reset after success
      resetAll();
      setSuccessOpen(true);//

    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RESET ================= */
  const resetAll = () => {
    reset();
    setLoanFile(null);
    setSupportingFile(null);
  };

  const handleSuccessOk = () => {  // handle final submit
  setSuccessOpen(false);
  navigate("/lsb/loan-requests");
  };  

  return {
    /* form */
    control,
    handleSubmit,
    formValues,

    /* excel */
    excelData,
    rows,
    headers,
    excelLoading,
    excelError,
    shgCount,
    loanAmount,

    /* files */
    loanFile,
    supportingFile,

    /* actions */
    handleLoanFileChange,
    handleSupportingFileChange,
    openPreview,
    confirmPreviewWithExcel,

    /* submit */
    onSubmit,
    confirmSubmitWithExcel,
    submitting,

    /* modals */
    previewOpen,
    setPreviewOpen,
    confirmPreviewOpen,
    setConfirmPreviewOpen,
    submitConfirmOpen,
    setSubmitConfirmOpen,

    /* helpers */
    isExcelReady,
    resetAll,

     successOpen,   //
  handleSuccessOk,
  };
};