import { Query } from "../../core/domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";

type Result = string[];

type AggregateResult = Array<{
  url: string;
}>;

export class GetPdfUrlsQuery implements Query <void, Result> {
  public async execute() {
    const qb = new QueryBuilder(Judgement).$();

    const result: AggregateResult = await qb.aggregate([
      {
        $addFields: {
          "url": "$arquivoPdfUrl"
        }
      },
      {
        $project: {
          _id: 0,
          url: 1,
        }
      },
    ]);

    return result?.map(r => r.url);
  }
}
