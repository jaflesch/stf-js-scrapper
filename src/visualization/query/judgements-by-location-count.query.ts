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
        case "IT - ITÁLIA":
        case "REPÚBLICA ITALIANA":
          key = "IT - ITÁLIA";
          break;

        case "RFA - REPÚBLICA FEDERAL DA ALEMANHA":
        case "RFA - REPUBLICA FEDERAL DA ALEMANHA":
        case "REPÚBLICA FEDERAL DA ALEMANHA":
          key = "REPÚBLICA FEDERAL DA ALEMANHA";
          break;

        case "EU - ESTADOS UNIDOS DA AMÉRICA":
        case "EU - ESTADOS UNIDOS DA AMERICA":
        case "ESTADOS UNIDOS DA AMÉRICA":
        case "EUA - ESTADOS UNIDOS DA AMÉRICA":
          key = "ESTADOS UNIDOS DA AMÉRICA";
          break;

        case "PT - PORTUGAL":
        case "REPÚBLICA PORTUGUESA":
        case "PT - REPÚBLICA PORTUGUESA":
        case "PT- PORTUGAL":
          key = "PT - PORTUGAL";
          break;

        case "AT - ARGENTINA":
        case "REPÚBLICA ARGENTINA":
        case "AT- ARGENTINA":
          key = "AT - ARGENTINA";
          break;

        case "FR - FRANÇA":
        case "REPÚBLICA FRANCESA":
        case "FR - FRANCA":
          key = "FR - FRANÇA";
          break;

        case "UR - URUGUAI":
        case "REPÚBLICA ORIENTAL DO URUGUAI":
        case "URU - REPÚBLICA ORIENTAL DO URUGUAI":
          key = "UR - URUGUAI";
          break;

        case "ME - MÉXICO":
        case "ME - MEXICO":
          key = "ME - MÉXICO";
          break;

        case "EP - ESPANHA":
        case "REINO DA ESPANHA":
          key = "EP - ESPANHA";
          break;

        case "CL - CHILE":
        case "REPÚBLICA DO CHILE":
          key = "CL - CHILE";
          break;

        case "SI - SUÍÇA":
        case "CONFEDERAÇÃO HELVÉTICA":
        case "SI - SUIÇA":
          key = "SI - SUÍÇA";
          break;

        case "UK - REINO UNIDO DA GRA-BRETANHA E DA IRLANDA DO NORTE":
        case "IN - GRA BRETANHA (INGLATERRA)":
          key = "IN - GRA BRETANHA (INGLATERRA)";
          break;

        case "DI - DINAMARCA":
        case "DI - REINO DA DINAMARCA":
          key = "DI - DINAMARCA";
          break;

        case "AU - ÁUSTRIA":
          key = "AU - ÁUSTRIA";
          break;

        case "BE - BÉLGICA":
          key = "BE - BÉLGICA";
          break;

        case "BO - BOLÍVIA":
          key = "BO - BOLÍVIA";
          break;

        case "CD - CANADÁ":
          key = "CD - CANADÁ";
          break;

        case "GR - GRÉCIA":
          key = "GR - GRÉCIA";
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

        case "REPÚBLICA DA CORÉIA":
          key = "REPÚBLICA DA CORÉIA";
          break;

        case "REPÚBLICA DA HUNGRIA":
          key = "REPÚBLICA DA HUNGRIA";
          break;

        case "REPÚBLICA TCHECA":
          key = "REPÚBLICA TCHECA";
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


