const Lead = require("../models/Leads");
const Upload = require("../models/Uploads");

const { chunkArray } = require("../utils/batch");
const aiMapper = require("./aiMapper");
const normalizer = require("./normalizer");
const validators = require("../utils/validators");
const env = require("../config/env");

const processBatch = async (batchRows, context) => {
  const aiResults = await aiMapper.mapBatch(batchRows, context);

  const parsedRecords = [];
  const skippedRecords = [];

  for (let i = 0; i < batchRows.length; i += 1) {
    const sourceRow = batchRows[i];
    const aiRecord = aiResults[i] || {};

    const normalized = normalizer.normalizeCrmRecord({
      sourceRow,
      aiRecord,
    });

    const validation = validators.validateCrmRecord(normalized);

    if (!validation.valid) {
      skippedRecords.push({
        rowNumber: sourceRow.__rowNumber,
        reason: validation.reason,
        sourceRow,
      });
      continue;
    }

    parsedRecords.push({
      rowNumber: sourceRow.__rowNumber,
      ...normalized,
    });
  }

  return {
    parsedRecords,
    skippedRecords,
  };
};

const processRows = async (rows, context = {}) => {
  const batches = chunkArray(rows, env.ai.batchSize);

  const parsedRecords = [];
  const skippedRecords = [];

  for (let index = 0; index < batches.length; index += 1) {
    const batchRows = batches[index];

    try {
      const result = await processBatch(batchRows, {
        ...context,
        batchNumber: index + 1,
        totalBatches: batches.length,
      });

      

      parsedRecords.push(...result.parsedRecords);
      skippedRecords.push(...result.skippedRecords);
    } catch (error) {
      batchRows.forEach((row) => {
        skippedRecords.push({
          rowNumber: row.__rowNumber,
          reason: `Batch processing failed: ${error.message}`,
          sourceRow: row,
        });
      });
    }
  }

  let savedLeads = [];

  if (parsedRecords.length > 0) {
    const docsToInsert = parsedRecords.map(({ rowNumber, ...record }) => record);
    savedLeads = await Lead.insertMany(docsToInsert, { ordered: false });
  }

  const uploadDoc = await Upload.create({
    fileName: context.fileName || "unknown.csv",
    totalRows: rows.length,
    importedRows: savedLeads.length,
    skippedRows: skippedRecords.length,
  });

  return {
    uploadId: uploadDoc._id,
    totalRows: rows.length,
    importedCount: savedLeads.length,
    skippedCount: skippedRecords.length,
    parsedRecords: savedLeads,
    skippedRecords,
  };
};

module.exports = {
  processRows,
};