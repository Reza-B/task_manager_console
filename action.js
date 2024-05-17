import fs from "fs";

import chalk from "chalk";
import inquirer from "inquirer";

import { parse, stringify } from "csv/sync";

import Task from "./task.js";

const err = chalk.redBright.bold;
const warn = chalk.yellowBright.bold;
const success = chalk.green.bold;

export default class Action {
   static list() {
      const tasks = Task.getAllTasks(true);
      if (tasks.length) {
         console.table(tasks);
      } else {
         console.log(warn("There is not any task!"));
      }
   }
   static async add() {
      const answer = await inquirer.prompt([
         {
            type: "input",
            name: "title",
            message: "Enter task title:",
            validate: (value) => {
               if (value.length < 3) {
                  return "The title must cantain at least 3 letters.";
               }
               return true;
            },
         },
         {
            type: "confirm",
            name: "completed",
            message: "Is this task completed?",
            default: false,
         },
      ]);
      try {
         const task = new Task(answer.title, answer.completed);
         task.save();
      } catch (error) {
         console.log(err(error.message));
      }
   }
   static async delete() {
      const tasks = Task.getAllTasks();
      const choices = [];

      tasks.forEach((task) => {
         choices.push(task.title);
      });

      const answer = await inquirer.prompt({
         type: "list",
         name: "title",
         message: "Select a task to delete:",
         choices,
      });
      try {
         Task.deleteTask(answer.title);
         console.log(success("Selected task deleted successfully."));
      } catch (error) {
         console.log(err(error.message));
      }
   }
   static async deleteAll() {
      const answer = await inquirer.prompt({
         type: "confirm",
         name: "confirm",
         message: "Are you sure?",
         default: false,
      });
      if (answer.confirm) {
         try {
            Task.deleteAllTasks();

            console.log(success("All tasks are deleted successfully."));
         } catch (error) {
            console.log(err("Can not delete all tasks!"));
         }
      } else {
         console.log(warn("canceled!"));
      }
   }
   static async edit() {
      const tasks = Task.getAllTasks();
      const choices = [];

      tasks.forEach((task) => {
         choices.push(task.title);
      });

      const answer = await inquirer.prompt([
         {
            type: "list",
            name: "choice",
            message: "Select a task to delete:",
            choices,
         },
         {
            type: "input",
            name: "title",
            message: "Enter task title:",
            validate: (value) => {
               if (value.length < 3) {
                  return "The title must cantain at least 3 letters.";
               }
               return true;
            },
         },
         {
            type: "confirm",
            name: "completed",
            message: "Is this task completed?",
            default: false,
         },
      ]);
      const task = Task.getTaskByTitle(answer.choice);
      task.title = answer.title;
      task.completed = answer.completed;

      try {
         task.save();
         console.log(success("Task edited successfully"));
      } catch (error) {
         console.log(err("Can not edit this task!"));
      }
   }
   static async export() {
      const answer = await inquirer.prompt({
         type: "input",
         name: "filename",
         message: "Enter output filename:",
         validate: (value) => {
            if (!/^[\w .-]{1,50}$/.test(value)) {
               return "Please enter a valid filename.";
            }
            return true;
         },
      });
      const tasks = Task.getAllTasks(true);
      const output = stringify(tasks, {
         header: true,
         cast: {
            boolean: (value, context) => {
               return String(value);
            },
         },
      });

      try {
         fs.writeFileSync(answer.filename, output);
         console.log(success("Tasks exported successfully!"));
      } catch (error) {
         console.log(err("Can not write to " + answer.filename));
      }
   }
   static async import() {
      const answer = await inquirer.prompt({
         type: "input",
         name: "filename",
         message: "Enter input filename:",
      });

      if (fs.existsSync(answer.filename)) {
         try {
            const input = fs.readFileSync(answer.filename);
            const tasks = parse(input, {
               columns: true,
               cast: (value, context) => {
                  if (context.column === "id") {
                     return Number(value);
                  } else if (context.column === "completed") {
                     return value.toLowerCase() === "true" ? true : false;
                  }
                  return value;
               },
            });

            Task.insertBulkData(tasks);
            console.log(success("Data imported successfully."));
         } catch (error) {}
      } else {
         console.log(err("Specified file does not exists."));
      }
   }
   // static download() {}
}
