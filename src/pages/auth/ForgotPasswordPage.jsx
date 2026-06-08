import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  sendOtp,
  sendOtpForgotPassword,
  verifyResetOtp,
} from "../../services/otpService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPassword } from "../../services/authService";
import { useTranslation } from "react-i18next";
import { MESSAGES } from "../../constants/messages";
import { ROUTES } from "../../constants/routes";
import { validatePassword, isSafeRoute } from "../../utils/security";
import Captcha from "../../components/common/Captcha"; // adjust path
import { useCaptcha } from "../../hooks/useCaptcha";

const ForgotPasswordWithOtp = () => {
  const { t} = useTranslation();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const {
    captchaInput,
    setGeneratedCaptcha,
    handleCaptchaChange,
    validateCaptcha,
    resetCaptcha,
    captchaRef,
    isLocked,
    failedAttempts,
  } = useCaptcha({
    isRequired: true,
    maxAttempts: 3,
    lockTime: 10,
  });

  const navigate = useNavigate();

  // ✅ Sanitizers
  const sanitizeMobile = (value) => value.replace(/\D/g, "").slice(0, 10);
  const sanitizeOtp = (value) => value.replace(/\D/g, "").slice(0, 6);

  /* STEP 1 */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const mobileRegex = /^[6-9]\d{9}$/;

    if (!mobileRegex.test(mobile)) {
      toast.error(MESSAGES.INVALID_MOBILE);
      return;
    }

    // 🔐 Validate captcha BEFORE API call
    if (!validateCaptcha()) {
      return;
    }
    try {
      setLoading(true);
      const res = await sendOtpForgotPassword(mobile);
      toast.success(res || "OTP sent successfully");
      setStep(2);
    } catch (err) {
      toast.error(getErrorMessage(err));
      // 🔐 Refresh captcha on API failure
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2 */
  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Invalid OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyResetOtp(mobile, otp);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setStep(3);
        toast.success("OTP verified");
      } else {
        toast.error("Invalid response");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* STEP 3 */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || resetToken.length < 10) {
      toast.error(MESSAGES.INVALID_RESET_SESSION);
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    try {
      setLoading(true);
      await resetPassword(resetToken, newPassword);
      toast.success(MESSAGES.PASSWORD_RESET_SUCCESS);
      clearForm();
      setTimeout(() => {
        navigate(isSafeRoute(ROUTES.LOGIN) ? ROUTES.LOGIN : "/");
      }, 2000);
    } catch (err) {
      toast.error(MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setStep(1);
    setMobile("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
  };

  const getErrorMessage = (err) => {
    if (err?.response?.data?.message) return err.response.data.message;
    return MESSAGES.GENERIC_ERROR;
  };

  const passwordMatchText =
    confirmPassword.length > 0
      ? newPassword === confirmPassword
        ? "Passwords match"
        : "Passwords do not match"
      : "";
  const sanitizePassword = (value) => value.replace(/\s/g, "").slice(0, 14);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <ToastContainer />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300">
        {/* HEADER */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-1">
         {t("login_signup_page.resetPassword")}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
           {t("login_signup_page.followSteps")}
        </p>

        {/* STEP INDICATOR */}
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${
                step >= s ? "bg-[#0F766E]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <LoadingSpinner />
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <InputField
              label={t("login_signup_page.mobileNumber")}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
              required
              className="shadow-none border-1"
            />

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Captcha
                ref={captchaRef}
                onChange={(text) => setGeneratedCaptcha(text)}
              />

              <InputField
                label={t("login_signup_page.captcha")}
                value={captchaInput}
                onChange={(e) => handleCaptchaChange(e.target.value)}
                required
                disabled={isLocked}
                className="shadow-none border-1"
              />

              {failedAttempts > 0 && (
                <p className="text-xs text-red-500">
                  {t("login_signup_page.failedAttempts")}: {failedAttempts}/3   
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLocked}
              className="w-full py-3 rounded-xl bg-[#0F766E] text-white font-semibold hover:bg-[#115e59] transition disabled:opacity-50"
            >
             {t("login_signup_page.sendOtp")}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={verifyOtpHandler} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              {t("login_signup_page.otpSentTo")}<span className="font-semibold">{mobile}</span>
            </p>

            <InputField
              label= {t("login_signup_page.otp")}
              value={otp}
              onChange={(e) => setOtp(sanitizeOtp(e.target.value))}
              required
              className="shadow-none border-1"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl  bg-[#0F766E] text-white font-semibold hover:bg-[#115e59] transition"
            >
              {t("login_signup_page.verfiyOtp")}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              label={t("login_signup_page.newPassword")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(sanitizePassword(e.target.value))}
              required
              className="shadow-none border-1"
            />

            <InputField
              label={t("login_signup_page.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(sanitizePassword(e.target.value))
              }
              required
              className="shadow-none border-1"
            />

            <p
              className={`text-sm ${
                confirmPassword.length > 0
                  ? newPassword === confirmPassword
                    ? "text-green-600"
                    : "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {passwordMatchText}
            </p>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              {t("login_signup_page.resetPassword")}
            </button>
          </form>
        )}

        {/* LOGIN LINK */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
             {t("login_signup_page.rememberPassword")}{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              {t("login_signup_page.loginHere")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordWithOtp;
