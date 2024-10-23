// Interchange Questions tsx

"use client";

import { useSurveyDataContext } from "@/components/providers/SurveyDataProvider";
import QuestionDefault from "../QuestionDefault";
import { updateQuestionFrequency } from "@/services";
import { useNotification } from "@/components/providers/NotificationProvider";
import { useState } from "react";

const InterchangeQuestions = () => {
  const { collection, collectionMaster, setCollection, setUnsavedChanges } = useSurveyDataContext();
  const { addNotification } = useNotification();

  /**
   * Toggle Question or Competitor (in/out of collection) and update frequency
   * @param qid - The question ID to toggle
   */
  const toggleQuestion = async (qid: string) => {
    const isCompetitor = false;

    if (!collection || !collectionMaster) {
      addNotification("Template Survey must be initialized", "error");
      return;
    }

    setUnsavedChanges(true);

    try {
      // Check if the question is already in the collection
      if (collection.some((q) => q.id === qid)) {
        // Removing the question from the collection
        setCollection(collection.filter((q) => q.id !== qid));
        await updateQuestionFrequency(qid, isCompetitor, -1);
      } else {
        const questionToAdd = collectionMaster?.find((q) => q.id === qid);
        if (questionToAdd) {
          const questionIndex = questionToAdd.index;

          // Insert the question back into the collection at the specified `index`
          const newCollection = [...collection];
          newCollection.splice(questionIndex, 0, questionToAdd);

          // Update the collection with the new order
          setCollection(newCollection);
          await updateQuestionFrequency(qid, isCompetitor, 1);
        }
      }
    } catch (error) {
      console.log(error);
      addNotification('Error toggling question', 'error');
    }
  };


  // Merge collection and collectionMaster while prioritizing collection (to include custom questions)
  const customQuestions = collection ? collection.filter(q => !collectionMaster?.some(mq => mq.id === q.id)) : [];


  return (
    <div>
      <h3 className="font-semibold text-2xl mt-8 mx-4 mb-2">Add / Remove Questions</h3>

      <div className={`grid grid-cols-5 gap-x-5 gap-y-5`}>
        {/* Render all questions from collectionMaster first */}
        {collection && collectionMaster && collectionMaster.map((question) => (
          <QuestionDefault key={question.id} qd={question}
            inCollection={collection.some((q) => q.id === question.id)}
            onToggle={() => toggleQuestion(question.id)} />
        ))}

        {/* Render custom questions that are not part of collectionMaster */}
        {customQuestions.map((question) => (
          <QuestionDefault key={question.id} qd={question}
            inCollection={true} // These are always part of the collection
            onToggle={() => toggleQuestion(question.id)} />
        ))}
      </div>
    </div>
  );
};

export default InterchangeQuestions;