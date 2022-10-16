import path from 'path';
import colors from 'colors';
import { existsSync, writeFileSync } from "fs";
import { GetPdfUrlsQuery } from '../query/get-pdf-urls.query';
import { args } from './pdf-list-args';

const walkParent = (givenPath: string, steps: number): string => {
  let newPath = givenPath;
  for (let i = 0; i < steps; i++) {
    newPath += `${path.sep}..`;
  }

  return path.resolve(newPath + path.sep);
}

(async function () {
  let dstPath = path.join(
    walkParent(__dirname, 3), 'data', 'pdf-url'
  );
  let fileName = 'urls.txt';
  if (args.output) {
    fileName = path.parse(args.output).base;
  }
  dstPath = path.join(dstPath, fileName);

  const getPdfUrlsQuery = new GetPdfUrlsQuery();
  const urls = await getPdfUrlsQuery.execute();

  try {
    if (existsSync(dstPath) && !args.rewrite) {
      throw new Error(`File already exists`);
    }

    writeFileSync(dstPath, urls.join('\n'), 'utf8');
    args.debug && console.log(colors.green(`File '${fileName}' successfuly saved at '${dstPath}`));
  } catch (err: any) {
    if(err) {
      args.debug && console.log(colors.red(`Error when creating file '${fileName}': ${err.message}`));					
    }
  } finally {
    process.exit();
  }
})();
