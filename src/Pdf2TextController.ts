import path from 'path';
import colors from 'colors';
import { readFileSync, writeFileSync } from "fs";
import PdfParse from "pdf-parse";

export class Pdf2TextController {
  constructor(
    private readonly files: string[],
    private readonly srcFolder: string,
    private readonly dstFolder: string,
  ) {}

  async execute() {    
    console.log(colors.yellow('Starting...'));
    for (let i = 0; i < this.files.length; i++) {
      const fileName = `${this.files[i].substring(0, this.files[i].length - 4)}.txt`;
      console.log(colors.yellow(`[${i + 1}] Converting '${this.files[i]} to text...`));

      const dataBuffer = readFileSync(path.join(this.srcFolder, this.files[i]));
      try {
        const { text } = await PdfParse(dataBuffer);
        this.createTextFile(fileName, text.trim());

      } catch (err: any) {
        console.error(colors.red(`Error on PDF to HTML conversion: ${err.message}`));
      }
    }
  } 

  createTextFile (fileName: string, text: string) {
    try {
      writeFileSync(
        path.join(this.dstFolder, fileName), 
        text, 
        'utf8'
      );
      console.log(colors.green(`File '${fileName}' successfuly saved at '${this.dstFolder}'\n`));
    } catch (err: any) {
      if(err) {
        console.log(colors.red(`Error when creating file '${fileName}': ${err.message}\n`));					
      }
    }
  }
}
