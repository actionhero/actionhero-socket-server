"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actionhero_1 = require("actionhero");
// load any custom code, configure the env, as needed
async function main() {
    // create a new actionhero process
    const app = new actionhero_1.Process();
    // handle unix signals and uncaught exceptions & rejections
    app.registerProcessSignals();
    // start the app!
    // you can pass custom configuration to the process as needed
    await app.start();
}
main();
