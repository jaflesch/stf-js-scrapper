import 'dotenv/config';
import fs from 'fs';
import path  from 'path';
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

  const mergeFilesFolder = fs.readdirSync(path.join(__dirname, '../db/'));
  const mergeFiles = mergeFilesFolder.filter(mf => mf.match(/\.merge\.json$/))
  
  let count = 0;
  let repeated = 0;

  for (const mergeFile of mergeFiles) {
    let acordaos: any = [];
    const jsonData = fs.readFileSync(path.join(__dirname, '../db/', mergeFile), 'utf-8');
    
    acordaos = acordaos.concat(...JSON.parse(jsonData));
    
    const judgementIds = new Set([
      ...(
        await Judgement.find().select('id').exec()
      ).map(j => j.id)
    ]);
        
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

      //if(count > 1) break;
    }
  }
  con.close();

  console.log(`### Finished with: [${count}/${count + repeated}] insertions.`);
}
