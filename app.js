console.clear();

import "dotenv/config";
import chalk from "chalk";

import Action from "./action.js";

const command = process.argv[2];
const commands = ["list", "add", "delete", "delete-all", "edit", "export", "import", "download"];

const error = chalk.redBright.bold;
const warn = chalk.yellowBright.bold;

if (command) {
   switch (command) {
      case "list":
         Action.list();
         break;
      case "add":
         Action.add();
         break;
      case "delete":
         Action.delete();
         break;
      case "delete-all":
         Action.deleteAll();
         break;
      case "edit":
         Action.edit();
         break;
      case "export":
         Action.export();
         break;
      case "import":
         Action.import();
         break;
      // case "download":
      //    Action.download();
      //    break;

      default:
         console.log(`${error("Unknown command!")} \nAvailable commands are: \n${warn(commands.join("\n"))}`);
         break;
   }
} else {
   console.log(`${error("You must enter a command!")} \nAvailable commands are: \n${warn(commands.join("\n"))}`);
}
