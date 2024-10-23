// Question Sortable tsx

import { Question } from "@/types/Question";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useEffect, useState } from "react";
import IconGeneral from "../icons/IconGeneral";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useSurveyDataContext } from "../providers/SurveyDataProvider";


interface QuestionSortableProps {
  qd: Question;
}

const QuestionSortable: React.FC<QuestionSortableProps> = ({ qd }) => {
  const { geoColor } = useSettingsContext();
  const { searchQuery } = useSurveyDataContext();
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const color = '#' + qd.color.slice(2);

  // useSortable hook from dnd-kit to enable dragging
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: qd.id });

  // Convert the transform into a CSS style to apply dragging
  const style = { transform: CSS.Transform.toString(transform), transition };

  /**
   * Highlight Questions
   */
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length <= 0) return;

    if (qd.question.toLowerCase().includes(searchQuery.toLowerCase())) {
      setIsHighlighted(true);
    } else {
      setIsHighlighted(false);
    }
  }, [searchQuery]);


  /**
   * Format Text
   * Replace asterisks with bold tags. Replace _n with newline <br> tags
   * @param input 
   * @returns 
   */
  function formatText(input: string): string {
    const boldFormatted = input.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    const newLineFormatted = boldFormatted.replace(/_n/g, '<br>');
    return newLineFormatted;
  }


  return (
    <div
      ref={setNodeRef} // Set reference for the draggable item
      {...attributes} // Attach sortable attributes
      {...listeners} // Attach sortable event listeners
      style={{ ...style, backgroundColor: geoColor ? color : undefined }} // Apply draggable styles
      className={`group relative flex justify-center items-center min-h-[75px]  rounded-md px-2 py-2 shadow-sm
      bg-hsl-l100 dark:bg-hsl-l20  border border-hsl-l90 dark:border-hsl-l30
      ${searchQuery && searchQuery.trim().length > 0 ? (isHighlighted ? 'ring-1 ring-g-orange' : 'opacity-50') : ''}`}>

      <p className={`text-center text-sm 
        ${geoColor ? 'text-hsl-l5' : 'dark:text-hsl-l95 text-hsl-l5'}`}>{qd.question}</p>

      <div className="group-hover:flex hidden absolute top-2 right-2  items-center">
        <div className="group/info">
          <IconGeneral type="help" className="fill-hsl-l15 dark:fill-hsl-l15" />

          <div className="group-hover/info:flex flex-col w-max max-w-[200px] justify-center items-center 
          hidden absolute z-20 p-2 rounded-md bg-hsl-l100 shadow-lg border border-hsl-l90 dark:border-hsl-l30">
            <p className="text-sm text-hsl-l50 text-center mb-2 font-semibold">{qd.question}</p>
            <p className="text-xs text-hsl-l50 text-center">ID: {qd.id}</p>
            <p className="text-xs text-hsl-l50 text-center">{qd.validBounds.options.length > 0 ? `Responses: ${qd.validBounds.options}` : `Min/Max: ${qd.validBounds.min} / ${qd.validBounds.max}`}</p>
            <p className="text-xs text-hsl-l50 text-center">Response: {qd.responseType}</p>
            <p className="text-sm text-hsl-l50 mt-2" dangerouslySetInnerHTML={{ __html: formatText(qd.comment) }}></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSortable;