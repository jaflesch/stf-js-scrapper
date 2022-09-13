const fs = require('fs');
const path = require('path');
import 'dotenv/config';
import mongoose from "mongoose";
import { exit } from 'process';
import { Judgement } from "./models/judgement.model";
import { JSONtoModel } from "./query-builder/utils";

main()
  .then(() => exit())
  .catch(err => console.log(err));

async function main() {
  const db = await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_TABLENAME}`);
  const con = db.connection;

  const jsonFilePath = '../db/__2010.merge.json';
  const jsonData = fs.readFileSync(path.join(__dirname, jsonFilePath));
  let acordaos: any = [];
  acordaos = acordaos.concat(...JSON.parse(jsonData));
  
  const judgementIds = new Set([
    ...(
      await Judgement.find().select('id').exec()
    ).map(j => j.id)
  ]);
  
  let count = 0;
  let repeated = 0;
  for (const acordao of acordaos) {
    if (judgementIds.has(acordao.id)) {
      repeated++;
      continue;
    }

    const row = new Judgement(
      JSONtoModel(acordao)
    );       
    
    const result = await row.save();
    console.log('Inserted row with ID: ', result?._id.valueOf());
    count++;
  }
  con.close();

  console.log(`### Finished with: [${count}/${acordaos.length}] insertions.`);
}
