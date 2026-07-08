// server/src/services/normalizer.js
const { normalizePhoneFields, extractPhonesFromText } = require("../utils/phone");
const { buildCrmNote, mergeNotes } = require("../utils/notes");

const ALLOWED_STATUS = new Set([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
]);

const ALLOWED_DATA_SOURCE = new Set([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
]);

const toStringSafe = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalizeDate = (value) => {
  const raw = toStringSafe(value);
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
};

const normalizeEmail = (value) => {
  const raw = toStringSafe(value).toLowerCase();
  const emails = raw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  return emails[0] || "";
};

const normalizeStatus = (value) => {
  const raw = toStringSafe(value).toUpperCase();
  return ALLOWED_STATUS.has(raw) ? raw : "";
};

const normalizeDataSource = (value) => {
  const raw = toStringSafe(value).toLowerCase();
  return ALLOWED_DATA_SOURCE.has(raw) ? raw : "";
};

const normalizePlainText = (value) => {
  return toStringSafe(value).replace(/\r?\n/g, "\\n");
};

const normalizeCrmRecord = ({ sourceRow, aiRecord }) => {
  const baseNote = mergeNotes(
    normalizePlainText(aiRecord.crm_note),
    normalizePlainText(aiRecord.description)
  );

  const email = normalizeEmail(aiRecord.email);

  const phoneFields = normalizePhoneFields({
    countryCode: aiRecord.country_code,
    mobile: aiRecord.mobile_without_country_code,
    sourceText: JSON.stringify(sourceRow),
  });

  const extraPhones = extractPhonesFromText(JSON.stringify(sourceRow))
    .filter((item) => item !== phoneFields.e164)
    .slice(0, 3);

  const crmNote = buildCrmNote([
    baseNote,
    extraPhones.length ? `Extra phones: ${extraPhones.join(", ")}` : "",
  ]);

  return {
    created_at: normalizeDate(aiRecord.created_at),
    name: normalizePlainText(aiRecord.name),
    email,
    country_code: phoneFields.country_code,
    mobile_without_country_code: phoneFields.mobile_without_country_code,
    company: normalizePlainText(aiRecord.company),
    city: normalizePlainText(aiRecord.city),
    state: normalizePlainText(aiRecord.state),
    country: normalizePlainText(aiRecord.country),
    lead_owner: normalizePlainText(aiRecord.lead_owner),
    crm_status: normalizeStatus(aiRecord.crm_status),
    crm_note: crmNote,
    data_source: normalizeDataSource(aiRecord.data_source),
    possession_time: normalizePlainText(aiRecord.possession_time),
    description: normalizePlainText(aiRecord.description),
    skip: Boolean(aiRecord.skip),
    skip_reason: normalizePlainText(aiRecord.skip_reason),
  };
};

module.exports = {
  normalizeCrmRecord,
};