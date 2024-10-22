// Question Container tsx

"use client";

import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, } from '@dnd-kit/sortable';
import { useSettingsContext } from "../providers/SettingsProvider";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import QuestionSortable from "./QuestionSortable";
import { Question } from "@/types/Question";

const QuestionContainer = () => {
  const { QGridColumns } = useSettingsContext();
  const { collection, setCollection, setUnsavedChanges } = useSurveyDataContext();

  const gridColsClasses = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5',
    'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12'];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } })
  );


  // Handle drag end and reorder the collection
  const handleDragEnd = (event: any) => {
    if (!collection) return;
    const { active, over } = event;

    if (active.id !== over.id) {
      setUnsavedChanges(true);
      const oldIndex = collection.findIndex((question: Question) => question.id === active.id);
      const newIndex = collection.findIndex((question: Question) => question.id === over.id);

      setCollection((items) => {
        if (!items) return items; // Return early if items is null

        const updatedItems = arrayMove(items, oldIndex, newIndex);

        // Update the .index property of each question
        return updatedItems.map((item, index) => ({
          ...item,
          index // Set the index property to the current index
        }));
      });

    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={collection || []} strategy={rectSortingStrategy} >
        <div className={`px-4 py-4 grid gap-x-8 ${gridColsClasses[QGridColumns - 1]} gap-y-10`}>
          {collection?.map((question) => (
            <QuestionSortable key={question.id} qd={question} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuestionContainer;
