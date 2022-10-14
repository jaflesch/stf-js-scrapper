import path from 'path';
import colors from 'colors';
import { existsSync, mkdirSync, readdirSync, writeFile } from "fs";
import { Pdf2TextController } from "./Pdf2TextController";

const createTextFile = (dstFolder: string, filename: string, textContent: string) => {
  const fileName = `${filename.substring(0, filename.length - 4)}.txt`;
      
  writeFile(
    path.join(dstFolder, fileName), 
    textContent, 
    'utf8', 
    (err: any) => {
      if(err) {
        console.log(colors.red(`Error when creating file '${fileName}': ${err.message}`));					
      } else {
        console.log(colors.green(`File '${fileName}' successfuly saved at '${dstFolder}'`));
      }
    }
  );
}

(async function () {
  const sourceFolder = path.join(__dirname, '../pdf');
  const destinationFolder = path.join(__dirname, '../txt');
  const files = readdirSync(sourceFolder);

  if (! existsSync(destinationFolder)) {
    mkdirSync(destinationFolder);
  }

  for (let i = 0; i < 10; i++) {
    const pdf2text = new Pdf2TextController(files[i]);
    
    pdf2text.execute(
      sourceFolder, 
      (text: string) => createTextFile(destinationFolder, files[i], text)
    );
  }  
})();
