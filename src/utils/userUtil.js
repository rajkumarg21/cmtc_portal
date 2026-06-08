import i18n from "i18next";

export function getRoleLabel(role) {
  const isHindi = i18n.language?.startsWith("hi");

  const roleMap = {
    en: {
      DISTRICT_OFFICER: "District CMTC In-Charge",
      BLOCK_OFFICER: "Block CMTC In-Charge",
      CMTC_MANAGER: "CMTC Manager",
    },
    hi: {
      DISTRICT_OFFICER: "जिला सीएमटीसी प्रभारी",
      BLOCK_OFFICER: "ब्लॉक सीएमटीसी प्रभारी",
      CMTC_MANAGER: "सीएमटीसी प्रबंधक",
    },
  };

  const lang = isHindi ? "hi" : "en";

  if (roleMap[lang]?.[role]) {
    return roleMap[lang][role];
  }

  // fallback → format enum nicely
  return role
    ?.toLowerCase()
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
