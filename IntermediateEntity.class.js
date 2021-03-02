import {Entity} from "./Entity.class.js";

export class IntermediateEntity extends Entity {
  constructor(handler) {
    super(handler);
  }

  async load() {
    if(this.validate()) {
      let data = await this.handler.select(this.table, {"*": ""}, {where: this.generateWhereThisValues()});
      if(data.rows.length == 1) {
        this.setFieldsFromValues(data.rows[0]);
        await this.loadForeignFields();
        return this;
      } else if(data.rows.length > 0) {
        let entrys = [];
        for(let row in data.rows) {
          let entry = new this.constructor(this.handler);
          entry.setFieldsFromValues(data.rows[row]);
          await entry.loadForeignFields();
          entrys.push(entry);
        }
        return entrys;
      }
    }
    return null;
  }

  async loadForeignFields() {
    for(let field in this.fields) {
      if(this.fields[field].foreign) {
        this[this.fields[field].foreign] = await this.oneToOne(field, this.fields[field]);
      }
    }
  }
}
