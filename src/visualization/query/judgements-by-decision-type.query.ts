import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";
import { getMonthName } from "../infra/get-month-name";

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
  month?: number;
  monthName?: string;
}>

export class JudgementsByDecisionTypeQuery implements Query <Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const { group, match, sort } = this.mountQueryParams(queryParams);
    const qb = new QueryBuilder(Judgement).$();    
    
    const rows: ResultDTO = await qb.aggregate([
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
          decisaoUnanime : {
            $ne : null
          },
          ...match 
        }
      },
      {
        $group: {
          _id: {
            decision: "$decisaoUnanime",
            ...group?._id
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          decision: "$_id.decision",
          count: "$count",
          month: "$_id.month",
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
        month: row.month,
        decision: row.decision,
        decisionText: row.decision ? 'Unânime' : 'Por maioria',
        monthName: row.month ? getMonthName(row.month) : '',
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

    if (queryParams.startAt && queryParams.endAt) {
      const sameYear = (Number(queryParams.startAt) - Number(queryParams.endAt)) === 0;
      if (sameYear) {
        group._id = {
          ...group._id,
          month: "$month" 
        };
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
