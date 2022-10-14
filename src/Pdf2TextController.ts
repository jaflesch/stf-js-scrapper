import * as cherrio from "cheerio";
import path, { dirname } from 'path';
import colors from 'colors';
const pdf2html = require('pdf2html');

export class Pdf2TextController {
  constructor(
    private readonly file: string,
  ) {}

  async execute(srcFolder: string, cb?: Function) {    
    pdf2html.html(path.join(srcFolder, this.file), (err:any, html:any) => {
      if (err) {
        console.error(colors.red(`Error on PDF to HTML conversion: ${err.message}`));
      } else {
        const $ = cherrio.load(html);
        
        let output = '';          
        $('p').each(function(i, el) {
          output += $(el).text() + '\n';
        });
        
        if (cb) cb(output.trim());
      }
    });
  }
}
