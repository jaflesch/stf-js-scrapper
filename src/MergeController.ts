const fs = require('fs');
const path = require('path');
import colors from 'colors';

type MergeControllerParams = {
  target?: string,
  basePath?: string;
  paginated?: boolean,
  filterKeys?: string[],
}

export class MergeController {
  private paginated = false;
  private content: object[] = [];
  private folderPath: string[] = [];
  private filterKeys: string[] = [];
  private filefolders = ['../json'];
  private destinationFolder = path.join(__dirname, '../db');

  constructor (
    source: string | string[], 
    options?: MergeControllerParams
  ) {
    if (Array.isArray(source)) {
      this.filefolders = source;
    } else {
      this.filefolders = [source];
    }

    if (options?.target) {
      this.destinationFolder = path.join(__dirname, options.target);
    }

    if(options?.filterKeys) {
      this.filterKeys = options.filterKeys;
    }

    this.paginated = options?.paginated ?? true;
    this.folderPath = this.filefolders.map(f => path.join(
       __dirname, 
       options?.basePath ? options.basePath : '',
       f
    ));
  }

  async run () {
    if (this.paginated) {
      this.parsePaginatedFiles();
    } else {
      // to do:
      //this.content = this.parseSingleFile();
    }

    this.save();
  }

  private save (): void {
    let i = 0;
    for (const f of this.folderPath) {
      const fileName = path.parse(f).base;
      const filePath = path.join(this.destinationFolder, `${this.filefolders ? fileName : 'import'}.merge.json`);
      
      fs.writeFile(
        filePath, 
        JSON.stringify(this.content[i++]), 
        'utf8', 
        (err: Error) => {
          if(err) {
            console.log(colors.red(`Error when creating merged JSON data: ${err}`));
          } else {
            console.log(colors.green(`The data has been merged and saved successfully! View it at '${filePath}'`));
          }
        }
      );
    }
  }

  private parsePaginatedFiles () {
    let i = 0;
    for (const folder of this.folderPath) {
      const folders = this.parseFolders(folder);
      this.content.push(
        this.readPaginatedFiles(folders, i)
      );
      i++;
    }
  }

  private parseFolders (folderPath: string): number[] {    
    const dirFiles = fs.readdirSync(folderPath);
    
    const folders = [];
    for (let i = 0; i < dirFiles.length; i++) {
      if (! isNaN(dirFiles[i])) {
        folders.push(Number(dirFiles[i]));
      }
    }
    folders.sort((a, b) => a - b);

    return folders;
  }
    
  private readPaginatedFiles (folders: number[], index: number) {
    let mergedJson: any = [];
    folders.map((folder: number) => {
      const jsonFile = fs.readdirSync(`${this.folderPath[index]}/${folder}`)[0];
      const data = fs.readFileSync(`${this.folderPath[index]}/${folder}/${jsonFile}`);
      const judgements = JSON.parse(data);
      const filteredJson = [];
      
      for (const d of judgements) {
        if (this.filterKeys.length === 0) {
          filteredJson.push(d);
        } else {
          const obj: {[key: string]: any} = {};
          for (let i = 0; i < this.filterKeys.length; i++) {
            if (d[this.filterKeys[i]] !== undefined) {
              obj[this.filterKeys[i]] = d[this.filterKeys[i]];
            }
          }
          filteredJson.push(obj);
        }
      }
      mergedJson = mergedJson.concat(...filteredJson);
    });

    return mergedJson;
  }
}
