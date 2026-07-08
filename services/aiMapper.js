// server/src/services/aiMapper.js
const { GoogleGenAI } = require("@google/genai");
const env = require("../config/env");

const genAI = env.gemini.apiKey ? new GoogleGenAI({ apiKey: env.gemini.apiKey }) : null;

const buildPrompt = (rows, context = {}) => {
  return `
You are an expert CRM data extraction system.

Extract GrowEasy CRM records from messy CSV rows.

Rules:
1. Return exactly one output object for each input row, preserving input order.
2. Only use these crm_status values when confident:
   - GOOD_LEAD_FOLLOW_UP
   - DID_NOT_CONNECT
   - BAD_LEAD
   - SALE_DONE
   Otherwise return "".
3. Only use these data_source values when confident:
   - leads_on_demand
   - meridian_tower
   - eden_park
   - varah_swamy
   - sarjapur_plots
   Otherwise return "".
4. If multiple emails exist, use the first as email and append the rest to crm_note.
5. If multiple mobile numbers exist, use the first as mobile_without_country_code and append the rest to crm_note.
6. Put remarks, comments, follow-up notes, extra emails, extra phones, and leftover useful context into crm_note.
7. If no confident value exists for a field, return "".
8. If a row has neither email nor mobile number, set skip=true and provide skip_reason.
9. created_at should be parseable by JavaScript Date if possible.
10. Return strict JSON only.

Context:
fileName: ${context.fileName || ""}
headers: ${JSON.stringify(context.headers || [])}
batchNumber: ${context.batchNumber || 1}
totalBatches: ${context.totalBatches || 1}

Input rows:
${JSON.stringify(rows, null, 2)}
`.trim();
};

const responseSchema = {
  type: "object",
  properties: {
    records: {
      type: "array",
      items: {
        type: "object",
        properties: {
          created_at: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          country_code: { type: "string" },
          mobile_without_country_code: { type: "string" },
          company: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          lead_owner: { type: "string" },
          crm_status: { type: "string" },
          crm_note: { type: "string" },
          data_source: { type: "string" },
          possession_time: { type: "string" },
          description: { type: "string" },
          skip: { type: "boolean" },
          skip_reason: { type: "string" },
        },
        required: [
          "created_at",
          "name",
          "email",
          "country_code",
          "mobile_without_country_code",
          "company",
          "city",
          "state",
          "country",
          "lead_owner",
          "crm_status",
          "crm_note",
          "data_source",
          "possession_time",
          "description",
          "skip",
          "skip_reason",
        ],
      },
    },
  },
  required: ["records"],
};

const mapBatch = async (rows, context = {}) => {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const prompt = buildPrompt(rows, context);

  const response = await genAI.models.generateContent({
    model: env.gemini.model || "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  let parsed;

  try {
    parsed = JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini Raw Response:\n", response.text);
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!parsed.records || !Array.isArray(parsed.records)) {
    throw new Error("Invalid Gemini response format.");
  }

  if (parsed.records.length !== rows.length) {
    throw new Error(
      `Expected ${rows.length} records but received ${parsed.records.length}.`
    );
  }

  return parsed.records;
};

module.exports = {
  mapBatch,
};