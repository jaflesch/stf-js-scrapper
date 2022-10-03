import { Query } from "../domain/query";
import { Judgement } from "../../models/judgement.model";
import { QueryBuilder } from "../../query-builder";
import { DocumentCategory } from "../infra/document-category.enum";
import { MongoDBPipeline } from "../infra/mongodb-pipeline.type";
import { documentCategoryToLabelValue } from "../infra/translate-document-category";

type Params = {
  startAt?: number;
  endAt?: number;
  category?: DocumentCategory;
}

type ResultDTO = Array<{
  count: number;
  category: string;
}>

export class JudgementsByDocumentCategoryYearQuery implements Query<Params, ResultDTO> {
  public async execute(queryParams: Params): Promise<ResultDTO> {
    const match = this.mountQueryParams(queryParams);
    const qb = new QueryBuilder(Judgement).$();

    const result = await qb.aggregate([
      {
        $addFields: {
          year: {
            $year: '$dataJulgamento',
          },
        },
      },
      { 
        $match: { 
          ...match 
        }
      },
      {
        $group: {
          _id: {
            categoria: "$categoria",
            year: "$year",
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          category: "$_id.categoria",
          year: "$_id.year",
          count: "$count",
          _id: 0
        }
      },
      {
        $sort: {
          year: 1
        }
      }
    ]);
    
    return result.map(r => ({
      ...r,
      categoryLabel: documentCategoryToLabelValue(r.category)
    }));
  }

  private mountQueryParams (queryParams: Params): MongoDBPipeline {
    const match: MongoDBPipeline['match'] = {};
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
    if (queryParams.category) {
      match.categoria = queryParams.category;
    }

    if (yearMatch.length > 0) {
      match.$and = yearMatch;
    } 
    
    return match;
  }
}
