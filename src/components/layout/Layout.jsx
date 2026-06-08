import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import PublicLayout from "./PublicLayout";
import LsbLayout from "../../lsb/layout/LsbLayout";
import { LSB_ROLES, USER_ROLES } from "../../utils/constants";

export default function Layout() {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

   const adminRoles = [
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.CMTC_ADMINISTRATOR,
    USER_ROLES.CMTC_ACCOUNTANT,
    USER_ROLES.AUDIT_ACCOUNTANT,
    USER_ROLES.AUDITOR,
    USER_ROLES.MISSION_STAFF,
    USER_ROLES.CMTC_PROCUREMENT_PRESIDENT,
    USER_ROLES.CMTC_MANAGEMENT_PRESIDENT
  ];

  const limitedAdminRoles = [
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.CMTC_ADMINISTRATOR,
  ];

  // ✅ Redirect limited admin roles from /admin/dashboard to /admin/users
  useEffect(() => {
    if (isAuthenticated && limitedAdminRoles.includes(userRole)) {
      if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
        navigate('/admin/users', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate]);

  // ✅ LSB users get their own dedicated layout
  if (isAuthenticated && LSB_ROLES.includes(userRole)) {
    return <LsbLayout />;
  }

  // ✅ Check if user is authenticated AND has an admin role
  if (isAuthenticated && adminRoles.includes(userRole)) {
    return <AdminLayout />;
  }

  return <PublicLayout />;
}