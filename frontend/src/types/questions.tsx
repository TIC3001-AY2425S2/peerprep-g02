export interface Question {
  readonly _id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string[];
  readonly complexity: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface QuestionResponseData<T> {
  message: string;
  data: T;
}

export interface QuestionPostData {
  readonly title: string;
  readonly description: string;
  readonly category: string[];
  readonly complexity: string;
}

export interface QuestionPatchData {
  readonly _id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string[];
  readonly complexity: string;
}

export interface QuestionDeleteData {
  readonly _id: string;
}

export interface QuestionCategoriesComplexitiesData {
  category: string;
  complexity: string[];
}
