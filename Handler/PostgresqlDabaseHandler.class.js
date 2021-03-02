import { SQLDatabaseHandler } from "./SQLDatabaseHandler.class.js";
import { Client } from "https://deno.land/x/postgres/mod.ts";

export class PostgresqlDatabaseHandler extends SQLDatabaseHandler {
  constructor(host, database, username, password, port = 5432) {
    super();
    this.host = host;
    this.port = port;
    this.database = database;
    this.username = username;
    this.password = password;

    return (async () => {
      this.client = new Client({
        hostname: this.host
        port: this.port,
        database: this.database,
        user: this.username,
        password: this.password
      });

      return this;
    })();
  }

  execute(sql) {
    return await this.client.queryArray(sql);
  }
}
