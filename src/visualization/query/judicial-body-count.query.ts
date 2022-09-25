import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";

type ResultDTO = Array<{
  count: number;
  judicialBody: string;
}>

export class JudicialBodyCountQuery implements Query <void, ResultDTO> {
  public async execute(): Promise<ResultDTO> {
    const qb = new QueryBuilder(Judgement).$();    
    
    const result: ResultDTO = await qb.aggregate([
      {      
        $match: {
          orgao: {
            $ne : ""
          }
        }
      },
      {
        $group: {
          _id: {
            judicialBody: "$orgao",
          },
          count: { $sum: 1 }
        }
      },      
      {
        $project: {
          judicialBody: "$_id.judicialBody",
          count: "$count",
          _id: 0
        }
      },      
      {
        $sort: {
          count: -1,
        },
      }
    ]);

    return result;
  }
}
