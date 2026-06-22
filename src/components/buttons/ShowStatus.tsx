import React from 'react';
import { projectStatuses, rfpStatuses } from '../../utils/constants';

interface ShowStatusProps {
  status: number;
  type: 'proposal' | 'vendors' | 'rfps' | 'tendors';
}

const ShowStatus: React.FC<ShowStatusProps> = ({ status, type }) => {
  const getStatusClass = () => {
    switch (status) {
      case 0:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //approved
      case 1:
        return 'bg-violet-50 text-violet-700 border-violet-200 max-w-16';
      //rejected
      case 2:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      //sent for clarification
      case 3:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //sent for approval   
      case 4:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //published
      case 5:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      //closed
      case 6:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      //pending
      case 7:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //sent for open proposal
      case 8:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //under evaluation
      case 9:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      //under award
      case 10:
        return 'bg-amber-50 text-amber-700 border-amber-200 max-w-32';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Find the label dynamically based on type
  const getStatusLabel = () => {
    const statusList =
      type === 'proposal' ? projectStatuses :
        type === 'vendors' ? rfpStatuses :
          rfpStatuses; // default to requestStatuses

    return statusList.find((e: any) => e.value === status)?.label || status;
  };

  return (
    <button className={`py-1.5 px-3 text-xs border rounded-full flex justify-center font-semibold shadow-sm ${getStatusClass()}`}>
      {getStatusLabel()}
    </button>
  );
};

export default ShowStatus;
