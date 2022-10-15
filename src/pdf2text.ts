import path from 'path';
import colors from 'colors';
import { existsSync, mkdirSync, readdirSync, writeFile } from "fs";
import { Pdf2TextController } from "./Pdf2TextController";

(async function () {
  const sourceFolder = path.join(__dirname, '../pdf');
  const destinationFolder = path.join(__dirname, '../txt');
  const files = readdirSync(sourceFolder);

  if (! existsSync(destinationFolder)) {
    mkdirSync(destinationFolder);
  }

  const pdf2text = new Pdf2TextController(
    files,
    sourceFolder,
    destinationFolder,
  );
  
  await pdf2text.execute();
})();
