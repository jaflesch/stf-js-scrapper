const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "pages/views"));

app.use('/public', express.static(path.join(__dirname, 'public')));

router.get('/', (req: any,res: any) => {
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

  const avg = chart.reduce((partialSum, a) => partialSum + a.count, 0) / chart.length;
  const normalizedChart = chart.filter(r => r.count > (avg / 50))

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

app.use('/', router);
app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');
