// Question Sortable tsx

import { Question } from "@/types/Question";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useEffect, useRef, useState } from "react";
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
  const [color, setColor] = useState('#' + qd.color.slice(2));

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipDirectionY, setTooltipDirectionY] = useState("bottom");
  const [tooltipDirectionX, setTooltipDirectionX] = useState("right");

  // Determine tooltip direction based on the viewport position
  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      const { top, right, bottom, left, width, height } = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate the element's vertical and horizontal center positions
      const elementVerticalCenter = top + height / 2;
      const elementHorizontalCenter = left + width / 2;

      // Set horizontal direction based on the center of the element relative to the viewport width
      if (elementHorizontalCenter > viewportWidth / 2) setTooltipDirectionX("left");
      else setTooltipDirectionX("right");

      // Set vertical direction based on the center of the element relative to the viewport height
      if (elementVerticalCenter > viewportHeight / 2) setTooltipDirectionY("top");
      else setTooltipDirectionY("bottom");

    }
  };

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
   * Update color when quesiton edited
   */
  useEffect(() => {
    const color = '#' + qd.color.slice(2);
    setColor(color)
  }, [qd.color]);


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
    <div onMouseEnter={handleMouseEnter}
      ref={setNodeRef} // Set reference for the draggable item
      {...attributes} // Attach sortable attributes
      {...listeners} // Attach sortable event listeners
      style={{ ...style, backgroundColor: geoColor ? color : undefined }} // Apply draggable styles
      className={`group relative flex justify-center items-center min-h-[75px]  rounded-md px-2 py-2 shadow-sm
      bg-hsl-l100 dark:bg-hsl-l20  border border-hsl-l90 dark:border-hsl-l30
      ${searchQuery && searchQuery.trim().length > 0 ? (isHighlighted ? 'ring-1 ring-g-orange' : 'opacity-50') : ''}`}>

      <p className={`text-center text-sm 
        ${geoColor ? 'text-hsl-l5' : 'dark:text-hsl-l95 text-hsl-l5'}`}>{qd.question}</p>

      <div ref={tooltipRef} className="group-hover:flex hidden absolute top-2 right-2  items-center">
        <div className="group/info">
          <IconGeneral type="help" className="fill-hsl-l15 dark:fill-hsl-l15" />

          <div
            className={`group-hover/info:flex flex-col w-max max-w-[300px] justify-center items-center
            hidden absolute z-20 p-2 rounded-md bg-hsl-l100 shadow-lg border border-hsl-l90 dark:border-hsl-l30
            ${tooltipDirectionX === 'right' ? 'left-full' : 'right-full '}
            ${tooltipDirectionY === 'top' ? 'bottom-full ' : 'top-full  '}`}
          >
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