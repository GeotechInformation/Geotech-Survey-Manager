// Prelimary Analysis Page tsx

"use client";

import Header from "@/components/layout/Header";
import { AnalysisDataProvider } from "@/components/providers/AnalysisDataProvider";
import FileInput from "@/components/analysis/FileInput";
import SurveyNameInput from "@/components/analysis/SurveyNameInput";
import SurveyValidateButton from "@/components/analysis/SurveyValidateButton";
import AIOMergeButton from "@/components/analysis/AIOMergeButton";
import AnalyseButton from "@/components/analysis/AnalyseButton";
import DownloadButton from "@/components/analysis/DownloadButton";
import Preview from "@/components/analysis/Preview";

import renameCollection from "@/services/database/admin/renameCollectionInDB";
import migrateQuestions from "@/services/migrateQuestion";

function PrelimAnalysis() {

  const updateBackEnd = async () => {
    try {
      // await migrateQuestions('CompetitionSurveyCollection');
      // await renameCollection();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col h-full px-4">
      <Header />

      <div className="flex flex-auto">
        <div className="h-full w-full grid grid-cols-4 gap-x-8 p-4">

          <div className="col-span-3 overflow-hidden h-full">
            <Preview />
          </div>

          <div className="col-span-1 flex flex-col">
            <div className="flex flex-col gap-y-4">
              <FileInput fileType='aio' />
              <FileInput fileType='sales' />
              <FileInput fileType="survey" />
            </div>
            <SurveyNameInput />
            <div className="flex flex-col gap-y-4 mb-10">
              <SurveyValidateButton />
              <AIOMergeButton />
              <AnalyseButton />
            </div>
            <DownloadButton />
            {/* <button type="button" className="text-4xl bg-red-600 rounded-lg" onClick={updateBackEnd}>KILL BUTTON</button> */}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PrelimAnalysisPage() {

  return (
    <AnalysisDataProvider>
      <PrelimAnalysis />
    </AnalysisDataProvider>
  );
}



