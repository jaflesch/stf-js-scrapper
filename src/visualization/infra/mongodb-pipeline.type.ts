type ObjectMap = {
  [key: string]: any;
}

export type MongoDBPipeline = {
  match?: ObjectMap;
  sort?: ObjectMap;
  addFields?: ObjectMap;
  project?: ObjectMap;
  group?: { 
    _id?: ObjectMap;
    fields?: ObjectMap;
  };
}
