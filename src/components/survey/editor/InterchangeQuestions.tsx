// Interchange Questions tsx

"use client";

import { useSurveyDataContext } from "@/components/providers/SurveyDataProvider";
import QuestionDefault from "../QuestionDefault";
import { updateQuestionFrequency } from "@/services";
import { useNotification } from "@/components/providers/NotificationProvider";

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
          setCollection([...collection, questionToAdd]);
          await updateQuestionFrequency(qid, isCompetitor, 1);
        }
      }
    } catch (error) {
      console.log(error);
      addNotification('Error toggling question', 'error');
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-2xl mt-8 mx-4 mb-2">Add / Remove Questions</h3>

      <div className={`grid grid-cols-5 gap-x-5 gap-y-5`}>
        {collection && collectionMaster?.map((question) => (
          <QuestionDefault key={question.id} qd={question}
            inCollection={collection.some((q) => q.id === question.id)}
            onToggle={() => toggleQuestion(question.id)} />
        ))}
      </div>
    </div>
  );
};

export default InterchangeQuestions;