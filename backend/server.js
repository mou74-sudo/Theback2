// Local development entry point.
// Imports the shared Express app and starts the HTTP listener on port 3001.
// On Vercel this file is not used — api/index.js exports the app directly.

const app = require("./app");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`TechWork backend running on http://localhost:${PORT}`);
});
