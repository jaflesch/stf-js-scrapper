import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";

type Params = {
  startAt?: Date;
  endAt?: Date;
  groupByYear?: boolean;
}

type ResultDTO = Array<{
  year: number;
  count: number;
  decision: boolean;
  decisionText: string;
}>

export class VotesMonocraticByYearQuery implements Query <Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const { group, match, sort } = this.mountQueryParams(queryParams);
    const qb = new QueryBuilder(Judgement).$();    
    
    const rows: ResultDTO = await qb.aggregate([
      {
        $addFields: {
          year: {
            $year: '$dataJulgamento'
          },
        }
      },
      { 
        $match: { 
          decisaoAdiada : {
            $ne : null
          },
          ...match 
        }
      },
      {
        $group: {
          _id: {
            decision: "$decisaoAdiada",
            ...group?._id
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          decision: "$_id.decision",
          count: "$count",
          year: "$_id.year",
          _id: 0
        }
      },      
      {
        $sort: {
          ...sort,
        }
      }
    ]);

    const result: ResultDTO = rows.map(row => {
      return {
        count: row.count,
        year: row.year,
        decision: row.decision,
        decisionText: row.decision ? 'Sim' : 'Não',
      };
    });

    return result;
  }

  private mountQueryParams (queryParams: Params): MongoDBPipeline {
    let sort: MongoDBPipeline['sort'] = {};
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

    if (queryParams.groupByYear) {
      group._id = {
        year: "$year",
      }
    }

    if (yearMatch.length > 0) {
      match.$and = yearMatch;
    }

    if (group._id?.length === 0) {
      sort = {
        count: -1
      }
    } else {
      sort = {
        year: 1,
        month: 1,
      }
    }
    
    return { match, group, sort }
  }
}
