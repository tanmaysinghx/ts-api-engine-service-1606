import app from './app.js';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 1606;

(async () => {
  try {
    app.listen(PORT, () => logger.info(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    logger.error('❌ Failed to start server: ' + (err as Error).message);
    process.exit(1);
  }
})();