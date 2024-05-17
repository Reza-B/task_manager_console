import util from "util";

import chalk from "chalk";

import DB from "./db.js";

export default class Task {
   #id = 0;
   #title;
   #completed;
   constructor(title, completed = false) {
      this.title = title;
      this.completed = completed;
   }
   get id() {
      return this.#id;
   }
   get title() {
      return this.#title;
   }
   set title(value) {
      if (typeof value !== "string" || value.length < 3) {
         throw new Error("title must contain at least 3 letters!");
      }
      this.#title = value;
   }
   get completed() {
      return this.#completed;
   }
   set completed(value) {
      this.#completed = Boolean(value);
   }
   [util.inspect.custom]() {
      return ` Task {
         ID : ${chalk.yellowBright(this.id)},
         Title : ${chalk.green('"' + this.title + '"')},
         Completed : ${chalk.blueBright(this.completed)}
      }
      `;
   }
   save() {
      try {
         this.#id = DB.saveTask(this.#title, this.#completed, this.#id);
      } catch (error) {
         throw new Error(error.message);
      }
   }
   static getTaskById(id) {
      const task = DB.getTaskById(id);
      if (task) {
         const item = new Task(task.title, task.completed);
         item.#id = task.id;
         return item;
      } else {
         return false;
      }
   }
   static getTaskByTitle(title) {
      const task = DB.getTaskByTitle(title);
      if (task) {
         const item = new Task(task.title, task.completed);
         item.#id = task.id;
         return item;
      } else {
         return false;
      }
   }
   static getAllTasks(rawObject = false) {
      const tasks = DB.getAllTasks();

      if (rawObject) {
         return tasks;
      }
      if (tasks) {
         let items = [];
         let item;
         tasks.forEach((task) => {
            item = new Task(task.title, task.completed);
            item.#id = task.id;
            items.push(item);
         });
         return items;
      } else {
         return false;
      }
   }
   static deleteTask(title) {
      try {
         DB.deleteTask(title);
      } catch (error) {
         throw new Error(error.message);
      }
   }
   static deleteAllTasks() {
      try {
         DB.resetDB();
      } catch (error) {
         throw new Error(error.message);
      }
   }
   static insertBulkData(data) {
      try {
         DB.insertBulkData(data);
      } catch (error) {
         throw new Error(error.message);
      }
   }
}
