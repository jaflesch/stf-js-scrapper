import { PipelineStage } from "mongoose";
import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";

type Params = {
  limit?: number;
}

type ResultDTO = {
  total: number;
  items: Array<{
    count: number;
    location: string;
  }>
}

export class JudgementsByLocationCountQuery implements Query <Params, ResultDTO> {
  public async execute({ limit }: Params): Promise<ResultDTO> {
    const qb = new QueryBuilder(Judgement).$();    
    
    const pipeline: PipelineStage[] = [
      {      
        $match: {
          $and : [
            { origem: { $ne : "" }},
            { origem: { $ne : null }}
          ]
        }
      },
      {
        $group: {
          _id: {
            location: "$origem",
          },
          count: { $sum: 1 }
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
          count: -1,
        },
      },
    ];

    if (limit && limit > 0) {
      pipeline.push({
        $limit: Number(limit)
      })
    }

    const items = await qb.aggregate(pipeline);
    let total = 0;

    if (limit) {
      pipeline.pop();
      pipeline.push({
        $skip: Number(limit)
      });
      const all = await qb.aggregate(pipeline);
      total = all.reduce((partialSum, a) => partialSum + a.count, 0);
    }

    return { items, total }
  }
}
