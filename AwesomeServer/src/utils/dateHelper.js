/**
 * Date Helper Utilities for Business Date Handling
 * 
 * The business date represents the "logical day" for business operations,
 * independent of timezone issues with UTC timestamps.
 */

/**
 * Get current business date in YYYY-MM-DD format (IST timezone)
 * @returns {string} Business date string, e.g., "2025-11-30"
 */
export const getBusinessDate = () => {
    // Create a date in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(now.getTime() + istOffset);

    // Format as YYYY-MM-DD
    return istDate.toISOString().split('T')[0];
};

/**
 * Get business date for a specific Date object (IST timezone)
 * @param {Date} date - The date to convert
 * @returns {string} Business date string, e.g., "2025-11-30"
 */
export const getBusinessDateFromDate = (date) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
};

/**
 * Get start and end of business day in UTC
 * Useful for querying records by business date
 * @param {string} businessDate - Business date in YYYY-MM-DD format
 * @returns {{start: Date, end: Date}} Start and end of the business day in UTC
 */
export const getBusinessDayRange = (businessDate) => {
    // Parse the business date (e.g., "2025-11-30")
    const [year, month, day] = businessDate.split('-').map(Number);

    // Create date at midnight IST
    const istOffset = 5.5 * 60 * 60 * 1000;

    // Start of day: 00:00:00 IST
    const startIST = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const startUTC = new Date(startIST.getTime() - istOffset);

    // End of day: 23:59:59.999 IST
    const endIST = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const endUTC = new Date(endIST.getTime() - istOffset);

    return { start: startUTC, end: endUTC };
};

/**
 * Validate business date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid YYYY-MM-DD format
 */
export const isValidBusinessDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};
