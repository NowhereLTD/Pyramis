
export class Entity {
  constructor(handler) {
    this.handler = handler;

    this.fields = {
      id: {
        type: this.handler.type.INT,
        notNull: true,
        autoIncrement: true,
        primary: true,
        ignoreAsSetter: true
      }
    }

    this.imports = {};

    this.table = this.upperCaseToSnakeCase(this.constructor.name);
  }

  /**
   * Statements for the Table
   */


   /**
    * createTable - Create the database table for entity
    *
    * @returns {type} Description
    */
   async createTable() {
     if(this.validate()) {
       return await this.handler.createTable(this.table, this.fields);
     }
     return null;
   }

   /**
    * deleteTable - Delete the table for entity
    *
    * @returns {type} Description
    */
   async deleteTable() {
     if(this.validate()) {
       return await this.handler.deleteTable(this.table);
     }
     return null;
   }


  /**
   * Statements for one entry
   */

  /**
   * create - Insert the entry
   *
   * @returns {type} Description
   */
  async create() {
    if(this.validate()) {
      let data = await this.handler.insert(this.table, this.generateSetValues());
      this.id = data.lastInsertId;
      return data;
    }
    return null;
  }

  /**
   * load - Load a entity
   *
   * @returns {type} Description
   */
  async load() {
    if(this.validate()) {
      let data = await this.handler.select(this.table, {"*": ""}, {where: this.generateWhereThisValues()});
      if(data.rows.length == 1) {
        this.setFieldsFromValues(data.rows[0]);
        return this;
      } else if(data.rows.length > 0) {
        let entrys = [];
        for(let row in data.rows) {
          let entry = new this.constructor(this.handler);
          entry.setFieldsFromValues(data.rows[row]);
          entrys.push(entry);
        }
        return entrys;
      }
    }
    return null;
  }

  /**
   * update - Update the entry
   *
   * @returns {type} Description
   */
  async update() {
    if(this.validate()) {
      return await this.handler.update(this.table, this.generateSetValues(), this.generateWhereThisValues());
    }
    return null;
  }

  /**
   * delete - Delete a entity
   *
   * @returns {type} Description
   */
  async delete() {
    if(this.validate()) {
      return await this.handler.delete(this.table, this.generateWhereThisValues());
    }
    return null;
  }


  /**
   * Other methods
   */

   /**
    * paginate - Get all entitys with and paginate it
    *
    * @param {Int}   limit  The maximum loading entitys
    * @param {Int} [page=0] The acually page for pagination
    *
    * @returns {type} Description
    */
   async paginate(limit, page = 0) {
     if(this.validate()) {
       let startValue = page * limit;
       let data = await this.handler.select(this.table, {"*": ""}, {}, {}, {start: startValue, count: limit});
       let entrys = [];
       for(let row in rows) {
         let entry = new this.constructor(this.handler);
         entry.setFieldsFromValues(rows[row]);
         entrys.push(entry);
       }
       return entrys;
     }
     return null;
   }


   async oneToOne(name, field) {
     let data = await this.oneToN(name, field);
     if(data instanceof Array) {
       return null;
     }
     return data;
   }

   async oneToN(name, field) {
     if(!field.foreign) {
       return null;
     }
     let entityName = this.snakeCaseToUpperCase(field.foreign);
     let ForeignInstance = new this.imports[entityName](this.handler);
     let locField = this[name];
     let foreignField = "id";
     if(field.foreignLocField) {
       locField = this[field.foreignLocField];
     }
     if(field.foreignField) {
       foreignField = field.foreignField;
     }

     ForeignInstance[foreignField] = locField;
     return await ForeignInstance.load();
   }

   /*async mToN(field) {
     let entityName = this.snakeCaseToUpperCase(field.foreign);
     let ForeignInstance = new this.imports[entityName](this.handler);
     let intermediateTable = this.table + "_" + field.foreign;
     let intermediateTableEntityName = this.snakeCaseToUpperCase(this.snakeCaseToUpperCase(field.foreign));
     let IntermediateTableInstance = new this.imports[intermediateTableEntityName](this.handler);
     IntermediateTableInstance[this.table + "_" + "id"] = this.id;
     let objects = await IntermediateTableInstance.load();
     let elements = [];
     for(let object of objects) {
       object
     }

   }*/


  /**
   * Helper Methods
   */

  /**
   * generateSetValues - Generate a set value JSON set for this value
   *
   * @returns {type} Description
   */
  generateSetValues() {
    let setValues = {};
    for(let field in this.fields) {
      if(this.fields[field].ignoreAsSetter) {
        continue;
      }
      if(this[field] != null) {
        // TODO: Validate and parse the values type?
        setValues[field] = this[field];
      }else if(this.fields[field].notNull) {
        // Throw exception
        return null;
      }
    }
    return setValues;
  }

  /**
   * generateWhereThisValues - Generate a where JSON for this entry
   *
   * @returns {type} Description
   */
  generateWhereThisValues() {
    let whereThisValues = {};
    for(let field in this.fields) {
      if(this.fields[field].primary) {
        if(this[field] != null) {
          whereThisValues[field] = this[field];
        }
      }
    }
    return whereThisValues;
  }

  /**
   * setFieldsFromValues - Set the fields from a values data set
   *
   * @param {JSON} values A list of values
   *
   * @returns {type} Description
   */
  setFieldsFromValues(values) {
    for(let field in this.fields) {
      if(values[field]) {
        this[field] = values[field];
      }
    }
    return true;
  }

  /**
   * upperCaseToSnakeCase - Parse a string from UpperCase to snake_case
   *
   * @param {String} name The string to parse
   *
   * @returns {String} Description
   */
  upperCaseToSnakeCase(name) {
    let upperCaseRegex = new RegExp(/([A-Z])/, "g");
    let parseName = name.replace(/([A-Z])/, function(match, p1) {
      return p1.toLowerCase();
    });
    let snakeName = parseName.replace(upperCaseRegex, function(match, p1) {
      return "_" + p1.toLowerCase();
    });
    return snakeName;
  }

  /**
   * snakeCaseToUpperCase - Parse a string from snake_case to UpperCase
   *
   * @param {String} name The string to parse
   *
   * @returns {String} Description
   */
  snakeCaseToUpperCase(name) {
    let snakeCaseRegex = new RegExp(/_([a-z])/, "g");
    let parseName = name.replace(/([a-z])/, function(match, p1) {
      return p1.toUpperCase();
    });
    let upperName = parseName.replace(snakeCaseRegex, function(match, p1) {
      return p1.toUpperCase();
    });
    return upperName;
  }

  /**
   * validate - Validate the entity before start a sql request
   *
   * @returns {type} Description
   */
  validate() {
    if(!this.table) {
      return false;
    }

    return true;
  }
}
