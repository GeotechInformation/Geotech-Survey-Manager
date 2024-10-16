// Toolbar Button

import IconGeneral from "../icons/IconGeneral";

interface ToolbarButtonProps {
  label: string;
  icon: string;
  fnc: (fncParams: any) => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, icon, fnc }) => {
  return (
    <button type="button" onClick={fnc}
      className="group/item flex items-center gap-x-2 hover:bg-hsl-l98 hover:dark:bg-hsl-l25 px-4 py-4 rounded-md">
      <IconGeneral type={icon}
        className="group-hover/item:fill-g-orange group-hover/item:dark:fill-g-blue" />
      <p className="text-sm group-hover/item:text-g-orange dark:group-hover/item:text-g-blue">{label}</p>
    </button>
  );
}

export default ToolbarButton;