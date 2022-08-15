const fs = require('fs');
const path = require('path');
import colors from 'colors';

export class MergeController {
  private folderPath = '';
  private filefolders = '../json';
  private content = null;

  constructor (
    private readonly paginated: boolean,
    folderPath?: string
  ) {
    if (folderPath) {
      this.filefolders = folderPath;
    }
    this.folderPath = path.join(__dirname, this.filefolders);
  }

  async run () {
    if (this.paginated) {
      this.content = this.parsePaginatedFiles();
    } else {
      // to do:
      //this.content = this.parseSingleFile();
    }

    this.save();
  }

  private save (): void {
    fs.writeFile(
      `${__dirname}/../db/import.json`, 
      JSON.stringify(this.content), 
      'utf8', 
      (err: Error) => {
        if(err) {
          console.log(colors.red(`Error when creating merged JSON data: ${err}`));
        } else {
          console.log(colors.green("The data has been merged and saved successfully! View it at './db/'"));
        }
      }
    );
  }

  private parsePaginatedFiles () {
    const folders = this.parseFolders();
    return this.readPaginatedFiles(folders);
  }

  private parseFolders (): number[] {    
    const dirFiles = fs.readdirSync(this.folderPath);
    
    const folders = [];
    for (let i = 0; i < dirFiles.length; i++) {
      if (! isNaN(dirFiles[i])) {
        folders.push(Number(dirFiles[i]));
      }
    }
    folders.sort((a, b) => a - b);

    return folders;
  }
    
  private readPaginatedFiles (folders: number[]) {
    let mergedJson: any = [];
    folders.map((folder: number) => {
      const jsonFile = fs.readdirSync(`${this.folderPath}/${folder}`)[0];
      const data = fs.readFileSync(`${this.folderPath}/${folder}/${jsonFile}`);
      mergedJson = mergedJson.concat(...JSON.parse(data));
    });

    return mergedJson;
  }
}