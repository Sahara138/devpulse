import { initDB } from './db';
import config from './config';
import app from './app';


const main = ()=>{
    initDB();

    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
}

main();
