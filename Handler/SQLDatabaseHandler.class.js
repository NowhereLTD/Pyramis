import { DatabaseHandler } from "./DatabaseHandler.class.js";

export class SQLDatabaseHandler extends DatabaseHandler {
  constructor(host, database, username, password, port) {
    super();

    this.type = {
      INT: "INT",
      BIGINT: "BIGINT",
      STRING: "TEXT",
      BOOLEAN: "BOOLEAN",
      BIT: "BIT",
      VARBIT: "VARBIT",
      CHAR: "CHAR",
      VARCHAR: "VARCHAR",
      DATE: "DATE",
      FLOAT: "FLOAT8",
      INTERVAL: "INTERVAL",
      NUMERIC: "DECIMAL",
      REAL: "FLOAT4",
      SMALLINT: "SMALLINT",
      TIME: "TIME"
    }
  }

  async createDatabaseTable(name, fields) {
    let fieldsSQL = "";
    let appendSQL = "";

    for(let field in fields) {
      if(fieldsSQL == "") {
        fieldsSQL = fieldsSQL + "(";
      }else {
        fieldsSQL = fieldsSQL + ", ";
      }

      fieldsSQL = fieldsSQL + field + " ";
      let parseType = this.parseFieldSQL(fields[field].type, "type");
      if(parseType) {
        fieldsSQL = fieldsSQL + parseType;
      } else {
        fieldsSQL = fieldsSQL + fields[field].type;
      }

      if(fields[field].size) {
        let parseSize = this.parseFieldSQL(fields[field].size, "size");
        if(parseSize) {
          fieldsSQL = fieldsSQL + parseSize;
        } else {
          fieldsSQL = fieldsSQL + "(" + fields[field].size + ")";
        }
      }

      if(fields[field].foreign) {
        if(fieldsSQL != "") {
          fieldsSQL = fieldsSQL + ", ";
        }
        fieldsSQL = fieldsSQL + " FOREIGN KEY ";
        if(fields[field].foreignLocField) {
          fieldsSQL = fieldsSQL + "(" + fields[field].foreignLocField + ")";
        } else {
          fieldsSQL = fieldsSQL + "(" + field + ")";
        }

        fieldsSQL = fieldsSQL + " REFERENCES " + fields[field].foreign;

        if(fields[field].foreignField) {
          fieldsSQL = fieldsSQL + "(" + fields[field].foreignField + ")";
        } else {
          fieldsSQL = fieldsSQL + "(id)";
        }

        if(!fields[field].foreignNotUpdate) {
          fieldsSQL = fieldsSQL + " ON UPDATE CASCADE";
        }

        if(!fields[field].foreignNotDelete) {
          fieldsSQL = fieldsSQL + " ON DELETE CASCADE";
        }
      }

      fieldsSQL = fieldsSQL + this.parseFieldSQL(fields[field]);
    }

    if(fieldsSQL != "") {
      fieldsSQL = fieldsSQL + ")";
    }

    let sql = "CREATE TABLE IF NOT EXISTS " + name + " " + fieldsSQL + appendSQL + ";";
    return await this.execute(sql);
  }

  parseFieldSQL(data, type) {
    return "";
  }

  async deleteDatabaseTable(name) {
    let sql = "DROP TABLE " + name;
    return await this.execute(sql);
  }

  async insertIntoTable(table, fields) {
    let fieldsSQL = "";
    let valuesSQL = "";

    for(let field in fields) {
      if(fieldsSQL == "") {
        fieldsSQL = fieldsSQL + "(";
        valuesSQL = valuesSQL + " VALUES (";
      }else {
        fieldsSQL = fieldsSQL + ", ";
        valuesSQL = valuesSQL + ", ";
      }

      fieldsSQL = fieldsSQL + field;
      valuesSQL = valuesSQL + "'" + fields[field] + "'";
    }

    if(fieldsSQL != "") {
      fieldsSQL = fieldsSQL + ")";
    }
    if(valuesSQL != "") {
      valuesSQL = valuesSQL + ")";
    }

    let sql = "INSERT INTO " + table + " " + fieldsSQL + valuesSQL + ";";
    return await this.execute(sql);
  }

  async selectFromTable(table, columnFields, whereFields, orderFields, limitFields) {
    let columnSQL = "";
    let whereSQL = "";
    let orderSQL = "";
    let limitSQL = "";

    for(let column in columnFields) {
      if(columnSQL != "") {
        columnSQL = columnSQL + ", ";
      }

      if(columnFields[column].count) {
        columnSQL = columnSQL + "COUNT(" + column + ")";
      } else if(columnFields[column].min) {
        columnSQL = columnSQL + "MIN(" + column + ")";
      } else if(columnFields[column].max) {
        columnSQL = columnSQL + "MAX(" + column + ")";
      } else if(columnFields[column].avg) {
        columnSQL = columnSQL + "AVG(" + column + ")";
      } else if(columnFields[column].sum) {
        columnSQL = columnSQL + "SUM(" + column + ")";
      } else {
        columnSQL = columnSQL + column;
      }
    }

    whereSQL = this.generateWhereStatement(whereFields);

    for(let order in orderFields) {
      if(orderSQL != "") {
        orderSQL = orderSQL + ", ";
      }

      orderSQL = orderSQL + order;
      if(orderFields[order].asc) {
        orderSQL = orderSQL + " ASC";
      } else if(orderFields[order].desc) {
        orderSQL = orderSQL + " DESC";
      }
    }

    if(limitFields) {
      if(limitFields.start && limitFields.count) {
        limitSQL = limitSQL + limitFields.start + ", " + limitFields.count;
      } else if(limitFields.count) {
        limitSQL = limitSQL + limitFields.count;
      }
    }

    let sql = "SELECT " + columnSQL + " FROM " + table;
    if(whereSQL != "") {
      sql = sql + " WHERE " + whereSQL;
    }
    if(orderSQL != "") {
      sql = sql + " ORDER BY " + orderSQL;
    }
    if(limitSQL != "") {
      sql = sql + " LIMIT " + limitSQL;
    }
    sql = sql + ";";
    return await this.execute(sql);
  }

  async updateTableEntry(table, columnFields, whereFields) {
    let columnSQL = "";
    let whereSQL = "";

    for(let column in columnFields) {
      if(columnSQL != "") {
        columnSQL = columnSQL + ", ";
      }

      columnSQL = columnSQL + column + "=" + "'" + columnFields[column] + "'";
    }

    whereSQL = this.generateWhereStatement(whereFields);
    let sql = "UPDATE " + table + " SET " + columnSQL;
    if(whereSQL != "") {
      sql = sql + " WHERE " + whereSQL;
    }
    sql = sql + ";";
    return await this.execute(sql);
  }

  async deleteTableEntry(table, whereFields) {
    let whereSQL = "";

    whereSQL = this.generateWhereStatement(whereFields);
    let sql = "DELETE FROM " + table;
    if(whereSQL != "") {
      sql = sql + " WHERE " + whereSQL;
    }
    sql = sql + ";";
    return await this.execute(sql);
  }


  generateWhereStatement(whereFields) {
    let whereSQL = "";

    for(let where in whereFields) {
      if(whereSQL != "") {
        if(whereFields[where].or) {
          whereSQL = whereSQL + " OR ";
        } else {
          whereSQL = whereSQL + " AND ";
        }
      }

      if(whereFields[where]) {
        if(whereFields[where].not) {
          whereSQL = whereSQL + "NOT ";
        }

        whereSQL = whereSQL + where;
        if(whereFields[where].operator) {
          whereSQL = whereSQL + " " + whereFields[where].operator + " ";
        } else {
          whereSQL = whereSQL + "=";
        }

        if(whereFields[where].value) {
          whereSQL = whereSQL + "'" + whereFields[where].value + "'";
        } else {
          whereSQL = whereSQL + "'" + whereFields[where] + "'";
        }
      }
    }
    return whereSQL;
  }

  async execute(sql) {
    console.log(sql);
    return null;
  }
}
