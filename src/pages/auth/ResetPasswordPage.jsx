import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/apiService';
import { isSafeRoute } from "../../utils/security";
import { ROUTES } from "../../constants/routes";
import { MESSAGES } from "../../constants/messages";
const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ field-level validation states
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // ✅ Password policy: 6–14 length
  const validatePasswordLength = (value) => value.length >= 6 && value.length <= 14;

  const getPasswordLengthMessage = () => 'Password must be between 6 and 14 characters long.';

  const validateNewPassword = (value) => {
    if (!value) return 'New password is required.';
    if (!validatePasswordLength(value)) return getPasswordLengthMessage();
    return '';
  };

  const validateConfirmPassword = (value, np = newPassword) => {
    if (!value) return 'Confirm password is required.';
    if (!validatePasswordLength(value)) return getPasswordLengthMessage();
    if (value !== np) return 'Passwords do not match.';
    return '';
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    // ✅ hard stop max 14 characters
    const capped = value.slice(0, 14);
    setNewPassword(capped);

    if (newPasswordTouched) {
      setNewPasswordError(validateNewPassword(capped));
    }

    // keep confirm password error in sync if user already touched it
    if (confirmPasswordTouched) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, capped));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    // ✅ hard stop max 14 characters
    const capped = value.slice(0, 14);
    setConfirmPassword(capped);

    if (confirmPasswordTouched) {
      setConfirmPasswordError(validateConfirmPassword(capped, newPassword));
    }
  };

  const handleNewPasswordBlur = () => {
    setNewPasswordTouched(true);
    setNewPasswordError(validateNewPassword(newPassword));
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    setConfirmPasswordError(validateConfirmPassword(confirmPassword, newPassword));
  };

  useEffect(() => {
    if (!token) {
      setError('No reset token found in the URL. Please use the link from your email.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // ✅ trigger field validation on submit
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);

    const npErr = validateNewPassword(newPassword);
    const cpErr = validateConfirmPassword(confirmPassword, newPassword);

    setNewPasswordError(npErr);
    setConfirmPasswordError(cpErr);

    if (npErr || cpErr) return;

    setLoading(true);

    if (!token) {
      setError(MESSAGES.INVALID_RESET_TOKEN);
      setLoading(false);
      return;
    }

    try {

  await api.post('/auth/reset-password', { token, newPassword });

  setMessage(MESSAGES.PASSWORD_RESET_SUCCESS);

  setNewPassword('');
  setConfirmPassword('');
  setNewPasswordTouched(false);
  setConfirmPasswordTouched(false);
  setNewPasswordError('');
  setConfirmPasswordError('');

  setTimeout(() => {

    navigate(
      isSafeRoute(ROUTES.LOGIN)
        ? ROUTES.LOGIN
        : ROUTES.HOME,
      {
        replace: true
      }
    );

  }, 3000);

}
catch (err) {

  setError(
    err.response?.data ||
    MESSAGES.PASSWORD_RESET_FAILED
  );

}
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>

        {message && (
          <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
            {error}
          </p>
        )}

        {loading && <LoadingSpinner />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="New Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              onBlur={handleNewPasswordBlur}
              required
              disabled={loading}
            />
            {newPasswordTouched && newPasswordError && (
              <p className="text-red-600 text-xs mt-1">{newPasswordError}</p>
            )}
          </div>

          <div>
            <InputField
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              required
              disabled={loading}
            />
            {confirmPasswordTouched && confirmPasswordError && (
              <p className="text-red-600 text-xs mt-1">{confirmPasswordError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            Reset Password
          </Button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Password must be <span className="font-semibold">6 to 14</span> characters.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
