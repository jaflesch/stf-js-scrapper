import { PipelineStage } from "mongoose";
import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { BrazilFederationsMongoList } from "../infra/brazil-federations-mongo-list";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";
import { getGeoChartBRLabel, getGeoChartCountryCode } from "../infra/geochart-utils";

type Params = {
  startAt?: Date;
  endAt?: Date;
  country?: string;
}

type ResultDTO = Array<{
  count: number;
  location: any;
  locationText: string;
}>;

export class JudgementsByLocationCountQuery implements Query<Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const qb = new QueryBuilder(Judgement).$();
    const match = this.mountQueryParams(queryParams);
    
    const pipeline: PipelineStage[] = [
      {
        $match: match
      },
      {
        $group: {
          _id: {
            location: "$origem"
          },
          count: {
            $sum: 1
          }
        }
      },      
      {
        $project: {
          location: "$_id.location",
          count: "$count",
          _id: 0
        }
      },
      {
        $sort: {
          count: -1
        }
      }    
    ];
    const rows: ResultDTO = await qb.aggregate(pipeline);

    return this.groupDuplicatedCountriesCount(rows).map((row: any) => ({
      count: row.count,
      location: getGeoChartCountryCode(row.location),
      locationText: getGeoChartBRLabel(row.location),
    }));   
  }

  private mountQueryParams (queryParams: Params): MongoDBPipeline {
    const match: MongoDBPipeline['match'] = {};
    
    const yearMatch = [];

    if (queryParams.startAt) {
      yearMatch.push({ 
        year: { 
          $gte: Number(queryParams.startAt) 
        } 
      });
    }
    if (queryParams.endAt) {
      yearMatch.push({
        year: {
          $lte: Number(queryParams.endAt)
        }
      });
    }
    if (queryParams.country) {
      match.origem = {
        $in : BrazilFederationsMongoList,
      }
    } else {
      match.$and = [
          { 
            origem: {
              $not: {
                $in : BrazilFederationsMongoList
              }
            }
          },
          {
            origem: {
              $exists: true
            }
          }
      ]
    }  
    
    if (yearMatch.length > 0) {
      match.$and = [
        ...match.$and, 
        ...yearMatch
      ];
    }

    return match;
  }

  private groupDuplicatedCountriesCount = (locationsArray: any[]) => {
    const uniqueCountries: any = {};

    for (let i = 0; i < locationsArray.length; i++) {
      let key = '';
      switch (locationsArray[i].location) {
        case "IT - IT??LIA":
        case "REP??BLICA ITALIANA":
          key = "IT - IT??LIA";
          break;

        case "RFA - REP??BLICA FEDERAL DA ALEMANHA":
        case "RFA - REPUBLICA FEDERAL DA ALEMANHA":
        case "REP??BLICA FEDERAL DA ALEMANHA":
          key = "REP??BLICA FEDERAL DA ALEMANHA";
          break;

        case "EU - ESTADOS UNIDOS DA AM??RICA":
        case "EU - ESTADOS UNIDOS DA AMERICA":
        case "ESTADOS UNIDOS DA AM??RICA":
        case "EUA - ESTADOS UNIDOS DA AM??RICA":
          key = "ESTADOS UNIDOS DA AM??RICA";
          break;

        case "PT - PORTUGAL":
        case "REP??BLICA PORTUGUESA":
        case "PT - REP??BLICA PORTUGUESA":
        case "PT- PORTUGAL":
          key = "PT - PORTUGAL";
          break;

        case "AT - ARGENTINA":
        case "REP??BLICA ARGENTINA":
        case "AT- ARGENTINA":
          key = "AT - ARGENTINA";
          break;

        case "FR - FRAN??A":
        case "REP??BLICA FRANCESA":
        case "FR - FRANCA":
          key = "FR - FRAN??A";
          break;

        case "UR - URUGUAI":
        case "REP??BLICA ORIENTAL DO URUGUAI":
        case "URU - REP??BLICA ORIENTAL DO URUGUAI":
          key = "UR - URUGUAI";
          break;

        case "ME - M??XICO":
        case "ME - MEXICO":
          key = "ME - M??XICO";
          break;

        case "EP - ESPANHA":
        case "REINO DA ESPANHA":
          key = "EP - ESPANHA";
          break;

        case "CL - CHILE":
        case "REP??BLICA DO CHILE":
          key = "CL - CHILE";
          break;

        case "SI - SU????A":
        case "CONFEDERA????O HELV??TICA":
        case "SI - SUI??A":
          key = "SI - SU????A";
          break;

        case "UK - REINO UNIDO DA GRA-BRETANHA E DA IRLANDA DO NORTE":
        case "IN - GRA BRETANHA (INGLATERRA)":
          key = "IN - GRA BRETANHA (INGLATERRA)";
          break;

        case "DI - DINAMARCA":
        case "DI - REINO DA DINAMARCA":
          key = "DI - DINAMARCA";
          break;

        case "AU - ??USTRIA":
          key = "AU - ??USTRIA";
          break;

        case "BE - B??LGICA":
          key = "BE - B??LGICA";
          break;

        case "BO - BOL??VIA":
          key = "BO - BOL??VIA";
          break;

        case "CD - CANAD??":
          key = "CD - CANAD??";
          break;

        case "GR - GR??CIA":
          key = "GR - GR??CIA";
          break;

        case "HL - HOLANDA":
          key = "HL - HOLANDA";
          break;

        case "PG - PARAGUAI":
          key = "PG - PARAGUAI";
          break;

        case "PU - PERU":
          key = "PU - PERU";
          break;

        case "REP??BLICA DA COR??IA":
          key = "REP??BLICA DA COR??IA";
          break;

        case "REP??BLICA DA HUNGRIA":
          key = "REP??BLICA DA HUNGRIA";
          break;

        case "REP??BLICA TCHECA":
          key = "REP??BLICA TCHECA";
          break;

        case "NO - REINO DA NORUEGA":
          key = "NO - REINO DA NORUEGA";
          break;
        
        default:
          key = 'DEFAULT';
          break;
      }

      if (key) {
        if (uniqueCountries[key]) {
          uniqueCountries[key].count += locationsArray[i].count;
        } else {
          uniqueCountries[key] = locationsArray[i];
        }
      }
    }

    return Object.values(uniqueCountries);
  }
}




  







// 


