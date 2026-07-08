import { initDB } from './db';
import config from './config';
import app from './app';


const main = async () => {
  await initDB();

  app.listen(config.port, () => {
    console.log(`Server running on ${config.port}`);
  });
};

main();
