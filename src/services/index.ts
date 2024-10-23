/**
 * Re-export Index File
 * Centralise functions
 */

// Authentication
export { default as signInWithEmail } from '@/services/authentication/signInWithEmail'
export { default as registerWithEmail } from '@/services/authentication/registerWithEmail';
export { default as signOutUser } from '@/services/authentication/signOutUser';

// Database
export { default as getCollectionQuestions } from '@/services/database/getCollectionQuestions';
export { default as checkSurveyNameExistsInB } from '@/services/database/checkSurveyNameExistsInDB';
export { default as saveCollectionInDB } from '@/services/database/saveCollectionInDB';
export { default as getExistingCollectionMetadata } from '@/services/database/getExistingCollectionMetadata';
export { default as updateQuestionFrequency } from '@/services/database/updateQuestionFrequency';
export { default as createQuestion } from '@/services/database/createQuestion';
export { default as getQuestionIdsForSurveyType } from '@/services/database/getQuestionIdsForSurveyType';

// Data Processing
export { default as xlToCleanedDataframe } from '@/services/dataProcessing/xlToCleanedDataframe';
export { default as fillNaSurveyColumns } from '@/services/dataProcessing/fillNaSurveyColumns';
export { default as codeSurveyDummies } from '@/services/dataProcessing/codeSurveyDummies';
export { default as validateSurvey } from '@/services/dataProcessing/validateSurvey';
export { default as mergeData } from '@/services/dataProcessing/mergeData';
export { default as analyseData } from '@/services/dataProcessing/analyseData';
export { default as buildMetadata } from '@/services/dataProcessing/buildMetadata';

// Utils
export { default as generateExcelAIO } from '@/services/utils/generateExcelAIO';
export { default as generateExcelSurvey } from '@/services/utils/generateExcelSurvey';
export { default as getUserValue } from '@/services/utils/getUserValue';