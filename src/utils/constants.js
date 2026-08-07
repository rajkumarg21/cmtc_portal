/* ================================
   API CONFIG
   ================================ */

// export const API_BASE_URL = 'http://localhost:8080';

/* ================================
   USER ROLES (Aligned with Backend)
   ================================ */

export const USER_ROLES = Object.freeze({
  // System
  PORTAL_ADMIN: 'PORTAL_ADMIN',

  // Hierarchy roles
  // ZONAL_HEAD: 'ZONAL_HEAD',
  DISTRICT_OFFICER: 'DISTRICT_OFFICER',
  BLOCK_OFFICER: 'BLOCK_OFFICER',
  // CMTC_MANAGER: 'CMTC_MANAGER',
  // CMTC_STAFF: 'CMTC_STAFF',
  CMTC_ADMINISTRATOR: 'CMTC_ADMINISTRATOR',
  CMTC_ACCOUNTANT: 'CMTC_ACCOUNTANT',

  // CMS roles
  // EDITOR: 'EDITOR',
  // PUBLISHER: 'PUBLISHER',

  // Public
  GOV_DEPARTMENT: 'GOV_DEPARTMENT',
  
  //for audit grading
  AUDIT_ACCOUNTANT: 'AUDIT_ACCOUNTANT',
  AUDITOR: 'AUDITOR',
  MISSION_STAFF: 'MISSION_STAFF',
  CMTC_PROCUREMENT_PRESIDENT: 'CMTC_PROCUREMENT_PRESIDENT',
  CMTC_MANAGEMENT_PRESIDENT: 'CMTC_MANAGEMENT_PRESIDENT',

  //LSB ROLES
    // ================= LSB (NEW) =================
  LSB_BANK_MAKER: "LSB_BANK_MAKER",
  LSB_BANK_CHECKER: "LSB_BANK_CHECKER",
  LSB_NODAL_MAKER: "LSB_NODAL_MAKER",
  LSB_NODAL_CHECKER: "LSB_NODAL_CHECKER",
  LSB_ADMIN: "LSB_ADMIN",
});

/* ================================
   USER CREATION HIERARCHY
   (Frontend Enforcement)
   ================================ */

export const USER_CREATION_HIERARCHY = Object.freeze({
  // =================================================
  // PORTAL ADMIN (System Super User)
  // =================================================
  [USER_ROLES.PORTAL_ADMIN]: [
    //USER_ROLES.ZONAL_HEAD,
    // USER_ROLES.EDITOR,
    // USER_ROLES.PUBLISHER,
    USER_ROLES.DISTRICT_OFFICER
  ],

  // =================================================
  // ZONAL HEAD
  // =================================================
  [USER_ROLES.ZONAL_HEAD]: [
    USER_ROLES.DISTRICT_OFFICER,
    // USER_ROLES.EDITOR,
    // USER_ROLES.PUBLISHER,
  ],

  // =================================================
  // DISTRICT → BLOCK → CMTC CHAIN
  // =================================================
  [USER_ROLES.DISTRICT_OFFICER]: [
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.AUDITOR,
    USER_ROLES.AUDIT_ACCOUNTANT,
    USER_ROLES.MISSION_STAFF
  ],

  [USER_ROLES.BLOCK_OFFICER]: [
    // USER_ROLES.CMTC_MANAGER,
    USER_ROLES.CMTC_ADMINISTRATOR,
    USER_ROLES.CMTC_ACCOUNTANT,
    USER_ROLES.CMTC_MANAGEMENT_PRESIDENT,
    USER_ROLES.CMTC_PROCUREMENT_PRESIDENT
  ],

  [USER_ROLES.CMTC_MANAGER]: [
    // USER_ROLES.CMTC_STAFF, // backend enforces max count
  ],
});

/* ================================
   PUBLIC SIGNUP ROLES
   ================================ */

export const PUBLIC_SIGNUP_ROLES = Object.freeze([
  USER_ROLES.GOV_DEPARTMENT,
]);

/* ================================
   ROLE LABELS (UI DISPLAY)
   ================================ */

export const ROLE_LABELS = Object.freeze({
  PORTAL_ADMIN: 'सिस्टम एडमिन',
  ZONAL_HEAD: 'ज़ोनल ऑफिसर',
  DISTRICT_OFFICER: 'जिला सी एम टी सी प्रभारी',
  BLOCK_OFFICER: 'ब्लॉक सी एम टी सी प्रभारी',
  CMTC_ADMINISTRATOR: 'सी एम टी सी व्यवस्थापक',
  CMTC_MANAGER: 'सी एम टी सी सेंटर प्रभारी',
  CMTC_ACCOUNTANT: 'सी एम टी सी एकाउंटैंट',
  CMTC_STAFF: 'सी एम टी सी स्टाफ',
  EDITOR: 'संपादक',
  PUBLISHER: 'प्रकाशक',
  GOV_DEPARTMENT: 'सरकारी विभाग',
  
  // Remaining / Audit & Mission roles
  AUDIT_ACCOUNTANT: 'ऑडिट एकाउंटैंट',
  AUDITOR: 'ऑडिटर',
  MISSION_STAFF: 'मिशन स्टाफ',
  CMTC_PROCUREMENT_PRESIDENT: 'सी एम टी सी खरीद समुदाय अध्यक्ष',
  CMTC_MANAGEMENT_PRESIDENT: 'सी एम टी सी प्रबंधन समुदाय अध्यक्ष'
});

/* ================================
   CONTENT / CMS CONSTANTS
   ================================ */
export const CONTENT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
});

// export const OFFICER_DESIGNATIONS = Object.freeze({
//   ZONAL_HEAD: 'Zonal Officer',
//   DISTRICT_OFFICER: 'District Officer (DPM)',
//   BLOCK_OFFICER: 'Block Officer',
//   CMTC_MANAGER: 'CMTC Center Manager',
//   CMTC_STAFF: 'CMTC Staff',
// });

export const MEDIA_TYPES = Object.freeze({
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
});

export const ALERT_STATUS = Object.freeze({
  YES: 'YES',
  NO: 'NO',
});

export const RTI_STATUS = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
});

export const MARQUEE_TYPES = Object.freeze({
  TEXT: 'TEXT',
  LINK: 'LINK',
});

/* ================================
   FILE UPLOAD LIMITS
   ================================ */
export const MAX_IMAGE_SIZE_BYTES = 100 * 1024; // 100 KB

export const getImageSizeLimitMsg = (actualSizeBytes) => {
  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return `Image size (${formatSize(actualSizeBytes)}) exceeds the maximum limit of ${formatSize(MAX_IMAGE_SIZE_BYTES)}.`;
};

export const LOGIN_MODE = {
  USERNAME_PASSWORD: 'PASSWORD',
  MOBILE_OTP: 'MOBILE_OTP',
}

export const BOOKING_APPROVAL_STATUS = {
  PENDING_BLOCK_APPROVAL: "PENDING_BLOCK_APPROVAL",
  PENDING_DISTRICT_APPROVAL: "PENDING_DISTRICT_APPROVAL",
  AWAITING_ADVANCE_PAYMENT: "AWAITING_ADVANCE_PAYMENT",
  BLOCK_REJECTED: "BLOCK_REJECTED",
  DISTRICT_REJECTED: "DISTRICT_REJECTED",
  BOOKED: "BOOKED",
  // DISTRICT_APPROVED: "DISTRICT_APPROVED",
  CANCELLED_BY_USER: "CANCELLED_BY_USER",
  // EXPIRED: "EXPIRED",
  TRAINING_COMPLETED: "TRAINING_COMPLETED",
  // APPROVED: "APPROVED",
  // PENDING: "PENDING",
  // REJECTED:"REJECTED"
  CANCELLATION_REQUESTED:"CANCELLATION_REQUESTED"
};
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case BOOKING_APPROVAL_STATUS.PENDING_BLOCK_APPROVAL:
      return "bg-warning text-dark";
    // case BOOKING_APPROVAL_STATUS.PENDING:
    //   return "bg-warning text-dark";
    case BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL:
      return "bg-info text-dark";

    case BOOKING_APPROVAL_STATUS.AWAITING_ADVANCE_PAYMENT:
      return "bg-primary";
    // case BOOKING_APPROVAL_STATUS.REJECTED:
    case BOOKING_APPROVAL_STATUS.BLOCK_REJECTED:
    case BOOKING_APPROVAL_STATUS.DISTRICT_REJECTED:
      return "bg-danger";

    case BOOKING_APPROVAL_STATUS.DISTRICT_APPROVED:
      return "bg-success";

    case BOOKING_APPROVAL_STATUS.APPROVED:
      return "bg-success";


    case BOOKING_APPROVAL_STATUS.CANCELLED_BY_USER:
      return "bg-secondary";

    case BOOKING_APPROVAL_STATUS.EXPIRED:
      return "bg-dark";

    case BOOKING_APPROVAL_STATUS.TRAINING_COMPLETED:
      return "bg-success";

    default:
      return "bg-light text-dark";
  }
};

export const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
export const HOMEPAGE_VIDEO_URL = import.meta.env.VITE_APP_BACKEND_URL + "/files/videos/homepage_video.mp4";

export const CENTER_ROLES = [
  // USER_ROLES.CMTC_MANAGER,
  USER_ROLES.CMTC_ADMINISTRATOR,
  USER_ROLES.CMTC_ACCOUNTANT,
  USER_ROLES.CMTC_MANAGEMENT_PRESIDENT,
  USER_ROLES.CMTC_PROCUREMENT_PRESIDENT
];

export const LSB_ROLES = [  
  USER_ROLES.LSB_BANK_MAKER,
  USER_ROLES.LSB_BANK_CHECKER,
  USER_ROLES.LSB_NODAL_MAKER,
  USER_ROLES.LSB_NODAL_CHECKER,
  USER_ROLES.LSB_ADMIN,
]

export const AUDIT_ROLES = [
  USER_ROLES.AUDITOR,
  USER_ROLES.AUDIT_ACCOUNTANT,
  USER_ROLES.MISSION_STAFF,
]