import * as cherrio from "cheerio";
import { format, parseISO } from "date-fns";
import { IJudgement } from "../models/judgement.model";
import { utils } from '../utils';

enum BodyContentItem {
  PUBLICATION = "publicacao",
  PARTS = "partes",
  RESUME = "ementa",
  DECISION = "decisao",
  INDEXING = "indexacao",
  LEGISLATION = "legislacao",
  OBSERVATION = "observacao",
  TOPIC = "tema",
  THESIS = "tese",
  DOCTRINE = "doutrina",
  SIMILAR = "acordaos no mesmo sentido",
}

export const JSONtoModel = (data: any): IJudgement => {
  const $ = cherrio.load(data.innerPage.innerHTML);
  const body = $('.jud-text.ng-star-inserted');
  
  let partes: string[] = [];
  let paginaInternaPublicacao, ementa, decisao, dje, tese, tema, doutrina, legislacao, observacao, similares;
  const indexacao: string[] = [];
  const judgementBodyItems: any = [];
  
  body.each(function(i, el) {
    const key = utils.normalizeString($(el).children('h4').text());
    const value = $(el).children('div').text();
    judgementBodyItems.push({
      [key]: value
    });    

    switch (key) {      
      case BodyContentItem.THESIS:      tese = value; break;
      case BodyContentItem.TOPIC:       tema = value; break;
      case BodyContentItem.RESUME:      ementa = value; break;
      case BodyContentItem.SIMILAR:     similares = value; break;
      case BodyContentItem.DECISION:    decisao = value; break;
      case BodyContentItem.DOCTRINE:    doutrina = value; break;
      case BodyContentItem.LEGISLATION: legislacao = value; break;
      case BodyContentItem.OBSERVATION: observacao = value; break;
      case BodyContentItem.PUBLICATION: paginaInternaPublicacao = value; break;

      case BodyContentItem.PARTS:
        partes = value.split('\n');
        break;

      case BodyContentItem.PUBLICATION: 
        paginaInternaPublicacao = value.replace('\n', ' ');
        const djeRegex = paginaInternaPublicacao.match(/.*(dje-[0-9]*)/i);
        if (djeRegex) {
          dje = djeRegex[1];
        }
        break;

      case BodyContentItem.INDEXING:
        const tags = value.split(/(\n|,|\.)/g);
        for (const tag of tags) {
          if (tag.length > 0 && tag !== '.' && tag !== ',' && tag !== '\n') {
            indexacao.push(tag.trim().replace(/- */, ''))
          }
        }
        break;
    }
  });
  
  const relator = data.relator.replace(/(Min\. | \(.*\))/g, '');
  const redator = data.redator?.replace(/(Min\. | \(.*\))/g, '');
  
  const parseDate = (date: string) => {
    const d = date.split('/');
    return `${d[2]}-${d[1]}-${d[0]} 00:00:00`;
  }
  
  return {
    id: data.id,
    titulo: data.titulo,
    orgao: data.orgaostring,
    relator,
    redator,
    isPresident: !!data.relator.match('Presidente'),
    dataJulgamento: parseDate(data.dataJulgamento),
    dataPublicacao: parseDate(data.dataJulgamento),
    ementa,
    partes,
    decisao,
    indexacao,
    paginaInternaUrl: data.dadosCompletos,
    paginaHTML: data.innerHTML,
    arquivoPdfUrl: data.pdfFileUrl,
    paginaInternaTitulo: data.innerPage.titulo,
    paginaInternaSubtitulo: data.innerPage.subtitulo,
    paginaInternaPublicacao,
    dje,
    paginaInternaHTML: data.innerPage.innerHTML,
    documentId: Number(data.docId),
    ...judgementBodyItems
  }
}