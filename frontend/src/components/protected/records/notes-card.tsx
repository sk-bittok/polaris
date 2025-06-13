import { Info, Clipboard } from "lucide-react";

interface NotesCardProps {
  notes?: string;
  id: number;
  title?: string;
  iconColor?: string;
}

const NotesCard: React.FC<NotesCardProps> = ({
  notes,
  id,
  title = "Notes",
  iconColor = "text-purple-600 dark:text-purple-400",
}) => (
  <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-6 md:min-w-[640px] md:max-w-[720px]">
    <div className="flex items-center mb-3">
      <Info size={20} className={`${iconColor} mr-2`} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h2>
    </div>
    {notes ? (
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
        {notes}
      </p>
    ) : (

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <Clipboard
          size={24}
          className="text-gray-400 dark:text-gray-500 mb-2"
        />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          No notes have been added yet
        </p>
        <button
          type="button"
          onClick={() => console.log(`/livestock/${id}/edit`)}
          className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md mt-2"
        >
          Add notes
        </button>
      </div>
    )}
  </div>
);

export default NotesCard;
