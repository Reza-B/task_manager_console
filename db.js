import fs from "fs";

const filename = process.env.DB_FILE;

export default class DB {
   static createDB() {
      if (fs.existsSync(filename)) {
         // log(warn("Data base file already exists!"));
         return false;
      } else {
         try {
            fs.writeFileSync(filename, "[]", "utf-8");
            // log(success(`Data base file created successfully.`));
            return true;
         } catch (e) {
            throw new Error(`Can not write in ${filename}!`);
         }
      }
   }
   static resetDB() {
      try {
         fs.writeFileSync(filename, "[]", "utf-8");
         return true;
      } catch (e) {
         throw new Error(`Can not write in ${filename}!`);
      }
   }
   static DBExists() {
      return fs.existsSync(filename);
   }
   static getTaskById(id) {
      let data;
      if (DB.DBExists()) {
         try {
            data = fs.readFileSync(filename, "utf-8");
         } catch (error) {
            throw new Error("Can not read file!");
         }
      } else {
         try {
            DB.createDB();
            return false;
         } catch (error) {
            throw new Error(error.message);
         }
      }

      try {
         data = JSON.parse(data);
         const task = data.find((t) => t.id === Number(id));
         return task ? task : false;
      } catch (error) {
         throw new Error("Syntax error.\n Please check DB file!");
      }
   }
   static getTaskByTitle(title) {
      let data;
      if (DB.DBExists()) {
         data = fs.readFileSync(filename, "utf-8");
      } else {
         try {
            DB.createDB();
            return false;
         } catch (error) {
            throw new Error(error.message);
         }
      }

      try {
         data = JSON.parse(data);
         const task = data.find((t) => t.title === title);
         return task ? task : false;
      } catch (error) {
         throw new Error("Syntax error.\n Please check DB file!");
      }
   }
   static getAllTasks() {
      let data;
      if (DB.DBExists()) {
         data = fs.readFileSync(filename, "utf-8");
      } else {
         try {
            DB.createDB();
         } catch (error) {
            throw new Error(error.message);
         }
         return false;
      }

      try {
         return JSON.parse(data);
      } catch (error) {
         throw new Error("Syntax error.\n Please check DB file!");
      }
   }
   static saveDB(data) {
      try {
         fs.writeFileSync(filename, data);
      } catch (error) {
         throw new Error("Can not write in file!");
      }
   }
   static saveTask(title, completed = false, id = 0) {
      id = Number(id);
      if (id < 0 || id !== parseInt(id)) {
         throw new Error("Id must be an integer, equal or greater than zero!");
      } else if (typeof title !== "string" || title.length < 3) {
         throw new Error("Title must contain at least 3 letters!");
      }
      let task = DB.getTaskByTitle(title);
      if (task && task.id != id) {
         throw new Error("A task exists with this title!");
      }

      let data = [];
      if (this.DBExists()) {
         try {
            data = this.getAllTasks();
         } catch (error) {
            throw new Error(error.message);
         }
      } else {
         try {
            this.createDB();
         } catch (error) {
            throw new Error(error.message);
         }
      }
      if (id === 0) {
         if (data.length === 0) {
            id = 1;
         } else {
            id = data[data.length - 1].id + 1;
         }
         data.push({
            id,
            title,
            completed,
         });
         DB.saveDB(JSON.stringify(data));
         return id;
      } else {
         for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
               data[i].title = title;
               data[i].completed = completed;
               try {
                  DB.saveDB(JSON.stringify(data));
                  return id;
               } catch (error) {
                  throw new Error("Can not save the task!");
               }
            }
         }
         throw new Error("File not found!");
      }
   }
   static insertBulkData(data) {
      if (typeof data === "string") {
         try {
            data = JSON.parse(data);
         } catch (error) {
            throw new Error("Invalid data.");
         }
      }
      if (data instanceof Array) {
         try {
            data = JSON.stringify(data);
         } catch (error) {
            throw new Error("Invalid data.");
         }
      }
      try {
         this.saveDB(data);
      } catch (error) {
         throw new Error(error.message);
      }
   }
   static deleteTask(title) {
      let data;
      try {
         data = this.getAllTasks();
      } catch (error) {
         throw new Error(error.message);
      }

      for (let i = 0; i < data.length; i++) {
         if (data[i].title === title) {
            data.splice(i, 1);
            try {
               this.saveDB(JSON.stringify(data));
               return true;
            } catch (error) {
               throw new Error(error.message);
            }
         }
      }
      return false;
   }
}
