import { SQLDatabaseHandler } from "./SQLDatabaseHandler.class.js";
import { Client } from "https://deno.land/x/mysql/mod.ts";

export class MysqlDatabaseHandler extends SQLDatabaseHandler {
  constructor(host, database, username, password, port = 3306) {
    super();
    this.host = host;
    this.port = port;
    this.database = database;
    this.username = username;
    this.password = password;

    /**
     * Set mysql specific data types
     */
    this.type.STRING = "TEXT";

    return (async () => {
      this.client = await new Client().connect({
        hostname: this.host,
        port: this.port,
        db: this.database,
        username: this.username,
        password: this.password
      });
      return this;
    })();
  }

  parseFieldSQL(data, type = null) {
    let returnData = "";
    if(!type) {
      if(data.notNull) {
        returnData = returnData + " NOT NULL";
      }
      if(data.autoIncrement) {
        returnData = returnData + " AUTO_INCREMENT";
      }
      if(data.primary) {
        returnData = returnData + " PRIMARY KEY";
      }

    }
    return returnData;
  }

  async execute(sql) {
    return this.client.execute(sql);
  }
}
