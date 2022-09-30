import { DocumentCategory } from "./document-category.enum";
import { DocumentCategoryLabel } from "./document-category-label.enum";

type valueof<T> = T[keyof T];

export const labelToDocumentCategory = (key: keyof typeof DocumentCategoryLabel): DocumentCategory => {
  return DocumentCategory[key];  
}

export const documentCategoryToLabel = (key: keyof typeof DocumentCategory): DocumentCategoryLabel => {
  return DocumentCategoryLabel[key];
}

export const documentCategoryToLabelValue = (
  value: typeof DocumentCategory[keyof typeof DocumentCategory]
): typeof DocumentCategoryLabel[keyof typeof DocumentCategoryLabel] | undefined => {
  const keys = Object.keys(DocumentCategory) as unknown as Array<keyof typeof DocumentCategory>;
  console.log('@@@ key', value, keys)

  for (let i = 0; i < keys.length; i++) {
    console.log('>', DocumentCategory[keys[i]]);
    if (DocumentCategory[keys[i]] === value) {
      //@ts-ignore
      return DocumentCategoryLabel[keys[i]];
    }
  }
}