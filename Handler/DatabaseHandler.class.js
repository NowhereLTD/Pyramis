
export class DatabaseHandler {
  /**
   * createTable - Create a new table
   *
   * @param {String} name   Description
   * @param {JSON} fields Description
   *
   * @returns {type} Description
   */
  async createTable(name, fields) {
    let tableName = this.escape(name);
    let tableFields = this.escapeFields(fields);
    return await this.createDatabaseTable(tableName, tableFields);
  }


  /**
   * createDatabaseTable - Generate the specific sql to create the table
   *
   * @param {String} name   Description
   * @param {JSON} fields Description
   *
   * @returns {type} Description
   */
  async createDatabaseTable(name, fields) {
    return null;
  }


  /**
   * deleteTable - Delete a table in database
   *
   * @param {String} name Description
   *
   * @returns {type} Description
   */
  async deleteTable(name) {
    let tableName = this.escape(name);
    return await this.deleteDatabaseTable(tableName);
  }


  /**
   * deleteDatabaseTable - Generate the specific sql to delete the table
   *
   * @param {String} name Description
   *
   * @returns {type} Description
   */
  async deleteDatabaseTable(name) {
    let sql = "DROP TABLE " + name;
    return await this.execute(sql);
  }


  /**
   * insert - Insert a new record into a table
   *
   * @param {String} table   Description
   * @param {JSON} fields Description
   *
   * @returns {type} Description
   */
  async insert(table, fields) {
    let tableName = this.escape(table);
    let tableFields = this.escapeFields(fields);
    return await this.insertIntoTable(tableName, tableFields);
  }


  /**
   * insertIntoTable - Generate the specific sql to run the insert
   *
   * @param {String} table  Description
   * @param {JSON} fields Description
   *
   * @returns {type} Description
   */
  async insertIntoTable(table, fields) {
    return null;
  }

  /**
   * select - Description
   *
   * @param {String}   table            Description
   * @param {JSON}   columnFields     Description
   * @param {JSON} [whereFields={}] Description
   * @param {JSON} [orderFields={}] Description
   *
   * @returns {type} Description
   */
  async select(table, columnFields, options = {}) {
    let whereFields = {};
    let orderFields = {};
    let limitFields = {};
    if(options.where) {
      whereFields = options.where;
    }
    if(options.order) {
      orderFields = options.order;
    }
    if(options.limit) {
      limitFields = options.limit;
    }
    let tableName = this.escape(table);
    let columnFieldList = this.escapeFields(columnFields);
    let whereFieldList = this.escapeFields(whereFields);
    let orderFieldList = this.escapeFields(orderFields);
    let limitFieldList = this.escapeFields(limitFields);
    return await this.selectFromTable(tableName, columnFieldList, whereFieldList, orderFieldList, limitFieldList);
  }

  /**
   * selectFromTable - Description
   *
   * @param {String} table        Description
   * @param {JSON} columnFields Description
   * @param {JSON} whereFields  Description
   * @param {JSON} orderFields  Description
   *
   * @returns {type} Description
   */
  async selectFromTable(table, columnFields, whereFields, orderFields, limitFields) {
    return null;
  }


  /**
   * update - Update a entry in table
   *
   * @param {String}   table            Description
   * @param {JSON}   columnFields     Description
   * @param {JSON} [whereFields={}] Description
   *
   * @returns {type} Description
   */
  async update(table, columnFields, whereFields = {}) {
    let tableName = this.escape(table);
    let columnFieldList = this.escapeFields(columnFields);
    let whereFieldList = this.escapeFields(whereFields);
    return await this.updateTableEntry(tableName, columnFieldList, whereFieldList);
  }


  /**
   * updateTableEntry - Update a entry in table
   *
   * @param {String} table        Description
   * @param {JSON} columnFields Description
   * @param {JSON} whereFields  Description
   *
   * @returns {type} Description
   */
  async updateTableEntry(table, columnFields, whereFields) {
    return null;
  }


  /**
   * delete - Delete a entry in table
   *
   * @param {String}   table            Description
   * @param {JSON} [whereFields={}] Description
   *
   * @returns {type} Description
   */
  async delete(table, whereFields = {}) {
    let tableName = this.escape(table);
    let whereFieldList = this.escapeFields(whereFields);
    return await this.updateTableEntry(tableName, whereFieldList);
  }


  /**
   * deleteTableEntry - Delete a entry in table
   *
   * @param {String} table       Description
   * @param {JSON} whereFields Description
   *
   * @returns {type} Description
   */
  async deleteTableEntry(table, whereFields) {
    return null;
  }


  /**
   * escapeFields - escape a json 1 dimensional array
   *
   * @param {JSON} fields Description
   *
   * @returns {JSON} Description
   */
  escapeFields(fields) {
    let cacheFields = {};

    for(let key in fields) {
      let preparedKey = this.escape(key);
      if(typeof(fields[key]) == "object") {
        cacheFields[preparedKey] = {};
        for(let propertyKey in fields[key]) {
          let preparedProperty = this.escape(fields[key][propertyKey].toString());
          cacheFields[preparedKey][propertyKey] = preparedProperty;
        }
      }else {
        cacheFields[preparedKey] = fields[key];
      }
    }
    return cacheFields;
  }

  /**
   * escape - Prepare a dataset to escape sql
   *
   * @param {String} data the value
   *
   * @returns {String} the prepared value
   */
  escape(data) {
    return data.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case "\0":
          return "\\0";
        case "\x08":
          return "\\b";
        case "\x09":
          return "\\t";
        case "\x1a":
          return "\\z";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%":
          return "\\"+char;
        default:
          return char;
      }
    });
  }
}
