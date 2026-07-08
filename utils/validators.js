// server/src/utils/validators.js
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateCrmRecord = (record) => {
  if (record.skip) {
    return {
      valid: false,
      reason: record.skip_reason || "Marked as skipped by AI",
    };
  }

  const hasEmail = record.email && emailRegex.test(record.email);
  const hasMobile =
    record.mobile_without_country_code &&
    String(record.mobile_without_country_code).replace(/\D/g, "").length >= 6;

  if (!hasEmail && !hasMobile) {
    return {
      valid: false,
      reason: "Record skipped because both email and mobile are missing",
    };
  }

  return {
    valid: true,
    reason: "",
  };
};

module.exports = {
  validateCrmRecord,
};