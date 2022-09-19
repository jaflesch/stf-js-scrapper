import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";

type Params = {
  name?: string;
  startAt?: Date;
  endAt?: Date;
  isPresident?: boolean;
}

type ResultDTO = Array<{
  count: number;
  writer: string;
  isPresident: boolean;
  year: number;
  month?: number;
  monthName?: string;
}>

export class JudgementsByWriterQuery implements Query <Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const { group, match } = this.mountQueryParams(queryParams);
    const qb = new QueryBuilder(Judgement).$();    
    
    const result: ResultDTO = await qb.aggregate([
      {
        $addFields: {
          year: {
            $year: '$dataJulgamento'
          },
          month: {
            $month: '$dataJulgamento'
          },
        }
      },
      { 
        $match: { 
          ...match 
        }
      },
      {
        $group: {
          _id: {
            writer: "$redator",
            year: "$year",
            ...group?._id
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          writer: "$_id.writer",
          count: "$count",
          month: "$_id.month",
          year: "$_id.year",
          _id: 0
        }
      },      
      {
        $sort: {
          year: 1,
          month: 1,
        },
      }
    ]);

    return result;
  }

  private mountQueryParams (queryParams: Params): MongoDBPipeline {
    const match: MongoDBPipeline['match'] = {};
    const group: MongoDBPipeline['group'] = {
      _id: []
    };
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
    if (queryParams.name) {
      match.redator = queryParams.name;
    } else {
      match.redator = {
        $exists: true
      };
    }
    if (!!queryParams.isPresident) {      
      match.redatorPresidente = true;
    }

    if (queryParams.startAt && queryParams.endAt) {
      const sameYear = (Number(queryParams.startAt) - Number(queryParams.endAt)) === 0;
      if (sameYear) {
        group._id = {
          month: "$month" 
        };
      }
    }

    if (yearMatch.length > 0) {
      match.$and = yearMatch;
    }

    return { match, group }
  }
}
