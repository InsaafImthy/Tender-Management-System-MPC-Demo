export interface IQuestionnaire {
  id?: string;
  name: string;
  description?: string;
  questions: IQuestion[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  clientId?: string;
  isActive?: boolean;
}

export interface IQuestion {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  helpText?: string;
  isRequired: boolean;
  options?: string[]; // For multiple choice questions
  order?: number;
}

export enum QuestionType {
  TEXT_INPUT = "Text Input",
  TEXTAREA = "Textarea",
  MULTIPLE_CHOICE = "Multiple Choice",
  SINGLE_CHOICE = "Single Choice",
  YES_NO = "Yes/No",
  DATE = "Date",
  NUMBER = "Number",
  EMAIL = "Email",
  PHONE = "Phone",
  FILE_UPLOAD = "File Upload"
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
