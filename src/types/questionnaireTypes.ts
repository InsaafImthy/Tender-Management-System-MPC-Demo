export interface IQuestionnaire {
  id?: string;
  questionnaireName: string;
  description?: string;
  questionnaireItemDtos: IQuestion[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  clientId?: string;
  isActive?: boolean;
}

export interface IQuestion {
  id?: string;
  question: string;
  questionType: number;
  questionHelpText?: string;
  isRequired: boolean;
  questionnaireId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}


export interface IQuestionnaireResponse {
  data: IQuestionnaire[];
  count: number;
}

export interface ICreateQuestionnaireRequest {
  name: string;
  description?: string;
  questions: Omit<IQuestion, 'id'>[];
}

export interface IUpdateQuestionnaireRequest extends ICreateQuestionnaireRequest {
  id: string;
}
