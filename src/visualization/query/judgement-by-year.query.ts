import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { getMonthName } from "../infra/get-month-name";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";

type Params = {
  startAt?: string;
  endAt?: string;
}

type Result = Array<{
  count: number;
  year: number;
  month: number;
  monthName: string;
}>

export class JudgementsByYearQuery implements Query <Params, Result> {
  public async execute(queryParams: Params) {
    const { match, group } = this.mountQueryParams(queryParams);
    const qb = new QueryBuilder(Judgement).$();

    const rows = await qb.aggregate([
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
        $match: { ...match }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dataJulgamento" },
            ...group?._id
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
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

    const result: Result = rows.map(row => {
      return {
        count: row.count,
        year: row.year,
        month: row.month,
        monthName: getMonthName(row.month),
      };
    });

    return result;
  }

  private mountQueryParams (queryParams: Params): MongoDBPipeline {
    const match: MongoDBPipeline['match'] = {};
    const group: MongoDBPipeline['group'] = {};
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
