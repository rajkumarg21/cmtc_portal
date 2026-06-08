// import { useState } from "react";

// export const useUserForm = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     fullName: "",
//     originalDesignation: "",
//     role: "",
//     password: undefined,
//     enabled: true,
//     mobileNo: "",

//     districtId: "",
//     districtName: "",
//     blockId: "",
//     blockName: "",
//     cmtcCenterId: "",
//     cmtcCenterName: "",

//     assignedDistrictId: "",
//     assignedDistrictName: "",
//     assignedBlockId: "",
//     assignedBlockName: "",
//     assignedCmtcCenterId: "",
//     assignedCmtcCenterName: "",
//   });

//   const [validationErrors, setValidationErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     let newValue = value;

//     if (name === "mobileNo") newValue = value.replace(/[^0-9]/g, "");

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : newValue,
//     }));
//   };
// const handleRoleChange = useCallback(
//     ({ e, loggedInRole, loggedInUser, USER_ROLES, CENTER_ROLES, setBlocks, setCmtcCenters }) => {
//       const newRole = e.target.value;

//       const config = getGeoConfig(
//         loggedInRole,
//         newRole,
//         USER_ROLES,
//         CENTER_ROLES
//       );

//       setFormData((prev) =>
//         applyGeoConfigToForm(config, loggedInUser, {
//           ...prev,

//           role: newRole,

//           districtId: "",
//           districtName: "",
//           blockId: "",
//           blockName: "",
//           cmtcCenterId: "",
//           cmtcCenterName: "",

//           assignedDistrictId: "",
//           assignedDistrictName: "",
//           assignedBlockId: "",
//           assignedBlockName: "",
//           assignedCmtcCenterId: "",
//           assignedCmtcCenterName: "",
//         })
//       );

//       setBlocks([]);
//       setCmtcCenters([]);
//     },
//     []
//   );

//   const validatePassword = () => {
//     const pwd = formData?.password ?? "";

//     if (pwd.length === 0) {
//       return "Password is required for new users";
//     }

//     if (pwd.length > 0 && pwd.length < 6) {
//       return "Password must be at least 6 characters";
//     }

//     return "";
//   };

//   const validateForm = (isOriginalDesignationRequired, formData, checkRoleUniquenessRules, USER_ROLES) => {
//     const errors = {};

//     if (!formData.username.trim()) {
//       errors.username = "Username is required";
//     } else if (formData.username.length < 3 || formData.username.length > 25) {
//       errors.username = "Username must be between 3 and 25 characters";
//     }

//     if (!formData.fullName.trim()) errors.fullName = "Full name is required";

//     if (isOriginalDesignationRequired && !formData.originalDesignation.trim())
//       errors.originalDesignation = "Original designation is required";

//     if (!formData.email.trim()) {
//       errors.email = "Email is required";
//     } else if (
//       !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
//     ) {
//       errors.email = "Please enter a valid email address";
//     }

//     if (!formData.mobileNo.trim()) {
//       errors.mobileNo = "Mobile number is required";
//     } else if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
//       errors.mobileNo = "Mobile number must be 10 digits";
//     }

//     const passwordError = validatePassword();

//     if (passwordError) {
//       errors.password = passwordError;
//     }

//     if (!formData.role) errors.role = "Role is required";

//     if (formData.role === USER_ROLES.DISTRICT_OFFICER && !formData.districtId) {
//       errors.district = "District is required for District Officer";
//     }

//     if (formData.role === USER_ROLES.BLOCK_OFFICER && !formData.blockId) {
//       errors.block = "Block is required for Block Officer";
//     }

//     if (
//       (formData.role === USER_ROLES.CMTC_MANAGER ||
//         formData.role === USER_ROLES.CMTC_STAFF) &&
//       !formData.cmtcCenterId
//     ) {
//       errors.cmtcCenter = "CMTC Center is required";
//     }

//     const uniqError = checkRoleUniquenessRules();
//     if (uniqError) errors.role = uniqError;

//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   return {
//     formData,
//     setFormData,
//     validationErrors,
//     setValidationErrors,
//     handleChange,
//     handleRoleChange,
//     validateForm,
//   };
// };