// server/src/utils/phone.js
const parsePhoneNumber = require("libphonenumber-js");
const { findPhoneNumbersInText } = require("libphonenumber-js");

const DEFAULT_COUNTRY = "IN";

const digitsOnly = (value) => String(value || "").replace(/[^\d+]/g, "");

const parseCandidateNumber = (value, defaultCountry = DEFAULT_COUNTRY) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const phone = parsePhoneNumber(raw, defaultCountry);
    if (phone && phone.isPossible()) {
      return {
        country_code: `+${phone.countryCallingCode || ""}`,
        mobile_without_country_code: phone.nationalNumber || "",
        e164: phone.number || "",
      };
    }
  } catch (error) {}

  const onlyDigits = digitsOnly(raw);
  if (!onlyDigits) return null;

  if (onlyDigits.startsWith("+")) {
    try {
      const phone = parsePhoneNumber(onlyDigits);
      if (phone && phone.isPossible()) {
        return {
          country_code: `+${phone.countryCallingCode || ""}`,
          mobile_without_country_code: phone.nationalNumber || "",
          e164: phone.number || "",
        };
      }
    } catch (error) {}
  }

  const compact = onlyDigits.replace(/\D/g, "");
  if (compact.length >= 10 && compact.length <= 15) {
    if (compact.length === 10) {
      return {
        country_code: "+91",
        mobile_without_country_code: compact,
        e164: `+91${compact}`,
      };
    }

    if (compact.startsWith("91") && compact.length >= 12) {
      return {
        country_code: "+91",
        mobile_without_country_code: compact.slice(2),
        e164: `+${compact}`,
      };
    }
  }

  return null;
};

const extractPhonesFromText = (text) => {
  try {
    const matches = findPhoneNumbersInText(String(text || ""), DEFAULT_COUNTRY) || [];
    return matches.map((item) => item.number.number);
  } catch (error) {
    return [];
  }
};

const normalizePhoneFields = ({ countryCode, mobile, sourceText }) => {
  const direct = parseCandidateNumber(
    `${countryCode || ""} ${mobile || ""}`.trim()
  );

  if (direct) return direct;

  const mobileOnly = parseCandidateNumber(mobile);
  if (mobileOnly) return mobileOnly;

  const found = extractPhonesFromText(sourceText);
  if (found.length) {
    const fallback = parseCandidateNumber(found[0]);
    if (fallback) return fallback;
  }

  return {
    country_code: "",
    mobile_without_country_code: "",
    e164: "",
  };
};

module.exports = {
  normalizePhoneFields,
  extractPhonesFromText,
};