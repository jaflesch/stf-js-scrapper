import path  from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { StopWords } from './stopwords';

type WordCountRow = {
  key: string;
  value: number;
}

(async function() {
  const files = readdirSync(path.join(__dirname, '..', 'txt'));
  const wc: { [key: string]: number} = {};
  for (let i = 0; i < files.length; i++) {
  //for (let i = 0; i < 100; i++) {
    const a = readFileSync(path.join(__dirname, '..', 'txt', files[i]), { 
      encoding:'utf8', flag:'r'
    });
    const c = a.split(/\n| /).filter(a => a !== '' && a !== ' ').join(' ');
    const rgx = new RegExp("[^A-zÀ-ú -]", "gi");
    const b = c.replace(rgx, '').toLocaleLowerCase();
    
    const words = b.split(/\n| |\/|“|"|'|`|–|—|-|\(|\)|\[|\]\t|\r|\\/).filter(a => {
      return (
        a !== '' &&
        a !== '-' &&
        a !== 'n' &&
        a.length > 1 &&
        !(a in StopWords)
      )
    });

    for (let j =0; j < words.length; j++) {
      if (wc[words[j]]) {
        wc[words[j]] += 1;
      } else {
        wc[words[j]] = 1;
      }
    }
  }
  
  const rows: WordCountRow[] = [];
  for (let key of Object.keys(wc)) {
    rows.push({
      key,
      value: wc[key]
    });
  }
  rows.sort((a,b) => b.value - a.value);
  
  console.log('@@@ rows', rows.length);

  writeFileSync(
    path.join(__dirname, '..', 'data', 'token', 'tokens.txt'),
    rows.map(row => `${row.value}\t${row.key}`).join('\n'),
    'utf8'
  );
})();
