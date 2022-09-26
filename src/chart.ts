import path from 'path';
import express, {Request, Response} from 'express';
import { normalizeAverageValue } from './visualization/infra/normalize-avg-value';
import { 
  JudgementsByYearQuery,
  JudicialBodyCountQuery,
  JudgementsByWriterQuery,
  JudicialBodyByYearQuery, 
  JudgementsByRappoteurQuery,
  JudgementsByLocationCountQuery,
} from './visualization/query';

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
    chartTitle: 'Acordãos por período',
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

router.get('/orgao-ano', async ({ query }: Request, res: Response) => {
  const judicialBodyByYearQuery = new JudicialBodyByYearQuery();
  const chart = await judicialBodyByYearQuery.execute(query);
  
  res.render("orgao-ano", { 
    chartTitle: 'Acórdãos / Órgão julgador / ano',
    chart: JSON.stringify(chart) 
  });
});

router.get('/votos-orgao', async (_req: Request, res: Response) => {
  const judicialBodyCountQuery = new JudicialBodyCountQuery();
  const chart = await judicialBodyCountQuery.execute();
  
  res.render("votos-orgao", { 
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

app.use('/', router);
app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');
