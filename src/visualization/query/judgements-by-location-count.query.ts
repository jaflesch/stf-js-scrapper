import { PipelineStage } from "mongoose";
import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { BrazilFederationsMongoList } from "../infra/brazil-federations-mongo-list";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";
import { getGeoChartBRCode, getGeoChartBRLabel } from "../infra/geochart-utils";

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

    return rows.map(row => ({
      count: row.count,
      location: getGeoChartBRCode(row.location),
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
    }    
    
    if (yearMatch.length > 0) {
      match.$and = yearMatch;
    }

    return match;
  }
}
