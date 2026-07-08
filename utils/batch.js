// server/src/utils/batch.js
const chunkArray = (items = [], size = 10) => {
  const safeSize = Math.max(1, Number(size) || 10);
  const chunks = [];

  for (let i = 0; i < items.length; i += safeSize) {
    chunks.push(items.slice(i, i + safeSize));
  }

  return chunks;
};

module.exports = {
  chunkArray,
};