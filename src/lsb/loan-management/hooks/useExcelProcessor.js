import { useState } from "react";
import {
  parseExcelFile,
  getHeaders,
  getRows,
  calculateLoanAmount,
  calculateShgCount,
  validateExcel,
} from "../utils/excelHelpers";

export const useExcelProcessor = () => {
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [shgCount, setShgCount] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);

  const processFile = async (file) => {
    try {
      setLoading(true);
      setError(null);

      const data = await parseExcelFile(file);

      const headers = getHeaders(data);
      const rows = getRows(data);

      const validationError = validateExcel(headers);
      if (validationError) {
        setError(validationError);
        return;
      }
      const formattedRows = rows.map((row, index) => {
        const obj = { id: index };

        headers.forEach((key, i) => {
          obj[key] = row[i];
        });

        return obj;
      });

      const totalShg = calculateShgCount(rows);
      const totalLoan = calculateLoanAmount(rows, 12); // adjust index

      setExcelData(data);
      setHeaders(headers);
      setRows(formattedRows);
      setShgCount(totalShg);
      setLoanAmount(totalLoan);
    } catch (err) {
      setError("Failed to process Excel file");
    } finally {
      setLoading(false);
    }
  };

  return {
    excelData,
    rows,
    headers,
    loading,
    error,
    shgCount,
    loanAmount,
    processFile,
  };
};