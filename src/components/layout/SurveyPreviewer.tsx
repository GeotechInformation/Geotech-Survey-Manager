// Survey Previewer tsx

import { motion } from "framer-motion";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";



const SurveyPreviewer = () => {
  const { collection } = useSurveyDataContext();

  const geotechColors = ["FFFFFFCC", "FFCCFFCC", "FFFABF8F", "FFFFCCCC", "FFE4DFEC", "FFCCFFFF", "FFFFFFFF"];
  const geotechColorsTailwind = ["bg-[#FFFFCC]", "bg-[#CCFFCC]", "bg-[#FABF8F]", "bg-[#FFCCCC]", "bg-[#E4DFEC]", "bg-[#CCFFFF]", "bg-[#FFFFFF]"];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full my-4 px-4 py-4 gap-x-2 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95  border-t-2 dark:border-none "
    >

      <div className="grid grid-flow-col overflow-x-auto pb-2">
        {collection?.map((qd, idx) => (
          <div key={idx}
            className="flex flex-col min-w-[150px]">
            <p className="border border-gray-300 text-xxs leading-4 p-1 text-center dark:border-black">{qd.id}</p>

            <p className={`text-sm flex-grow border border-gray-300 dark:border-black p-2 border-b-2 border-b-red-700  text-center relative group text-black dark:text-black
          ${geotechColorsTailwind[geotechColors.indexOf(qd.color)]}`}>
              {qd.question}
            </p>
          </div>
        ))}
      </div>

    </motion.div>
  );
};

export default SurveyPreviewer;