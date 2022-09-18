import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { Query } from "../domain/query";

type Params = {
  startDate?: Date;
  endDate?: Date;
}

type ResultDTO = Array<{
  count: number;
  relator: string;
}>

export class JudgementsByRelatorQuery implements Query <Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const qb = new QueryBuilder(Judgement).$();
    const result: ResultDTO = await qb.aggregate([
      {
        $group: {
          _id: {
            relator: "$relator",
          },
          count: {
            $sum: 1
          }
        }
      }, 
      {
        $project: {
          relator: "$_id.relator",
          count: "$count",
          _id: 0
        }
      }, 
      {
        $sort: {
          count: -1,
          relator: 1
        }
      }
    ]);

    return result;
  }
}
