require('dotenv').config();
const app = require('./src/app');
const connectMongo = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Database
connectMongo().then(() => {
  // Start Express Server listening
  app.listen(PORT, () => {
    console.log(`
🚀 ========================================== 🚀
   AI Thumbnail Studio Server is Booted!
   Listening on Port: ${PORT}
   Health Check: http://localhost:${PORT}/health
🚀 ========================================== 🚀
    `);
  });
}).catch(err => {
  console.error('Failed to start server due to connection issues:', err.message);
  process.exit(1);
});
