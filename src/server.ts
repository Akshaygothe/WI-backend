/** @format */

import { app } from "./app";
import { config } from "./config";
import { connectDB } from "./db";
import { logger } from "./utils/logger";

(async () => {
  try {
    await connectDB(config.mongoUri);
    app.listen(config.port, () =>
      logger.info(`Server on http://localhost:${config.port}`),
    );
  } catch (e) {
    logger.error(e, "failed to start");
    process.exit(1);
  }
})();
