// Question Default tsx

import { Question } from "@/types/Question";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useEffect, useMemo, useState } from "react";
import IconGeneral from "../icons/IconGeneral";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";


interface QuestionDefaultProps {
  qd: Question;
  inCollection: boolean;
  onToggle: (qid: string) => void;
}

const QuestionDefault: React.FC<QuestionDefaultProps> = ({ qd, inCollection, onToggle }) => {
  const { geoColor } = useSettingsContext();
  const { searchQuery } = useSurveyDataContext();
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const [color, setColor] = useState('#' + qd.color.slice(2));

  /**
   * Update color when quesiton edited
   */
  useEffect(() => {
    const color = '#' + qd.color.slice(2);
    setColor(color);
  }, [qd.color]);

  /**
   * Memoize Opacity
   */
  const opacity = useMemo(() => {
    let opacity = 1;

    if (searchQuery && searchQuery.trim().length > 0) {
      if (!isHighlighted) opacity -= 0.3;
    }

    if (!inCollection) opacity -= 0.5;

    return opacity;
  }, [inCollection, isHighlighted, searchQuery]);

  /**
   * Highlight Questions
   */
  useEffect(() => {
    const highlight = !!(searchQuery && searchQuery.trim().length > 0 && qd.question.toLowerCase().includes(searchQuery.toLowerCase()));
    setIsHighlighted(highlight);
  }, [searchQuery]);


  /**
   * Format Text
   * Replace asterisks with bold tags. Replace _n with newline <br> tags
   * @param input 
   * @returns 
   */
  const formatText = (input: string): string => {
    return input
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>') // Bold formatting
      .replace(/_n/g, '<br>'); // Newline formatting
  };


  return (
    <div className="group bg-transparent relative">

      <div style={{ backgroundColor: geoColor ? color : undefined, opacity: opacity }}
        className={`group relative flex justify-center items-center min-h-[75px]  rounded-md px-2 py-2 shadow-sm
          bg-hsl-l100 dark:bg-hsl-l20  border border-hsl-l90 dark:border-hsl-l30
          ${isHighlighted ? 'ring-2 ring-g-orange' : ''}`}>

        <p className={`text-center text-sm select-none
        ${geoColor ? 'text-hsl-l5' : 'dark:text-hsl-l95 text-hsl-l5'}`}>{qd.question}</p>
      </div>

      <div className="group-hover:flex hidden absolute top-2 right-2 items-center gap-x-2">
        {inCollection && (
          <div className="group/info">
            <IconGeneral type="help" className="fill-hsl-l15 dark:fill-hsl-l15" />

            <div className="group-hover/info:flex flex-col w-max max-w-[200px] justify-center items-center 
          hidden absolute z-50 p-2 rounded-md bg-hsl-l100 shadow-lg border border-hsl-l90 dark:border-hsl-l30">
              <p className="text-sm text-hsl-l50 text-center mb-2 font-semibold">{qd.question}</p>
              <p className="text-xs text-hsl-l50 text-center">ID: {qd.id}</p>
              <p className="text-xs text-hsl-l50 text-center">{qd.validBounds.options.length > 0 ? `Responses: ${qd.validBounds.options}` : `Min/Max: ${qd.validBounds.min} / ${qd.validBounds.max}`}</p>
              <p className="text-xs text-hsl-l50 text-center">Response: {qd.responseType}</p>
              <p className="text-sm text-hsl-l50 mt-2" dangerouslySetInnerHTML={{ __html: formatText(qd.comment) }}></p>
            </div>
          </div>
        )}

        <div onClick={() => onToggle(qd.id)} className="cursor-pointer">
          {inCollection ? (
            <IconGeneral type="close-circle" className="fill-hsl-l15 dark:fill-hsl-l15 hover:fill-rose-500 dark:hover:fill-rose-600" />
          ) : (
            <IconGeneral type="add-circle" className="fill-hsl-l15 dark:fill-hsl-l15 hover:fill-cyan-500 dark:hover:fill-cyan-600" />
          )}
        </div>
      </div>

    </div>
  );
};

export default QuestionDefault;