// Question Default tsx

import { Question } from "@/types/Question";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useEffect, useState } from "react";
import { useThemeContext } from "../providers/ThemeProvider";
import IconGeneral from "../icons/IconGeneral";


interface QuestionDefaultProps {
  qd: Question;
  inCollection: boolean;
  onToggle: (qid: string) => void;
}

const QuestionDefault: React.FC<QuestionDefaultProps> = ({ qd, inCollection, onToggle }) => {
  const { geoColor } = useSettingsContext();
  const { isDarkTheme } = useThemeContext();
  const [color, setColor] = useState<string>('');

  useEffect(() => {
    const convertARGBtoHEX = () => {
      const baseColor = "#" + qd.color.slice(2);
      const adjustedColor = isDarkTheme ? darkenColor(baseColor, 0.15) : baseColor;
      setColor(adjustedColor);
    };

    convertARGBtoHEX();
  }, [qd.color, isDarkTheme]);

  const darkenColor = (hex: string, percentage: number): string => {
    // Convert HEX to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    // Reduce brightness by percentage
    r = Math.floor(r * (1 - percentage));
    g = Math.floor(g * (1 - percentage));
    b = Math.floor(b * (1 - percentage));
    // Convert back to HEX
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  function formatText(input: string): string {
    // Replace asterisks with bold tags
    const boldFormatted = input.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    // Replace _n with newline <br> tags
    const newLineFormatted = boldFormatted.replace(/_n/g, '<br>');
    return newLineFormatted;
  }


  return (
    <div className="group bg-transparent relative">

      <div style={{ backgroundColor: geoColor ? color : undefined, opacity: inCollection ? 1 : 0.5 }}
        className="flex justify-center items-center min-h-[75px] rounded-md px-2 py-2 shadow-sm
                bg-hsl-l100 dark:bg-hsl-l20 border border-hsl-l90 dark:border-hsl-l30"
      >
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