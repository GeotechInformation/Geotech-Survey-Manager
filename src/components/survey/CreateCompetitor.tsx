// Create Competitor tsx

import { useState } from "react";
import IconGeneral from "../icons/IconGeneral";

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
  const [competitors, setCompetitors] = useState<Competitor[]>([blankCompetitor])

  // Add a new blank competitor
  const addCompetitor = () => {
    setCompetitors([...competitors, { ...blankCompetitor }]);
  };

  // Update competitor field
  const updateCompetitorField = (idx: number, field: keyof Competitor, value: any) => {
    const updatedCompetitors = competitors.map((comp, i) => i === idx ? { ...comp, [field]: value } : comp);
    setCompetitors(updatedCompetitors);
  };

  // Toggle boolean fields
  const toggleCompetitorField = (idx: number, field: keyof Competitor) => {
    const updatedCompetitors = competitors.map((comp, i) => i === idx ? { ...comp, [field]: !comp[field] } : comp);
    setCompetitors(updatedCompetitors);
  };




  return (
    <div className="w-full px-4 py-4 my-4 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
      <div className="flex items-center gap-x-4 mb-4">
        <h3 className="font-semibold text-lg">Create Competitors</h3>
        <button type="button" onClick={addCompetitor}
          className="bg-cyan-500 hover:bg-cyan-400 rounded-sm cursor-pointer dark:bg-cyan-600 dark:hover:bg-cyan-700">
          <IconGeneral type="add" className="fill-white dark:fill-white" />
        </button>
      </div>

      <div className="flex flex-col gap-y-6">
        {competitors.map((comp, idx) => (
          <div key={idx} className="flex justify-between items-center">
            {/* Name */}
            <input type="text" id="name" name="name" autoComplete="off" placeholder={`Major Competitor ${idx + 1}`}
              className='df-input leading-4'
              value={comp.name} onChange={(e) => updateCompetitorField(idx, 'name', e.target.value)} />

            {/* Toggle Distances */}
            <div className="flex items-center gap-x-4">
              <button type="button" onClick={() => toggleCompetitorField(idx, 'inSight')}
                className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inSight ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                In Sight
              </button>

              <button type="button" onClick={() => toggleCompetitorField(idx, 'in250')}
                className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 hover:border-g-orange dark:hover:border-g-blue
              ${comp.in250 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                In 250m
              </button>

              <button type="button" onClick={() => toggleCompetitorField(idx, 'inSightOr250')}
                className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inSightOr250 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                In Sight or 250m
              </button>

              <button type="button" onClick={() => toggleCompetitorField(idx, 'inCentre')}
                className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 hover:border-g-orange dark:hover:border-g-blue
              ${comp.inCentre ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                In Centre
              </button>

              <button type="button" onClick={() => toggleCompetitorField(idx, 'in500')}
                className={`text-sm px-2 py-1 rounded-sm  border border-hsl-l95 hover:border-g-orange dark:hover:border-g-blue
              ${comp.in500 ? 'bg-g-orange dark:bg-g-blue text-white' : 'bg-hsl-l95 dark:bg-hsl-l20'}`}>
                In 500
              </button>
            </div>

            {/* Delete */}
            <button>
              <IconGeneral type="delete" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CreateCompetitor;