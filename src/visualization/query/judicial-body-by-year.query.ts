import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";

type Params = {
  name?: string;
  startAt?: Date;
  endAt?: Date;
}

type ResultDTO = Array<{
  count: number;
  judicialBody: string;
  year: number;
  month?: number;
  monthName?: string;
}>

export class JudicialBodyByYearQuery implements Query <Params, ResultDTO> {
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
          orgao: {
            $ne : ""
          },
          ...match 
        }
      },
      {
        $group: {
          _id: {
            judicialBody: "$orgao",
            year: "$year",
            ...group?._id
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          judicialBody: "$_id.judicialBody",
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
          judicialBody: 1,
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
      match.orgao = queryParams.name;
    } else {
      match.orgao = {
        $exists: true
      };
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
