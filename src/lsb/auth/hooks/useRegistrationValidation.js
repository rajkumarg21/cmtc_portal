export const useRegistrationValidation = () => {

  const isValidMobile = (mobile) =>
    /^[6-9]\d{9}$/.test(mobile);

  const validateMobile = (mobile) => {
    if (!mobile) return "Mobile is required";
    if (!isValidMobile(mobile)) return "Invalid mobile number";
    return "";
  };

  const validateOtp = (otp) => {
    if (!otp) return "OTP required";
    if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
    return "";
  };

  const validatePassword = (pwd) => {
    if (!pwd) return "Password required";
    if (pwd.length < 6 || pwd.length > 14)
      return "Password must be 6–14 characters";
    return "";
  };

  return {
    validateMobile,
    validateOtp,
    validateEmail,
    validatePassword,
    isValidMobile,
  };
};  