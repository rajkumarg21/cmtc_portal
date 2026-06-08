import { useState } from "react";
import api from "../../../services/apiService";
import { toast } from "react-toastify";
import { useCaptcha } from "../../../hooks/useCaptcha";
import { useRegistrationValidation } from "./useRegistrationValidation";
import useBanks from "./useBanks";

const useRegistration = () => {

  const [currentStep, setCurrentStep] = useState(1);

  const [step1, setStep1] = useState({
    mobileNo: "",
    otp: "",
  });

  const [otpState, setOtpState] = useState({
    loading: false,
    sent: false,
    verified: false,
  });

  const [step2, setStep2] = useState({
    role: "",
    bankId: "",
  });

  const [step3, setStep3] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    title: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });

  const captcha = useCaptcha({
    isRequired: true,
    maxAttempts: 3,
    lockTime: 10,
  });

  const bankHook = useBanks();

  const {
    validateMobile,
  } = useRegistrationValidation();

  const goToStep = (step) => setCurrentStep(step);
  const nextStep = () => setCurrentStep((s) => s + 1);
  const prevStep = () => setCurrentStep((s) => s - 1);

  // ================= OTP =================
  const sendOtp = async () => {
    if (validateMobile(step1.mobileNo)) {
      toast.error(validateMobile(step1.mobileNo));
      return;
    }

    if (!captcha.validateCaptcha()) return;

    try {
      setOtpState((p) => ({ ...p, loading: true }));

      await api.post("/public/send-otp", {
        mobileNo: step1.mobileNo,
      });

      setOtpState({
        loading: false,
        sent: true,
        verified: false,
      });

      toast.success("OTP sent");
    } catch (e) {
      setOtpState((p) => ({ ...p, loading: false }));
      toast.error("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!step1.otp || step1.otp.length !== 6) {
      toast.error("Invalid OTP");
      return;
    }

    try {
      setOtpState((p) => ({ ...p, loading: true }));

      await api.post("/public/verify-otp", {
        mobileNo: step1.mobileNo,
        otp: step1.otp,
      });

      setOtpState({
        loading: false,
        sent: true,
        verified: true,
      });

      toast.success("OTP Verified");

      nextStep();
    } catch (e) {
      setOtpState((p) => ({ ...p, loading: false }));
      toast.error("Invalid OTP");
    }
  };

  // ================= FINAL PAYLOAD =================
  const buildPayload = () => ({
    mobileNo: step1.mobileNo,
    bankId: step2.bankId,
    role: step2.role,
    username: step3.username,
    password: step3.password,
    email: step3.email,
    fullName: `${step3.firstName} ${step3.lastName}`,
    title: step3.title,
    addressLine1: step3.addressLine1,
    addressLine2: step3.addressLine2,
    city: step3.city,
    postalCode: step3.postalCode,
  });

  const submitRegistration = async () => {
    try {
      const payload = buildPayload();

      await api.post("/bank-user/public/register", payload);

      toast.success("Registration submitted for approval");

      setCurrentStep(1); // reset flow if needed
      navigate("/lsb/login")
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Registration failed";

      toast.error(message);
    }
  };

  const actions = {
    setStep1,
    setStep2,
    setStep3,
    goToStep,
    nextStep,
    prevStep,
    sendOtp,
    verifyOtp,
    submitRegistration,
  };

  return {
    currentStep,
    step1,
    step2,
    step3,
    otpState,
    captcha,
    bankHook,
    actions,
    buildPayload,
  };
};

export default useRegistration;