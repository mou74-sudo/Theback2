// Vercel serverless entry point.
// Vercel invokes this file for all routes matched in vercel.json.
// The shared Express app handles routing internally.

const app = require("../backend/app");

module.exports = app;
