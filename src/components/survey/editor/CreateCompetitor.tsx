// Create Competitor tsx

"use client";

import { useState } from "react";
import IconGeneral from "../../icons/IconGeneral";
import QuestionDefault from "../QuestionDefault";
import { useSurveyDataContext } from "../../providers/SurveyDataProvider";
import { useNotification } from "../../providers/NotificationProvider";
import { createQuestion, updateQuestionFrequency } from "@/services";
import { Question } from "@/types/Question";

interface Competitor {
  name: string;
  inSight: boolean;
  in250: boolean;
  inSightOr250: boolean;
  inCentre: boolean;
  in500: boolean;
  custom: string;
}

const blankCompetitor = { name: '', inSight: false, in250: false, inSightOr250: false, inCentre: false, in500: false, custom: '' };

const CreateCompetitor = () => {
  const { collection, collectionCompetitors, setCollection, setCollectionCompetitors, setUnsavedChanges } = useSurveyDataContext();
  const { addNotification } = useNotification();
  const [competitors, setCompetitors] = useState<Competitor[]>([blankCompetitor]);
  const [sort, setSort] = useState<boolean>(true);

  // Add a new blank competitor
  const addCompetitor = () => {
    setCompetitors([...competitors, { ...blankCompetitor }]);
  };

  // Update competitor field
  const updateCompetitorField = (idx: number, field: keyof Competitor, value: any) => {
    const updatedCompetitors = competitors.map((comp, i) =>
      i === idx ? { ...comp, [field]: value } : comp
    );
    setCompetitors(updatedCompetitors);
  };

  // Toggle boolean fields
  const toggleCompetitorField = (idx: number, field: keyof Competitor) => {
    const updatedCompetitors = competitors.map((comp, i) => i === idx ? { ...comp, [field]: !comp[field] } : comp);
    setCompetitors(updatedCompetitors);
  };

  // Delete a competitor
  const deleteCompetitor = (idx: number) => {
    const updatedCompetitors = competitors.filter((_, i) => i !== idx);
    setCompetitors(updatedCompetitors);
  };

  /**
  * Create Competitors in Database
  */
  const createCompetitorsInDB = async () => {
    if (!collection || !collectionCompetitors) {
      addNotification("Existing collection must be loaded", "error");
      return;
    }
    // Filter out competitors without a name
    const validCompetitors = competitors.filter(comp => comp.name.trim());

    // No competitors to add
    if (validCompetitors.length === 0) return;

    try {
      let allCompQuestionObjects = [];

      // Process each valid competitor
      for (const comp of validCompetitors) {
        // Check if at least one distance field is selected
        const hasDistance =
          comp.inSight || comp.in250 || comp.inSightOr250 || comp.inCentre || comp.in500 || comp.custom.trim().length > 0;

        if (!hasDistance) {
          addNotification(`Competitor ${comp.name} must have at least one distance selected`, "error");
          return;
        }

        // Add competitor questions based on selected fields
        if (comp.inSightOr250) allCompQuestionObjects.push({ id: `CiSight-250m-${comp.name}`, question: `${comp.name} in Sight or 250m` });
        if (comp.inSight) allCompQuestionObjects.push({ id: `CiSight-${comp.name}`, question: `${comp.name} in Sight` });
        if (comp.inCentre) allCompQuestionObjects.push({ id: `CiCentre-${comp.name}`, question: `${comp.name} in Centre` });
        if (comp.in250) allCompQuestionObjects.push({ id: `Ci250m-${comp.name}`, question: `${comp.name} in 250m` });
        if (comp.in500) allCompQuestionObjects.push({ id: `Ci500m-${comp.name}`, question: `${comp.name} in 500m` });
        if (comp.custom.trim().length > 0) allCompQuestionObjects.push({ id: `CiDist-${comp.name}`, question: `${comp.name} in ${comp.custom}` });
      }

      // Check for duplicates in collectionCompetitors
      for (const comp of allCompQuestionObjects) {
        if (collectionCompetitors.some(q => q.id === comp.id)) {
          addNotification(`Competitor ${comp.question} already exists`, "error");
          return;
        }
      }

      // Create Question Object
      const newQuestions = allCompQuestionObjects.map((compQuestion) => ({
        id: compQuestion.id,
        index: 999,
        question: compQuestion.question,
        category: "Competition",
        color: "FFFFCCCC",
        comment: "",
        responseType: "YesNo",
        validBounds: { min: 0, max: 1, options: "" },
      }));

      // Determine the insert position in collection
      const comIndex = collection.findIndex((q) => q.id.startsWith("COM"));
      const insertIndex = comIndex === -1 ? collection.length : comIndex;

      // Insert all new questions at the determined position
      const updatedCollection = [
        ...collection.slice(0, insertIndex),
        ...newQuestions,
        ...collection.slice(insertIndex),
      ];

      // Update the collection and collectionCompetitors
      setUnsavedChanges(true);
      setCompetitors([blankCompetitor]);
      setCollection(updatedCollection);
      setCollectionCompetitors((prevCompetitors) => prevCompetitors ? [...prevCompetitors, ...newQuestions] : newQuestions);

      // Send each question to the database
      for (const question of newQuestions) {
        await createQuestion("#_CompetitorCollection", question);
      }

      addNotification("Competitors successfully added to the database", "success");
    } catch (error) {
      console.error("Error creating competitors: ", error);
      addNotification("Error creating competitors", "error");
    }
  };


  /**
   * Toggle Question or Competitor (in/out of collection) and update frequency
   * @param qid - The question ID to toggle
   */
  const toggleQuestion = async (qid: string) => {
    const isCompetitor = true;

    if (!collection || !collectionCompetitors) {
      addNotification("Template Survey must be initialized", "error");
      return;
    }

    setUnsavedChanges(true);

    try {
      // Check if the question/competitor is already in the collection
      if (collection.some((q) => q.id === qid)) {
        // Removing the question/competitor from the collection
        setCollection(collection.filter((q) => q.id !== qid));
        await updateQuestionFrequency(qid, isCompetitor, -1);

      } else {
        const competitorToAdd = collectionCompetitors?.find((q) => q.id === qid);
        if (competitorToAdd) {
          // Insert competitor before the first "COM" question
          const comIndex = collection.findIndex((q) => q.id.startsWith("COM"));
          const insertIndex = comIndex === -1 ? collection.length : comIndex;

          // Update the collection
          const updatedCollection = [
            ...collection.slice(0, insertIndex),
            competitorToAdd,
            ...collection.slice(insertIndex),
          ];

          setCollection(updatedCollection);
          await updateQuestionFrequency(qid, isCompetitor, 1); // Increment frequency
        }
      }
    } catch (error) {
      console.log(error);
      addNotification('Error toggling question', 'error');
    }
  };

  /**
   * Sort Competitors
   * @returns 
   */
  const sortCompetitors = () => {
    if (!collectionCompetitors) return;
    const curSort = !sort;
    setSort(!sort);

    let sorted = [...collectionCompetitors];

    if (curSort) sorted.sort((a, b) => a.question.localeCompare(b.question));
    else sorted.sort((a, b) => b.frequency! - a.frequency!);

    setCollectionCompetitors(sorted);
  };


  return (
    <div>
      <div className="w-full px-4 py-4 my-4 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
        <div className="flex items-center gap-x-4 mb-2">
          <h3 className="font-semibold text-lg">Create Competitors</h3>
        </div>

        <div className="flex flex-col gap-y-4">
          {competitors.map((comp, idx) => (
            <div key={idx} className="flex justify-between items-center">
              {/* Name */}
              <input type="text" id="name" name="name" autoComplete="off" placeholder={`Major Competitor ${idx + 1}`}
                className='df-input leading-4'
                value={comp.name} onChange={(e) => updateCompetitorField(idx, 'name', e.target.value)} />

              {/* Toggle Distances */}
              <div className="flex items-center gap-x-4">
                <button type="button" onClick={() => toggleCompetitorField(idx, 'inSight')}
                  className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 dark:border-hsl-l30 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inSight ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                  In Sight
                </button>

                <button type="button" onClick={() => toggleCompetitorField(idx, 'in250')}
                  className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 dark:border-hsl-l30 hover:border-g-orange dark:hover:border-g-blue
              ${comp.in250 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                  In 250m
                </button>

                <button type="button" onClick={() => toggleCompetitorField(idx, 'inSightOr250')}
                  className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 dark:border-hsl-l30 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inSightOr250 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                  In Sight or 250m
                </button>

                <button type="button" onClick={() => toggleCompetitorField(idx, 'inCentre')}
                  className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 dark:border-hsl-l30 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inCentre ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                  In Centre
                </button>

                <button type="button" onClick={() => toggleCompetitorField(idx, 'in500')}
                  className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 dark:border-hsl-l30 hover:border-g-orange dark:hover:border-g-blue
              ${comp.in500 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                  In 500
                </button>

                <input type="text" placeholder="Custom"
                  className="df-input leading-3 text-sm max-w-[100px]"
                  value={comp.custom}
                  onChange={(e) => updateCompetitorField(idx, 'custom', e.target.value)} />
              </div>

              {/* Delete */}
              <button className="group" onClick={() => deleteCompetitor(idx)}>
                <IconGeneral type="delete" className="group-hover:fill-rose-500 group-hover:dark:fill-rose-700" />
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addCompetitor}
          className="flex items-center text-sm mt-4 px-1 py-1 pr-2 rounded-md cursor-pointer
             bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">
          <IconGeneral type="add" className="fill-black dark:fill-white" size={20} />
          Add Another Competitor
        </button>

        <div className="flex justify-end mt-8">
          <button type="button" onClick={createCompetitorsInDB}
            className="px-4 py-2 rounded-md bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">Create Competitors</button>
        </div>
      </div>



      <div className="flex justify-between items-center px-4 mt-8 mb-2">
        <h3 className="font-semibold text-2xl">Add Competitors</h3>
        <div className="flex items-center gap-x-2">
          {/* 
          <input type="text" id="question" name="question" autoComplete="off" placeholder="Search"
            className='df-input leading-4 text-sm mr-8'
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> */}

          <button onClick={sortCompetitors} title="Sort Alphabetical or Popularity"
            className="flex text-sm items-center gap-x-2 p-1 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 
              border border-hsl-l90 dark:border-hsl-l20  hover:border-g-orange hover:dark:border-g-blue">
            Sort
            <IconGeneral type={sort ? 'alphabetical' : 'trending'} />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-5 gap-x-5 gap-y-5`}>
        {collection && collectionCompetitors?.map((question) => (
          <QuestionDefault key={question.id} qd={question}
            inCollection={collection.some((q) => q.id === question.id)}
            onToggle={() => toggleQuestion(question.id)} />
        ))}
      </div>
    </div>
  );
}

export default CreateCompetitor;