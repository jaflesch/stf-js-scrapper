import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { getMonthName } from "../infra/get-month-name";

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
    const project = [], match = [];

    if (queryParams.startAt) {
      project.push({
        gtYear: {
          $gte: ["$_id.year", Number(queryParams.startAt)]
        }
      });
      match.push({ gtYear: true });
    }
    if (queryParams.endAt) {
      project.push({
        ltYear: {
          $lte: ["$_id.year", Number(queryParams.endAt)]
        }
      });
      match.push({ ltYear: true })
    }

    const qb = new QueryBuilder(Judgement).$();
    const rows = await qb.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$dataJulgamento" },
            year: { $year: "$dataJulgamento" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          count: "$count",
          month: "$_id.month",
          year: "$_id.year",
          ...project,
          _id: 0
        }
      },
      { 
        $match: { ...match }
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
}
