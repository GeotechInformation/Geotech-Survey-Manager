// Admin Page tsx

"use client";

import Header from "@/components/layout/Header";
import { SurveyDataProvider } from "@/components/providers/SurveyDataProvider";
import RenameCollection from "@/components/survey/admin/RenameCollection";
import ToolbarAdminConsole from "@/components/toolbar/ToolbarAdminConsole";
import { useState } from "react";

type ActionType = 'none' | 'rename';

function Admin() {
  const [curAction, setCurAction] = useState<ActionType>('none');



  return (
    <div className="px-4 mb-8">
      <Header />
      <ToolbarAdminConsole setCurAction={setCurAction} />

      {curAction === 'rename' && (<RenameCollection />)}
    </div>
  );
};


export default function AdminPage() {
  return (
    <SurveyDataProvider>
      <Admin />
    </SurveyDataProvider>
  );
}

