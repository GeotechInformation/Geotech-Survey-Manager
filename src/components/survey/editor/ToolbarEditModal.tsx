// Toolbar Edit Modal

"use client";

import { useSurveyDataContext } from "@/components/providers/SurveyDataProvider";
import { useState } from "react";

type ActionType = 'interchange' | 'createQuestion' | 'editQuestion' | 'createComp';

interface ToolbarEditModalProps {
  curAction: ActionType;
  setCurAction: (action: ActionType) => void;
}

const ToolbarEditModal: React.FC<ToolbarEditModalProps> = ({ curAction, setCurAction }) => {
  const { searchQuery, setSearchQuery } = useSurveyDataContext();

  return (
    <div className="w-full px-4 py-2 flex justify-between items-center gap-x-4 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
      <div>
        <button type="button" className="group relative cursor-pointer" onClick={() => setCurAction('interchange')}>
          <p className={`group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium 
        ${curAction === 'interchange' && 'text-g-orange dark:text-g-blue'}`}>Add / Remove</p>
        </button>

        <button type="button" className="group relative cursor-pointer" onClick={() => setCurAction('editQuestion')}>
          <p className={`group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium 
        ${curAction === 'editQuestion' && 'text-g-orange dark:text-g-blue'}`}>Edit Question</p>
        </button>

        <button type="button" className="group relative cursor-pointer" onClick={() => setCurAction('createQuestion')}>
          <p className={`group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium 
        ${curAction === 'createQuestion' && 'text-g-orange dark:text-g-blue'}`}>Create Question</p>
        </button>

        <button type="button" className="group relative cursor-pointer" onClick={() => setCurAction('createComp')}>
          <p className={`group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium 
        ${curAction === 'createComp' && 'text-g-orange dark:text-g-blue'}`}>Create Competitor</p>
        </button>
      </div>

      <input type="text" id="title" name="title" autoComplete="off" placeholder="Search"
        className='df-input bg-white leading-4 text-sm'
        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
    </div>
  );
}

export default ToolbarEditModal;