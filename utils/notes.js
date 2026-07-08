// server/src/utils/notes.js
const cleanNotePart = (value) => {
  if (!value) return "";
  return String(value).replace(/\r?\n/g, "\\n").trim();
};

const mergeNotes = (...parts) => {
  return parts
    .map(cleanNotePart)
    .filter(Boolean)
    .join(" | ");
};

const buildCrmNote = (parts = []) => {
  return parts
    .map(cleanNotePart)
    .filter(Boolean)
    .join(" | ");
};

module.exports = {
  mergeNotes,
  buildCrmNote,
};