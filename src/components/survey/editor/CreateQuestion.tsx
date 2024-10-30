// Create Question tsx

import { Question } from "@/types/Question";
import { useState } from "react";
import IconGeneral from "../../icons/IconGeneral";
import { useSurveyDataContext } from "../../providers/SurveyDataProvider";
import { useNotification } from "../../providers/NotificationProvider";
import { createQuestion } from "@/services";
import { div } from "framer-motion/client";

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

const CreateQuestion = () => {
  const { collectionMaster, collectionCompetitors, collectionMetadata, collection, setCollection, setUnsavedChanges } = useSurveyDataContext();
  const { addNotification } = useNotification();
  const [question, setQuestion] = useState<Question>(initQuestionData);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const geotechColors = ["FFFFFFCC", "FFCCFFCC", "FFFABF8F", "FFFFCCCC", "FFE4DFEC", "FFCCFFFF", "FFFFFFFF"];
  const geotechColorsTailwind = ["bg-[#FFFFCC]", "bg-[#CCFFCC]", "bg-[#FABF8F]", "bg-[#FFCCCC]", "bg-[#E4DFEC]", "bg-[#CCFFFF]", "bg-[#FFFFFF]"];

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

  /**
   * Create Question
   * @returns 
   */
  const createCustomQuestion = async () => {
    if (!collectionMetadata || !collection) {
      addNotification("No Survey is Loaded", "error");
      return;
    }

    const validId = question.id.trim();
    const validQuestion = question.question.trim();
    const validComment = question.comment.trim();

    if (validId.length <= 0 || validQuestion.length <= 0) {
      addNotification("ID and Question fields cannot be empty", "error");
      return;
    }

    if (collectionMaster?.some((q) => q.id === question.id) || collectionCompetitors?.some((q) => q.id === question.id)) {
      addNotification("ID already exists", "error");
      return;
    }

    // Clean up the options string (if present) by trimming and removing empty values
    const cleanedOptions = question.validBounds.options
      .split(';') // Split by delimiter
      .map(option => option.trim()) // Trim white spaces
      .filter(option => option.length > 0) // Remove empty options
      .join(';'); // Join back with semicolons

    const cleanedMin = question.responseType === 'MinMax' ? question.validBounds.min : question.responseType === 'YesNo' ? 0 : 0;
    const cleanedMax = question.responseType === 'MinMax' ? question.validBounds.min : question.responseType === 'YesNo' ? 1 : 0;

    if (cleanedMin > cleanedMax) {
      addNotification("Max cannot be greater than Min", "error");
      return;
    }

    try {
      await createQuestion(collectionMetadata.name, {
        ...question,
        id: validId,
        question: validQuestion,
        comment: validComment,
        validBounds: {
          ...question.validBounds,
          min: cleanedMin,
          max: cleanedMax,
          options: question.responseType === "List" ? cleanedOptions : ""
        }
      });

      setCollection((prevCollection) => (prevCollection ? [...prevCollection, question] : null));
      setUnsavedChanges(true);
      addNotification("Question Added", "success");
      setQuestion(initQuestionData);
    } catch (error) {
      console.error("Error creating question: ", error);
      addNotification("Error Creating Question", "error");
    }
  }

  const parseComment = (comment: string) => {
    // Replace *word* with <span class="font-bold">word</span>
    const boldedComment = comment.replace(/\*(.*?)\*/g, '<span class="font-bold">$1</span>');

    // Replace _n with a <br />
    const formattedComment = boldedComment.replace(/_n/g, '<br />');

    return formattedComment;
  };


  return (
    <div className={`grid gap-x-4 ${isPreview ? 'grid-cols-4' : 'grid-cols-1'}`}>

      <div className={`${isPreview ? 'col-span-3' : 'col-span-1'} w-full px-6 py-4 my-4 pb-8 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none`}>
        <div className="flex justify-between items-center gap-x-4 mb-4">
          <h3 className="font-semibold text-lg">Create Question</h3>

          <button onClick={() => setIsPreview(!isPreview)} title="Preview Question"
            className="flex text-sm items-center gap-x-2 p-1 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 
                      border border-hsl-l90 dark:border-hsl-l20  hover:border-g-orange hover:dark:border-g-blue">
            Preview
            <IconGeneral type="preview" />
          </button>
        </div>

        {/* ID */}
        <div className="flex flex-col">
          <label htmlFor="id" className="text-sm mb-2 text-hsl-l50">ID</label>
          <input type="text" id="id" name="id" autoComplete="off"
            className='df-input'
            value={question.id} onChange={handleInputChange} />

          {/* QUESTION */}
          <label htmlFor="question" className="text-sm mt-6 mb-2 text-hsl-l50">Question</label>
          <textarea id="question" name="question"
            className="df-input input-resize-content"
            value={question.question} onChange={handleInputChange}
          />

          {/* COMMENT DEFINTION */}
          <div className="flex gap-x-4 items-center mt-6 mb-2">
            <label htmlFor="comment" className="text-sm text-hsl-l50">Comment / Definition</label>
            <div className="group relative cursor-pointer">
              <IconGeneral type="help" className="fill-hsl-l15 dark:fill-hsl-l15" size={20} />
              <div className="group-hover:flex hidden absolute flex-col w-max max-w-[500px] justify-center items-center z-20 p-2 rounded-md 
              bg-hsl-l100 dark:bg-hsl-l20 shadow-lg border border-hsl-l90 dark:border-hsl-l30 ">
                <p className="text-sm">
                  If you want formatted comments:<br />
                  Add asterix (*) around words for bolding<br />
                  Add underscore n (_n) at the end of lines for a line-break<br /><br />
                  Example:<br />This is *bold* and _n this is on a new line<br /><br />
                  Becomes:<br />This is <span className="font-bold">bold</span> and <br />
                  this is on a new line
                </p>
              </div>
            </div>
          </div>

          <textarea id="comment" name="comment"
            className="df-input input-resize-content"
            value={question.comment} onChange={handleInputChange}
          />

          <div className="grid grid-cols-3 gap-x-24">
            {/* CATEGORY TYPE */}
            <div className="col-span-1">
              <p className="text-sm mt-12 mb-2 text-hsl-l50">Category Type</p>
              <div className="flex justify-evenly items-center">
                <button type="button" onClick={() => setQuestion(prev => ({ ...prev, category: "Site" }))}
                  className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.category === 'Site' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95 dark:border-hsl-l20'}`}>Site</button>

                <button type="button" onClick={() => setQuestion(prev => ({ ...prev, category: "Generator" }))}
                  className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.category === 'Generator' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95  dark:border-hsl-l20'}`}>Generator</button>

                <button type="button" onClick={() => setQuestion(prev => ({ ...prev, category: "Competition" }))}
                  className={`text-sm px-4 py-2 bg-hsl-l100 hover:bg-hsl-l98 dark:bg-hsl-l15 dark:hover:bg-hsl-l20 rounded-md border
            ${question.category === 'Competition' ? 'border-g-orange dark:border-g-blue' : 'border-hsl-l95 dark:border-hsl-l20'}`}>Competition</button>
              </div>
            </div>

            {/* RESPONSE TYPE */}
            <div className="col-span-2">
              <p className="text-sm mt-12 mb-2 text-hsl-l50">Response Type</p>
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
                      className='df-input text-center w-full flex-shrink'
                      value={question.validBounds.min} onChange={handleInputChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-hsl-l50" >Max</label>
                    <input type="text" id="max" name="max" autoComplete="off"
                      className='df-input text-center w-full flex-shrink'
                      value={question.validBounds.max} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {question.responseType === 'List' && (
                <div className="flex flex-col self-center">
                  <label className="text-sm text-hsl-l50" >Enter Categorical Values Seperated by Semicolon</label>
                  <input type="text" id="options" name="options" autoComplete="off" placeholder="Retail; Commercial; Industrial; Homemaker"
                    className='df-input text-center w-full'
                    value={question.validBounds.options} onChange={handleInputChange} />
                </div>
              )}
            </div>
          </div>

          <p className="text-sm mt-12 mb-2 text-hsl-l50">Colour</p>
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

          <div className="flex justify-evenly items-center mt-16">
            <button type="button" onClick={() => setQuestion(initQuestionData)}
              className="px-4 py-2 rounded-md bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">Clear</button>
            <button type="button" onClick={createCustomQuestion}
              className="px-4 py-2 rounded-md bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">Create Question</button>
          </div>

        </div>
      </div>

      {/* PREVIEW */}
      <div className={`
        w-full px-6 py-4 my-4 pb-8 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l100 border border-hsl-l95 dark:border-none
        ${isPreview ? 'flex justify-center items-start col-span-1' : 'hidden'} `}>


        <table className="table-auto border-collapse border border-gray-300 w-full">
          <colgroup>
            <col className="w-1/12" /> {/* First column width */}
            <col className="w-10/12" /> {/* Middle column width */}
            <col className="w-1/12" /> {/* Last column width */}
          </colgroup>
          <thead>
            <tr>
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 text-sm leading-4 p-1 text-black dark:text-black">{question.id}</th>
              <th className="border border-gray-300 p-1"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 border-b-2 border-b-red-700"></td>
              <td className={`border border-gray-300 p-2 border-b-2 border-b-red-700 text-center relative group text-black dark:text-black
                ${geotechColorsTailwind[geotechColors.indexOf(question.color)]} ${question.comment.length > 0 && 'cursor-pointer'}`}>
                {/* Question Text */}
                {question.question}
                {/* Comment Icon */}
                {question.comment.length > 0 && (
                  <div className="absolute top-0 right-0 ">
                    <IconGeneral type="comment" size={20} className="fill-red-800 dark:fill-red-800" />
                  </div>
                )}
                {/* Comment Preview */}
                {question.comment.length > 0 && (
                  <div className="group-hover:flex hidden absolute w-max max-w-[500px] z-20 p-2 rounded-md 
                     bg-hsl-l100 dark:bg-hsl-l20 shadow-lg border border-hsl-l90 dark:border-hsl-l30 top-0 right-full  mr-2">
                    <p
                      className="text-sm text-left text-black dark:text-white"
                      dangerouslySetInnerHTML={{ __html: parseComment(question.comment) }} // Insert the parsed comment
                    />
                  </div>
                )}
              </td>
              <td className="border border-gray-300 p-2 border-b-2 border-b-red-700"></td>
            </tr>

            {question.responseType === 'Any' && (
              <>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm text-black dark:text-black`}>Any text (letters or numbers) may be entered</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm text-black dark:text-black`}>No validation will occur</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </>
            )}

            {question.responseType === 'Number' && (
              <>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>-9,999,999</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>9,999,999</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </>
            )}

            {question.responseType === 'YesNo' && (
              <>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>1</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#FFFFCC] text-black dark:text-black`}>0</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </>
            )}

            {question.responseType === 'MinMax' && (
              <>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>{question.validBounds.min}</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>{question.validBounds.max}</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </>
            )}

            {question.responseType === 'List' && (
              question.validBounds.options
                .split(';')
                .map(option => option.trim())
                .filter(option => option.length > 0)
                .map((option, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2"></td>
                    <td className={`border border-gray-300 p-2 text-center text-sm bg-[#CCFFCC] text-black dark:text-black`}>{option}</td>
                    <td className="border border-gray-300 p-2"></td>
                  </tr>
                ))
            )}

          </tbody>
        </table>



      </div>
    </div>

  );
}

export default CreateQuestion;