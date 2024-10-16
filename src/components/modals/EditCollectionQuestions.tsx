// Create Survey Name tsx

"use client";

import { useNotification } from "../providers/NotificationProvider";
import { useEffect, useRef, useState } from "react";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import QuestionDefault from "../survey/QuestionDefault";
import IconGeneral from "../icons/IconGeneral";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";


const DynCreateCompetitor = dynamic(() => import("../survey/CreateCompetitor"), { loading: () => <></> });
const DynCreateQuestion = dynamic(() => import("../survey/CreateQuestion"), { loading: () => <></> });


interface EditCollectionQuestionsProps {
  isCreatingQuestion: boolean;
  isCreatingComp: boolean;
  onClose: () => void;
}

const EditCollectionQuestions: React.FC<EditCollectionQuestionsProps> = ({ isCreatingQuestion, isCreatingComp, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();
  const { collection, setCollection, collectionMaster, setUnsavedChanges } = useSurveyDataContext();
  const [isCreateQuestion, setIsCreateQuestion] = useState<boolean>(isCreatingQuestion);
  const [isCreateComp, setIsCreateComp] = useState<boolean>(isCreatingComp);

  // Handle clicking outside and pressing the Esc key
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Disable scrolling

    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscapePress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapePress);

    return () => {
      document.body.style.overflow = ""; // Restore scrolling when modal is closed
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [onClose]);

  const toggleCreateQuestion = () => {
    setIsCreateQuestion(!isCreateQuestion);
    setIsCreateComp(false);
  }

  const toggleCreateComp = () => {
    setIsCreateComp(!isCreateComp);
    setIsCreateQuestion(false);
  }


  /**
   * Toggle Question (in/out of collection)
   * @param qid 
   * @returns 
   */
  const toggleQuestion = (qid: string) => {
    if (!collection || !collectionMaster) {
      addNotification("Template Survey must be initialised", "error");
      return
    };

    setUnsavedChanges(true); // Track Changes

    if (collection.some((q) => q.id === qid)) {
      // Remove the question from the collection
      setCollection(collection.filter((q) => q.id !== qid));
    } else {
      // Find the question in the collectionMaster
      const questionToAdd = collectionMaster.find((q) => q.id === qid);
      if (questionToAdd) {
        setCollection([...collection, questionToAdd]); // Add the question to the collection
      }
    }
  };


  return (
    <div ref={modalRef} className="h-full w-full overflow-y-auto px-8 py-8">

      <div className="flex justify-between items-center mb-8">
        <div onClick={onClose} className="cursor-pointer ml-4">
          <IconGeneral type="arrow-back" size={30} className="hover:fill-g-orange hover:dark:fill-g-blue" />
        </div>
        <h1 className="text-center font-semibold text-xl">Edit Survey</h1>
        <IconGeneral type="arrow-back" size={30} className="fill-transparent dark:fill-transparent" />
      </div>

      <div className="w-full px-4 py-2 flex items-center rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
        <button type="button" className="group relative cursor-pointer" onClick={toggleCreateQuestion}>
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Create Question</p>
        </button>

        <button type="button" className="group relative cursor-pointer" onClick={toggleCreateComp}>
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Create Competitor</p>
        </button>
      </div>


      <AnimatePresence>
        {isCreateQuestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: "100%" }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <DynCreateQuestion />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateComp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: "100%" }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <DynCreateCompetitor />
          </motion.div>
        )}
      </AnimatePresence>


      <h3 className="font-semibold text-2xl mt-8 mx-4 mb-2">Add / Remove Questions</h3>
      <div className={`grid grid-cols-5 gap-x-5 gap-y-5`}>
        {collection && collectionMaster?.map((question) => (
          <QuestionDefault key={question.id} qd={question} inCollection={collection.some((q) => q.id === question.id)} onToggle={toggleQuestion} />
        ))}
      </div>


    </div>
  );
};

export default EditCollectionQuestions;