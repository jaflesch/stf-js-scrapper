import 'dotenv/config';
import mongoose, { Model }  from 'mongoose';

interface IQueryBuilder {
  get(data: any): any;
  getById(data: any): any;
  create(data: any): any;
  update(data: any): any;
}

export class QueryBuilder<T> implements IQueryBuilder {
  constructor(
    private readonly model: Model<T>
  ) {
    (async function () {
      await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_TABLENAME}`);
    })();
  }

  $ () {
    return this.model;
  }

  create (data: any) {
    return this.model.create(data);
  }

  get (conditions?: any) {
    return this.model.find(conditions);
  }

  getById (conditions?: any) {
    return this.model.find(conditions);
  }

  update (conditions?: any) {
    return this.model.find(conditions);
  }
}
