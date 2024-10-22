import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slidingVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000, // Slide from the right if going forward
    opacity: 0,
  }),
  center: {
    x: 0, // Center the component
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000, // Slide out to the left
    opacity: 0,
  }),
};

const SlidingComponentExample = () => {
  const [curAction, setCurAction] = useState("interchange");

  // Change action to simulate different states
  const actions = ["interchange", "editQuestion", "createQuestion", "createComp"];
  const [direction, setDirection] = useState(1);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    const currentIndex = actions.indexOf(curAction);
    const newIndex = (currentIndex + newDirection + actions.length) % actions.length;
    setCurAction(actions[newIndex]);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden">
      <button onClick={() => paginate(1)} className="absolute left-2 top-2 bg-blue-300 p-2">
        Next
      </button>
      <button onClick={() => paginate(-1)} className="absolute right-2 top-2 bg-blue-300 p-2">
        Prev
      </button>

      <AnimatePresence custom={direction} initial={false}>
        {curAction === "interchange" && (
          <motion.div
            key="interchange"
            custom={direction}
            variants={slidingVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-full h-full bg-red-400 flex justify-center items-center"
          >
            <h3 className="text-white text-2xl">Add / Remove Questions</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence custom={direction} initial={false}>
        {curAction === "editQuestion" && (
          <motion.div
            key="editQuestion"
            custom={direction}
            variants={slidingVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-full h-full bg-green-400 flex justify-center items-center"
          >
            <h3 className="text-white text-2xl">Edit Question</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence custom={direction} initial={false}>
        {curAction === "createQuestion" && (
          <motion.div
            key="createQuestion"
            custom={direction}
            variants={slidingVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-full h-full bg-blue-400 flex justify-center items-center"
          >
            <h3 className="text-white text-2xl">Create Question</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence custom={direction} initial={false}>
        {curAction === "createComp" && (
          <motion.div
            key="createComp"
            custom={direction}
            variants={slidingVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-full h-full bg-yellow-400 flex justify-center items-center"
          >
            <h3 className="text-white text-2xl">Create Competitor</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlidingComponentExample;
