export const API_BASE_URL = 'http://localhost:8081';
export const USER_ROLES = {
  PORTAL_ADMIN: 'PORTAL_ADMIN',
  EDITOR: 'EDITOR',
  PUBLISHER: 'PUBLISHER',
  NORMAL_VISITOR: 'NORMAL_VISITOR',
  GOV_DEPARTMENT: "GOV_DEPARTMENT",
  INDIVIDUAL_ENTITY: "INDIVIDUAL_ENTITY",
};

export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
};

export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
};

export const ALERT_STATUS = {
  YES: 'YES',
  NO: 'NO',
};

export const RTI_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
};


export const MARQUEE_TYPES= {
  TEXT: 'TEXT',
  LINK: 'LINK',
  
}

export const MAX_IMAGE_SIZE_BYTES = 100 * 1024; // 100KB

export const getImageSizeLimitMsg = (actualSizeBytes) => {
  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return `Image size (${formatSize(actualSizeBytes)}) exceeds the maximum limit of ${formatSize(MAX_IMAGE_SIZE_BYTES)}.`;
};
