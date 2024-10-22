/**
 * Question
 */
export interface Question {
  id: string;
  index: number;
  question: string;
  category: string;
  color: string;
  comment: string;
  responseType: string;
  validBounds: {
    min: number;
    max: number;
    options: string;
  }
  surveyType?: {
    freeStand: boolean;
    strip: boolean;
    shoppingCentre: boolean;
    foodPrecinct: boolean;
  }
  frequency?: number;
}

/**
 * Old Question Structure
 */
export interface OldQuestion {
  Category: string;
  Color: string;
  Comment: string;
  ID: string;
  Index: number;
  Max: string;
  Min: string;
  Question: string;
  ResponseType: string;
  SurveyFP: number;
  SurveyFS: number;
  SurveySC: number;
  SurveyStrip: number;
}

