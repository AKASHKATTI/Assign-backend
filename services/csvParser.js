// server/src/services/csvParser.js
const Papa = require("papaparse");

const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return value;
  return value.replace(/\uFEFF/g, "").trim();
};

const cleanRow = (row) => {
  const cleaned = {};

  Object.keys(row || {}).forEach((key) => {
    const safeKey = cleanValue(key);
    cleaned[safeKey] = cleanValue(row[key]);
  });

  return cleaned;
};

const isMeaningfulRow = (row) => {
  return Object.values(row).some((value) => {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== "";
  });
};

const parseCsvBuffer = (buffer) => {
  const csvString = buffer.toString("utf-8");

 const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => cleanValue(header),
    escapeChar: '"',
     // Explicitly handle escaped quotes
  });

  if (result.errors && result.errors.length) {
    // Filter out minor structural warnings if you choose
    const criticalError = result.errors.find(
      (error) => error.code !== "TooFewFields"
    );

    if (criticalError) {
      // Enhanced error message to help you debug the file
      throw new Error(
        `CSV Parse Error: ${criticalError.message} at row/line ${criticalError.row + 1 || 'unknown'}`
      );
    }
  }

  const rows = (result.data || [])
    .map(cleanRow)
    .filter(isMeaningfulRow)
    .map((row, index) => ({
      __rowNumber: index + 1,
      ...row,
    }));

  return {
    rows,
    headers: result.meta?.fields || [],
    totalRows: rows.length,
    meta: {
      delimiter: result.meta?.delimiter || ",",
      linebreak: result.meta?.linebreak || "\n",
      renamedHeaders: result.meta?.renamedHeaders || {},
    },
  };
};

module.exports = {
  parseCsvBuffer,
};