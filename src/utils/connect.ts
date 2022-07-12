import mongoose from 'mongoose';

import logger from '@/utils/logger';
import { Config } from '@/config/config';

const config = Config.getConfig();

async function connect() {
  // const dbUri = process.env.DB_CONN_STRING as string;
  const dbUri = config.get('DB_CONN_STRING') as string;

  // 或者
  // return mongoose
  //   .connect(dbUri)
  //   .then(() => {
  //     console.log(`Connected to DB ${dbUri}`);
  //   })
  //   .catch((error) => {
  //     console.log(`Could not connect to DB ${dbUri} ${error}`);
  //     process.exit(1);
  //   });

  try {
    await mongoose.connect(dbUri);
  } catch (error) {
    logger.info(`Connected to DB ${dbUri}`);
    process.exit(1);
  }
}

export default connect;
