const { parseCsvBuffer } = require("../services/csvParser");
const Account = require("../models/Account");
const { mapBatch } = require("../services/aiMapper");
const { normalizeCrmRecord } = require("../services/normalizer");
const env = require("../config/env");

const previewController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const { headers, rows, totalRows } = parseCsvBuffer(req.file.buffer);
    const previewRows = rows.slice(0, 5);

    res.status(200).json({
      fileName: req.file.originalname,
      totalRows,
      headers,
      previewRows,
    });
  } catch (error) {
    console.error("Error previewing CSV:", error);
    res.status(500).json({ message: error.message || "Failed to preview CSV." });
  }
};

const processController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const { rows: allRows } = parseCsvBuffer(req.file.buffer);
    const batchSize = env.ai.batchSize;
    const totalBatches = Math.ceil(allRows.length / batchSize);

    const importedRecords = [];
    const skippedRecords = [];

    for (let i = 0; i < allRows.length; i += batchSize) {
      const batchRows = allRows.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      const context = {
        fileName: req.file.originalname,
        batchNumber,
        totalBatches,
      };

      const aiRecords = await mapBatch(batchRows, context);

      for (let j = 0; j < aiRecords.length; j++) {
        const sourceRow = batchRows[j];
        const aiRecord = aiRecords[j];

        const normalized = normalizeCrmRecord({ sourceRow, aiRecord });

        if (normalized.skip) {
          skippedRecords.push({
            ...sourceRow,
            __error: normalized.skip_reason || "Skipped by AI",
          });
          continue;
        }

        delete normalized.skip;
        delete normalized.skip_reason;

        try {
          const account = new Account(normalized);
          await account.save();
          importedRecords.push(account.toObject());
        } catch (dbError) {
          skippedRecords.push({
            ...sourceRow,
            __error: `DB Error: ${dbError.message}`,
          });
        }
      }
    }

    res.status(200).json({
      totalRows: allRows.length,
      importedCount: importedRecords.length,
      skippedCount: skippedRecords.length,
      parsedRecords: importedRecords,
      skippedRecords: skippedRecords,
    });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ message: error.message || "Failed to process CSV." });
  }
};

module.exports = {
  previewController,
  processController,
};
