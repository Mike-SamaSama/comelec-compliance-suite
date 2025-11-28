import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: string;
}

export default function PhaseTracker({ checklistItems }: { checklistItems?: ChecklistItem[] }) {
  // Fallback data if no items are passed
  const items = checklistItems || [
    { id: '1', label: 'Discovery', status: 'completed' },
    { id: '2', label: 'Planning', status: 'current' },
    { id: '3', label: 'Execution', status: 'upcoming' },
  ];

  return (
    <div className="relative w-full py-4">
      {/* Progress Line Background */}
      <div className="absolute left-0 top-[1.25rem] -z-10 h-1 w-full bg-gray-100" />
      
      <div className="flex w-full flex-row justify-between">
        {items.map((phase) => {
          let circleClasses = "flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all bg-white ";
          
          // Status-based styling logic
          if (phase.status === 'completed') {
            circleClasses += "border-green-500 text-green-500";
          } else if (phase.status === 'in-progress' || phase.status === 'current') {
            circleClasses += "border-blue-600 text-blue-600 scale-110 shadow-md";
          } else {
            circleClasses += "border-gray-200 text-gray-300";
          }

          return (
            <div key={phase.id} className="flex flex-col items-center gap-2">
              {/* Icon Circle */}
              <div className={circleClasses}>
                {phase.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                {(phase.status === 'in-progress' || phase.status === 'current') && <Clock className="h-5 w-5 animate-pulse" />}
                {(phase.status === 'pending' || phase.status === 'upcoming') && <Circle className="h-4 w-4" />}
              </div>
              
              {/* Label */}
              <span className="text-xs font-medium text-center hidden sm:block max-w-[80px]">
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}