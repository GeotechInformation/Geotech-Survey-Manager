// Edit Collection Question Modal tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import ToolbarEditModal from "../survey/editor/ToolbarEditModal";
import IconGeneral from "../icons/IconGeneral";

const DynInterchangeQuestions = dynamic(() => import("../survey/editor/InterchangeQuestions"), { loading: () => <></> });
const DynEditQuestions = dynamic(() => import("../survey/editor/EditQuestions"), { loading: () => <></> });
const DynCreateCompetitor = dynamic(() => import("../survey/editor/CreateCompetitor"), { loading: () => <></> });
const DynCreateQuestion = dynamic(() => import("../survey/editor/CreateQuestion"), { loading: () => <></> });


type ActionType = 'interchange' | 'editQuestion' | 'createQuestion' | 'createComp';
const actionOrder = { interchange: 0, editQuestion: 1, createQuestion: 2, createComp: 3 };

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};


interface EditCollectionQuestionsProps {
  action: ActionType;
  onClose: () => void;
}

const EditCollectionQuestions: React.FC<EditCollectionQuestionsProps> = ({ action, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [curAction, setCurAction] = useState<ActionType>(action);
  const [direction, setDirection] = useState<number>(0);

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

  // Handle action change with direction for animation
  const handleActionChange = (newAction: ActionType) => {
    const newDirection = actionOrder[newAction] > actionOrder[curAction] ? 1 : -1;
    setDirection(newDirection);
    setCurAction(newAction);
  };

  return (
    <div ref={modalRef} className="h-full w-full overflow-y-auto px-8 py-8">
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div onClick={onClose} className="cursor-pointer ml-4">
          <IconGeneral type="arrow-back" size={30} className="hover:fill-g-orange hover:dark:fill-g-blue" />
        </div>
        <h1 className="text-center font-semibold text-xl">Edit Survey</h1>
        <IconGeneral type="arrow-back" size={30} className="fill-transparent dark:fill-transparent" />
      </div>

      {/* Tool Bar */}
      <ToolbarEditModal curAction={curAction} setCurAction={handleActionChange} />

      <div className="relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={curAction}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full pb-8"
          >
            {curAction === 'interchange' && <DynInterchangeQuestions />}
            {curAction === 'createQuestion' && <DynCreateQuestion />}
            {curAction === 'editQuestion' && <DynEditQuestions />}
            {curAction === 'createComp' && <DynCreateCompetitor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditCollectionQuestions;
