import { useState, useRef } from "react";
import { toast } from "react-toastify";

export const useCaptcha = (isRequired = true) => {
  const [captchaInput, setCaptchaInput] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const captchaRef = useRef(null);

  // ✅ Sanitizer (consistent everywhere)
  const sanitizeCaptcha = (value) =>
    value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);

  const handleCaptchaChange = (value) => {
    setCaptchaInput(sanitizeCaptcha(value));
  };

  const validateCaptcha = () => {
    if (!isRequired) return true;

    const user = captchaInput.trim().toUpperCase();
    const actual = generatedCaptcha.trim().toUpperCase();

    if (!user) {
      toast.error("Captcha is required");
      return false;
    }

    if (user !== actual) {
      toast.error("Captcha does not match");
      resetCaptcha();
      return false;
    }

    return true;
  };

  const resetCaptcha = () => {
    setCaptchaInput("");
    captchaRef.current?.refreshCaptcha();
  };

  return {
    captchaInput,
    setGeneratedCaptcha,
    handleCaptchaChange,
    validateCaptcha,
    captchaRef,
    resetCaptcha
  };
};