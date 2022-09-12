import { Schema, model } from 'mongoose';

export interface IJudgement {
  id: string;
  titulo: string;
  orgao: string;
  relator: string;
  redator: string;
  isPresident: boolean;
  dataJulgamento: Date;
  dataPublicacao: Date;
  ementa: string;
  partes: string[];
  decisao: string;
  indexacao: string[];
  paginaInternaUrl: string;
  paginaHTML: string;
  arquivoPdfUrl: string;
  paginaInternaTitulo: string;
  paginaInternaSubtitulo: string;
  paginaInternaPublicacao: string;
  dje: string;
  paginaInternaHTML: string;
  documentId: number;
  tese: string;
  tema: string;
  doutrina: string;
  legislacao: string;
  observacao: string;
  similares: string;
}

const JudgementSchema = new Schema<IJudgement>({
  id: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  orgao: {
    type: String,
    required: true,
  },
  relator: {
    type: String,
    required: true,
  },
  isPresident: {
    type: Boolean,
    required: true,
  },
  redator: {
    type: String,
    required: true,
  },
  dataJulgamento: {
    type: Date,
    required: true,
  },
  dataPublicacao: {
    type: Date,
    required: true,
  },
  ementa: {
    type: String,
    required: true,
  },
  partes: {
    type: [String],
    required: true,
  },
  decisao: {
    type: String,
    required: true,
  },
  indexacao: {
    type: [String],
    required: true,
  },
  paginaInternaUrl: {
    type: String,
    required: true,
  },
  paginaHTML: {
    type: String,
    required: true,
  },
  arquivoPdfUrl: {
    type: String,
    required: true,
  },
  paginaInternaTitulo: {
    type: String,
    required: true,
  },
  paginaInternaSubtitulo: {
    type: String,
    required: true,
  },
  paginaInternaPublicacao: {
    type: String,
    required: true,
  },
  dje: {
    type: String,
    required: true,
  },
  paginaInternaHTML: {
    type: String,
    required: true,
  },
  documentId: {
    type: Number,
    required: true,
  },
  tese: {
    type: String,
    required: true,
  }, 
  tema: {
    type: String,
    required: true,
  }, 
  doutrina: {
    type: String,
    required: true,
  }, 
  legislacao: {
    type: String,
    required: true,
  }, 
  observacao: {
    type: String,
    required: true,
  },
  similares: {
    type: String,
    required: true,
  }
});

export const Judgement = model('Judgement', JudgementSchema);
