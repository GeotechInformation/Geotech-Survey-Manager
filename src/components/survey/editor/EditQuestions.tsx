// Interchange Questions tsx

"use client";

import IconGeneral from "@/components/icons/IconGeneral";
import { useSurveyDataContext } from "@/components/providers/SurveyDataProvider";
import { Question } from "@/types/Question";
import { useState } from "react";

const initQuestionData: Question = {
  id: "",
  index: 999,
  question: "",
  category: "Site",
  color: "FFFFFFCC",
  comment: "",
  responseType: "Any",
  validBounds: { min: 0, max: 0, options: "" }
}

const geotechColors = ["FFFFFFCC", "FFCCFFCC", "FFFABF8F", "FFFFCCCC", "FFE4DFEC", "FFCCFFFF", "FFFFFFFF"];
const geotechColorsTailwind = ["bg-[#FFFFCC]", "bg-[#CCFFCC]", "bg-[#FABF8F]", "bg-[#FFCCCC]", "bg-[#E4DFEC]", "bg-[#CCFFFF]", "bg-[#FFFFFF]"];

const EditQuestions = () => {
  const { collection } = useSurveyDataContext();
  const [question, setQuestion] = useState<Question>(initQuestionData)

  /**
   * Handle Input Change
   * @param e 
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "min" || name === "max" || name === "options") {
      // Handle changes to validBounds (min/max/options)
      setQuestion(prev => ({
        ...prev,
        validBounds: {
          ...prev.validBounds,
          [name]: name === "min" || name === "max" ? parseInt(value) || 0 : value // Ensure min/max are integers, options is a string
        }
      }));
    } else {
      // Handle all other changes
      setQuestion(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const updateQuestion = () => {

  }

  return (
    <div className="h-[80vh] px-2 py-4">
      <h3 className="font-semibold text-lg">Edit Question</h3>


      <div className="grid grid-cols-2 h-full gap-x-8">

        <div className="flex-grow flex-shrink-0 h-full overflow-y-auto hidden-scrollbar">
          {collection?.map((q, idx) => (
            <div key={idx} onClick={() => setQuestion(q)}
              className="my-2 px-2 py-1 rounded-lg cursor-pointer"
              style={{ backgroundColor: "#" + q.color.slice(2) }}>{q.question}</div>
          ))}
        </div>

        <div className="flex flex-col px-6 py-4 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
          {/* ID */}
          <div className="flex flex-col">
            <label htmlFor="id" className="text-sm mb-2 text-hsl-l50">ID</label>
            <input type="text" id="id" name="id" autoComplete="off"
              className='df-input'
              value={question?.id} onChange={handleInputChange} />

            {/* QUESTION */}
            <label htmlFor="question" className="text-sm mt-6 mb-2 text-hsl-l50">Question</label>
            <textarea id="question" name="question"
              className="df-input input-resize-content"
              value={question.question} onChange={handleInputChange}
            />

            {/* COMMENT DEFINTION */}
            <label htmlFor="comment" className="text-sm text-hsl-l50 mt-6 mb-2">Comment / Definition</label>
            <textarea id="comment" name="comment"
              className="df-input input-resize-content max-h-[7lh]"
              value={question.comment} onChange={handleInputChange}
            />
          </div>

          {/* RESPONSE TYPE */}
          <div className="col-span-2">
            <p className="text-sm mt-6 mb-2 text-hsl-l50">Response Type</p>
            <div className="flex justify-evenly items-center mb-4">
              <button type="button" onClick={() => setQuestion(prev => ({ ...prev, responseType: "Any" }))}
                className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.responseType === 'Any' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95 dark:border-hsl-l20'}`}>Any</button>

              <button type="button" onClick={() => setQuestion(prev => ({ ...prev, responseType: "Number" }))}
                className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.responseType === 'Number' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95  dark:border-hsl-l20'}`}>Number</button>

              <button type="button" onClick={() => setQuestion(prev => ({ ...prev, responseType: "YesNo" }))}
                className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.responseType === 'YesNo' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95 dark:border-hsl-l20'}`}>Yes / No</button>

              <button type="button" onClick={() => setQuestion(prev => ({ ...prev, responseType: "MinMax" }))}
                className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.responseType === 'MinMax' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95  dark:border-hsl-l20'}`}>Min Max</button>

              <button type="button" onClick={() => setQuestion(prev => ({ ...prev, responseType: "List" }))}
                className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.responseType === 'List' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95 dark:border-hsl-l20'}`}>List</button>
            </div>

            {question.responseType === 'MinMax' && (
              <div className="flex justify-center items-center gap-x-8">
                <div className="flex flex-col">
                  <label className="text-sm text-hsl-l50" >Min</label>
                  <input type="text" id="min" name="min" autoComplete="off"
                    className='df-input leading-3 text-center w-full flex-shrink'
                    value={question.validBounds.min} onChange={handleInputChange} />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-hsl-l50" >Max</label>
                  <input type="text" id="max" name="max" autoComplete="off"
                    className='df-input leading-3 text-center w-full flex-shrink'
                    value={question.validBounds.max} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {question.responseType === 'List' && (
              <div className="flex flex-col self-center">
                <label className="text-sm text-hsl-l50" >Enter Categorical Values Seperated by Semicolon</label>
                <input type="text" id="options" name="options" autoComplete="off" placeholder="Retail; Commercial; Industrial; Homemaker"
                  className='df-input leading-3 text-center w-full'
                  value={question.validBounds.options} onChange={handleInputChange} />
              </div>
            )}
          </div>

          <p className="text-sm mt-6 text-hsl-l50">Colour</p>
          <div className="flex justify-evenly items-center">
            {geotechColors.map((hex, idx) => (
              <div key={idx} onClick={() => setQuestion(prev => ({ ...prev, color: hex }))}
                className={`cursor-pointer flex justify-center items-center w-[45px] h-[45px] rounded-md 
                border border-hsl-l70 dark:border-hsl-l15 hover:border-g-orange hover:dark:border-g-blue hover:border-2
                ${geotechColorsTailwind[idx]}
                ${question.color === hex && 'border-hsl-l20 dark:border-hsl-l80'}`}>
                {question.color === hex && <IconGeneral type="add" className="fill-black dark:fill-black" />}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-auto">
            <button type="button" onClick={updateQuestion}
              className="px-4 py-2 rounded-md bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">Update Question</button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EditQuestions;