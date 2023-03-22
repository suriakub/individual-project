import dotenv from 'dotenv';
import { initializeApi } from './util/initialize-api';

void (async () => {
  try {
    dotenv.config();
    const port = process.env.PORT;

    const api = await initializeApi()

    api.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });

  } catch (e) {
    console.log('Server startup error', e);
    process.exit(1);
  }
})();
