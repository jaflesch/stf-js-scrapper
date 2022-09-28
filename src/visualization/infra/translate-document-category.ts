import { DocumentCategory } from "./document-category.enum";
import { DocumentCategoryLabel } from "./document-category-label.enum";

export const labelToDocumentCategory = (key: keyof typeof DocumentCategoryLabel): DocumentCategory => {
  return DocumentCategory[key];  
}

export const documentCategoryToLabel = (key: keyof typeof DocumentCategory): DocumentCategoryLabel => {
  return DocumentCategoryLabel[key];
}
