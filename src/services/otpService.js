// src/services/otpService.js
import api from './apiService';

export const sendOtp = async (mobileNo) => {
  const response = await api.post('/auth/send-otp', {
    mobileNo
  });
  return response.data;
};

//**************************************** */
export const sendOtpForgotPassword = async (mobileNo) => {
  const response = await api.post('/auth/sendOtpForgotPassword', {
    mobileNo
  });
  return response.data;
};
//**************************************** */

export const verifyResetOtp = async (mobileNo, otp) => {
  const response = await api.post('/auth/verify-forgot-password-otp', {
    mobileNo,
    otp
  });
  return response.data; 
  // { resetToken, expiresIn }
};
