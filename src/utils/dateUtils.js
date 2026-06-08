import { startOfWeek, endOfWeek, addWeeks, startOfYear, format } from 'date-fns';

/**
 * @constant {Date} FIRST_PUBLICATION_DATE
 * @description
 * The base date of the first publication used to calculate publication years.
 * @default new Date('1984-01-01')
 * @author Kartik Sahu
 */
export const FIRST_PUBLICATION_DATE = new Date('1984-01-01');

/**
 * Calculates the publication year based on the provided date,
 * relative to the FIRST_PUBLICATION_DATE.
 *
 * @function calculatePublicationYear
 * @param {Date} date - The date for which the publication year is calculated.
 * @returns {number} The calculated publication year (1-based).
 * @author Kartik Sahu
 */
export const calculatePublicationYear = (date) => {
  const yearsDifference = date.getFullYear() - FIRST_PUBLICATION_DATE.getFullYear();
  return yearsDifference + 1;
};

/**
 * Calculates the ISO week number for a given date.
 *
 * @function getWeekNumber
 * @param {Date} d - The date from which to calculate the week number.
 * @returns {number} The week number (1-based) of the given date.
 * @author Kartik Sahu
 */
export const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Returns the start and end dates of a given ISO week number within a year.
 *
 * @function getWeekDateRange
 * @param {number} weekNumber - The ISO week number (1-based).
 * @param {number} [year=new Date().getFullYear()] - The year for which to get the week range.
 * @returns {{startDate: string, endDate: string}} Object containing start and end dates (formatted as dd.MM.yyyy).
 * @author Kartik Sahu
 */
export const getWeekDateRange = (weekNumber, year = new Date().getFullYear()) => {
  const firstDayOfYear = startOfYear(new Date(year, 0, 1));
  const targetDate = addWeeks(firstDayOfYear, weekNumber - 1);
  const start = startOfWeek(targetDate, { weekStartsOn: 1 });
  const end = endOfWeek(targetDate, { weekStartsOn: 1 });
  return {
    startDate: format(start, 'dd.MM.yyyy'),
    endDate: format(end, 'dd.MM.yyyy'),
  };
};

/**
 * Returns an array of available week numbers (from 1 to currentWeek) in reverse order.
 *
 * @function getAvailableWeeks
 * @param {number} currentWeek - The current week number.
 * @returns {number[]} Array of week numbers in descending order.
 * @author Kartik Sahu
 */
export const getAvailableWeeks = (currentWeek) => {
  return Array.from({ length: currentWeek }, (_, i) => i + 1).reverse();
};

/**
 * Formats a given date into 'DD/MM/YYYY' format.
 *
 * @param {string | Date | number} dateInput - The date to format (string, Date object, or timestamp).
 * @returns {string} - The formatted date in 'DD/MM/YYYY' format.
 *
 * @example
 * formatDateToStringDDMMYYYY("2023-09-26"); // "26/09/2023"
 * formatDateToStringDDMMYYYY(new Date(2023, 8, 26)); // "26/09/2023"
 * formatDateToStringDDMMYYYY(1632973742000); // "30/09/2021"
 * formatDateToStringDDMMYYYY("05.01.2025"); // "05/01/2025"
 */
export const formatDateToStringDDMMYYYY = (dateInput) => {
  if (!dateInput) return "N/A"; // Handle null or undefined input

  // Handle the case for 'DD.MM.YYYY' format
  if (typeof dateInput === "string" && /\d{2}\.\d{2}\.\d{4}/.test(dateInput)) {
    const [day, month, year] = dateInput.split('.'); // Split by the dot
    dateInput = new Date(`${year}-${month}-${day}`); // Reformat into YYYY-MM-DD
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "N/A"; // Return "N/A" for invalid dates

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a given date into 'DD/MM/YYYY HH:MM' format.
 *
 * @param {string | Date | number} dateInput - The date to format (string, Date object, or timestamp).
 * @returns {string} - The formatted date in 'DD/MM/YYYY HH:MM' format.
 *
 * @example
 * formatDateTimeToStringDDMMYYYYHHMM("2023-09-26T14:30:00"); // "26/09/2023 14:30"
 * formatDateTimeToStringDDMMYYYYHHMM(new Date(2023, 8, 26, 9, 5)); // "26/09/2023 09:05"
 * formatDateTimeToStringDDMMYYYYHHMM(1632973742000); // "30/09/2021 14:09"
 * formatDateTimeToStringDDMMYYYYHHMM("05.01.2025 16:20"); // "05/01/2025 16:20"
 */
export const formatDateTimeToStringDDMMYYYYHHMM = (dateInput) => {
  if (!dateInput) return "N/A"; // Handle null or undefined input

  // Handle 'DD.MM.YYYY HH:MM' format
  if (typeof dateInput === "string" && /\d{2}\.\d{2}\.\d{4}/.test(dateInput)) {
    const [datePart, timePart] = dateInput.split(' ');
    const [day, month, year] = datePart.split('.');
    dateInput = new Date(`${year}-${month}-${day} ${timePart || "00:00"}`);
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "N/A"; // Return "N/A" for invalid dates

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
