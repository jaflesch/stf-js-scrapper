import fs from 'fs';
import pdf from 'pdf-parse';
import path, { dirname } from 'path';
import express, {Request, Response} from 'express';
import * as cherrio from "cheerio";
import { normalizeAverageValue } from './visualization/infra/normalize-avg-value';
import { 
  JudgementsByYearQuery,
  JudicialBodyCountQuery,
  JudgementsByWriterQuery,
  JudicialBodyByYearQuery, 
  JudgementsByRappoteurQuery,
  JudgementsByLocationCountQuery,
  JudgementsByDocumentCategoryYearQuery,
  JudgementsByDocumentCategoryCountQuery,
  JudgementsByDecisionTypeQuery,
  JudgementsByDecisionDelayedQuery,
} from './visualization/query';
import { removeStopwords, porBr } from 'stopword';
import { DocumentCategory } from "./visualization/infra/document-category.enum";
import { DocumentCategoryLabel } from "./visualization/infra/document-category-label.enum";

const pdf2html = require('pdf2html');

const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "pages"));

app.use('/public', express.static(path.join(__dirname, 'public')));

router.get('/', (_req: Request, res: Response) => {
  const chart = [
    { nome : "AYRES BRITTO", count : 564 },
    { nome : "CARLOS VELLOSO", count : 2 },
    { nome : "CELSO DE MELLO", count : 138 },
    { nome : "CEZAR PELUSO", count : 258 },
    { nome : "CÁRMEN LÚCIA", count : 664 },
    { nome : "DIAS TOFFOLI", count : 438 },
    { nome : "ELLEN GRACIE", count : 653 },
    { nome : "EROS GRAU", count : 203 },
    { nome : "GILMAR MENDES", count : 464 },
    { nome : "JOAQUIM BARBOSA", count : 569 },
    { nome : "MARCO AURÉLIO", count : 360 },
    { nome : "NÉRI DA SILVEIRA", count : 1 },
    { nome : "OCTAVIO GALLOTTI", count : 1 },
    { nome : "RICARDO LEWANDOWSKI", count : 634 }
  ];

  const normalizedChart = normalizeAverageValue(chart, 50);

  if( normalizedChart.length > 0) {
    normalizedChart.push({
      nome: 'Outros',
      count: chart.length - normalizedChart.length
    })
  }

  res.render("index", { 
    chart: normalizedChart,
  });
});

router.get('/acordao-ano', async ({ query }: Request, res: Response) => {
  const judgementsByYearsQuery = new JudgementsByYearQuery();
  const chart = await judgementsByYearsQuery.execute(query);
  
  res.render("acordao-ano", { 
    chartTitle: 'Acordãos por ano',
    chart: JSON.stringify(chart) 
  });
});

router.get('/acordao-relator', async ({ query }: Request, res: Response) => {
  const judgementByRapporteur = new JudgementsByRappoteurQuery();
  const chart = await judgementByRapporteur.execute(query);
  
  res.render("acordao-relator", { 
    chartTitle: 'Acordãos por relator',
    chart: JSON.stringify(chart) 
  });
});

router.get('/acordao-redator', async ({ query }: Request, res: Response) => {
  const judgementsByWriter = new JudgementsByWriterQuery();
  const chart = await judgementsByWriter.execute(query);
  
  res.render("acordao-redator", { 
    chartTitle: 'Acordãos por redator',
    chart: JSON.stringify(chart) 
  });
});

router.get('/acordao-orgao-ano', async ({ query }: Request, res: Response) => {
  const judicialBodyByYearQuery = new JudicialBodyByYearQuery();
  const chart = await judicialBodyByYearQuery.execute(query);
  
  res.render("orgao-ano", { 
    chartTitle: 'Acórdãos / Órgão julgador / ano',
    chart: JSON.stringify(chart) 
  });
});

router.get('/acordao-orgao', async (_req: Request, res: Response) => {
  const judicialBodyCountQuery = new JudicialBodyCountQuery();
  const chart = await judicialBodyCountQuery.execute();
  
  res.render("acordao-orgao", { 
    chartTitle: 'Total acõrdãos / Órgão julgador',
    chart: JSON.stringify(chart) 
  });
});

router.get('/votos-local', async ({ query }: Request, res: Response) => {
  const judgementsByLocationCountQuery = new JudgementsByLocationCountQuery();
  const chart = await judgementsByLocationCountQuery.execute(query);
  
  if (query.limit) {
    chart.items.push({
      location: 'OUTROS',
      count: chart.total,
    });
  }

  res.render("votos-local", { 
    limit: query.limit ?? -1,
    chartTitle: 'Total acõrdãos / Local',
    chart: JSON.stringify(chart),
  });
});

router.get('/acordao-categoria', async ({ query }: Request, res: Response) => {
  const judgementsByDocumentCategoryCountQuery = new JudgementsByDocumentCategoryCountQuery();
  const chart = await judgementsByDocumentCategoryCountQuery.execute(query);

  res.render("acordao-categoria", { 
    chartTitle: 'Total acórdãos / categoria',
    chart: JSON.stringify(chart),
  });
});

router.get('/acordao-categoria-ano', async ({ query }: Request, res: Response) => {
  const judgementsByDocumentCategoryYearQuery = new JudgementsByDocumentCategoryYearQuery();
  const chart = await judgementsByDocumentCategoryYearQuery.execute(query);

  const categories = [];
  const dcKeys = Object.values(DocumentCategory);
  const dcLabels = Object.values(DocumentCategoryLabel);

  for (let i = 0; i < dcKeys.length; i++) {
    categories.push({
      key: dcKeys[i],
      value: dcLabels[i],
    });
  }

  res.render("acordao-categoria-ano", { 
    chartTitle: 'Total acõrdãos / categoria / ano',
    categories: categories,
    chart: JSON.stringify(chart),
  });
});

router.get('/decisao-tipo', async({ query}: Request, res: Response) => {
  const judgementsByDecisonTypeQuery = new JudgementsByDecisionTypeQuery();
  const chart = await judgementsByDecisonTypeQuery.execute(query);

  res.render("decisao-tipo", { 
    chartTitle: 'Tipo de decisão',
    chart: JSON.stringify(chart),
  });
});

router.get('/decisao-tipo-ano', async({ query}: Request, res: Response) => {
  const judgementsByDecisonTypeByYearQuery = new JudgementsByDecisionTypeQuery();
  const chart = await judgementsByDecisonTypeByYearQuery.execute({
    ...query,
    groupByYear: true,
  });

  res.render("decisao-tipo-ano", { 
    chartTitle: 'Tipo de decisão / ano',
    chart: JSON.stringify(chart),
  });
});

router.get('/decisao-adiamento', async({ query}: Request, res: Response) => {
  const judgementsByDecisonDelayedQuery = new JudgementsByDecisionDelayedQuery();
  const chart = await judgementsByDecisonDelayedQuery.execute(query);

  res.render("decisao-adiamento", { 
    chartTitle: 'Decisão adiada',
    chart: JSON.stringify(chart),
  });
});

router.get('/decisao-adiamento-ano', async({ query}: Request, res: Response) => {
  const judgementsByDecisonDelayedQuery = new JudgementsByDecisionDelayedQuery();
  const chart = await judgementsByDecisonDelayedQuery.execute({
    ...query,
    groupByYear: true,
  });

  res.render("decisao-adiamento-ano", { 
    chartTitle: 'Decisão adiada / ano',
    chart: JSON.stringify(chart),
  });
});


////////////////////////////////////////
router.get('/pdf', async (req: Request, res: Response) => {
  const f = __dirname + '/acordao.pdf'
  let dataBuffer = fs.readFileSync(f);
  pdf2html.html(f, (err:any, html:any) => {
    if (err) {
      console.error('Conversion error: ' + err)
    } else {
      const $ = cherrio.load(html);
      let output = '';
      $('p').each(function(i, el) {
        const text = $(el).text().split(' ');
        output += `${removeStopwords(text, porBr).join(' ').replace(',', ' ').replace('.', ' ').toLocaleLowerCase()}\n`;
      })
      
      res.render('pdf', {
        text: output
      })
    }
  });

  pdf2html.meta(f, (err: any, meta: any) => {
    if (err) {
        console.error('Conversion error: ' + err)
    } else {
      console.log(meta)
      /*
        'pdf:unmappedUnicodeCharsPerPage': [
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0'
        ],
        'pdf:PDFVersion': '1.4',
        'pdf:hasXFA': 'false',
        'access_permission:modify_annotations': 'true',
        'access_permission:can_print_degraded': 'true',
        'dcterms:created': '2022-09-26T19:50:58Z',
        'dcterms:modified': '2022-09-26T19:50:58Z',
        'dc:format': 'application/pdf; version=1.4',
        'access_permission:fill_in_form': 'true',
        'pdf:docinfo:modified': '2022-09-26T19:50:58Z',
        'pdf:hasCollection': 'false',
        'pdf:encrypted': 'false',
        'Content-Length': '519502',
        'pdf:hasMarkedContent': 'false',
        'Content-Type': 'application/pdf',
        'pdf:producer': 'iText 2.1.5 (by lowagie.com)',
        'access_permission:extract_for_accessibility': 'true',
        'access_permission:assemble_document': 'true',
        'xmpTPg:NPages': '24',
        resourceName: 'acordao.pdf',
        'pdf:hasXMP': 'false',
        'pdf:charsPerPage': [
          '1601', '3539', '3851',
          '3596', '4178', '4546',
          '4482', '4688', '5138',
          '5257', '5455', '5415',
          '5395', '5195', '5375',
          '5249', '4605', '4283',
          '4829', '4547', '5019',
          '4813', '1415', '2602'
        ],
        'access_permission:extract_content': 'true',
        'access_permission:can_print': 'true',
        'X-TIKA:Parsed-By': [
          'org.apache.tika.parser.DefaultParser',
          'org.apache.tika.parser.pdf.PDFParser'
        ],
        'access_permission:can_modify': 'true',
        'pdf:docinfo:producer': 'iText 2.1.5 (by lowagie.com)',
        'pdf:docinfo:created': '2022-09-26T19:50:58Z'
      */
    }
})


  return; 
  pdf(dataBuffer).then(function(data: any) {
    // use data
    console.log(data.numpages);
    console.log(data.numrender);
    console.log(data.info);
    console.log(data.metadata); 
    console.log(data.version);
    
    res.render('pdf', {
      text: data.text
    })
  })  
});

app.use('/', router);
app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');
