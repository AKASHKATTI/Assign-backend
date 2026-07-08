module.exports = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
  },
  ai: {
    batchSize: parseInt(process.env.AI_BATCH_SIZE, 10) || 10,
  },
  client: {
    url: process.env.CLIENT_CONNECTION,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
  },
};