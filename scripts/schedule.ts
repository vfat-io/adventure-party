import { displayStatus, runParty } from "./common";

const cron = require('node-cron');

cron.schedule(process.env.CRON, async ()=> {
    console.log("Run time: ", new Date().toLocaleString());

    await runParty();
    await displayStatus();
});