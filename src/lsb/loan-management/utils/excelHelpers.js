import * as XLSX from "xlsx";

/**
 * Read excel file and return JSON array
 */
export const parseExcelFile = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1, // returns array format (like your angular)
    defval: "",
  });
};

/**
 * Extract headers safely
 */
export const getHeaders = (data) => {
  if (!data || data.length === 0) return [];
  return data[0];
};

/**
 * Get rows excluding header
 */
export const getRows = (data) => {
  if (!data || data.length <= 1) return [];
  return data.slice(1);
};

/**
 * Calculate SHG count
 */
export const calculateShgCount = (rows) => {
  return rows.length;
};

/**
 * Calculate total loan amount
 * (Assuming amount column index is known, adjust if needed)
 */
export const calculateLoanAmount = (rows, amountIndex = 0) => {
  return rows.reduce((sum, row) => {
    const val = Number(row[amountIndex]) || 0;
    return sum + val;
  }, 0);
};

/**
 * Validate excel structure (basic)
 */
export const validateExcel = (headers) => {
  if (!headers || headers.length === 0) {
    return "Invalid Excel format";
  }

  // You can enforce required columns here
  // Example:
  // if (!headers.includes("Loan Amount")) return "Missing Loan Amount column";

  return null;
};