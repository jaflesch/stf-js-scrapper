const fs = require('fs');
const path = require('path');
import 'dotenv/config';
import mongoose from "mongoose";
import { Judgement } from "./models/judgement.model";
import { JSONtoModel } from "./query-builder/utils";

main()
  .then(() => console.log('Database succesfully connected!'))
  .catch(err => console.log(err));

async function main() {
  const db = await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_TABLENAME}`);
  const con = db.connection;

  const jsonFilePath = '../db/__2010.merge.json';
  const jsonData = fs.readFileSync(path.join(__dirname, jsonFilePath));
  let acordaos: any = [];
  acordaos = acordaos.concat(...JSON.parse(jsonData));
  
  con.on('disconnected', () => console.log('Disconnected successfully!'));
  let count = 0;
  for (const acordao of acordaos) {
    const row = new Judgement(
      JSONtoModel(acordao)
    );    
    
    const alreadyExistsJudgement = await Judgement.find({ 
      id: row.id 
    }).exec();

    if (alreadyExistsJudgement.length === 0) {
      const result = await row.save();
      console.log('Inserted row with ID: ', result?._id.valueOf());
      count++;
    }
  }

  console.log(`### Finished with: [${count}/${acordaos.length}] insertions.`);
}
