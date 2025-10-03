import React, { useState } from 'react';
import ShowStatus from '../buttons/ShowStatus';
import { useNavigate } from 'react-router-dom';
import { IRfp } from '../../types/rfpTypes';
import { NoDataIcon } from '../../utils/Icons';

interface NewRequestsCardProp {
  requests: any[]
  trigger:()=>void
}
const NewRequestsCard: React.FC<NewRequestsCardProp> = ({ requests,trigger }: NewRequestsCardProp) => {
  // Example data
  const navigate = useNavigate();
  const [, setSelectedRequest] = useState<IRfp>()
  const [, setIsModalOpen] = useState(false);
  const handleRowClick = (request: any) => {
    if (request.status == "approved") {
      navigate(`/spend_analysys/${request.id}`)
    } else if (request.status == "draft") {
      setSelectedRequest(request);
      setIsModalOpen(true);
    } else {
      navigate(`/request/${request.id}`)
    }
    trigger && trigger();
  }

  return (
    <div className="bg-white h-[100vh] rounded-lg p-4 flex flex-col overflow-y-auto relative">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 bg-white sticky">New tasks</h2>

      {requests.length!==0?<ul className="flex flex-col gap-4">
        {requests.map((request, index) => (
          <li
            key={index}
            className="flex justify-between items-start border-b pb-2 last:border-none cursor-pointer"
            onClick={() => handleRowClick(request)}
          >
            <div>
              {/* <p className="text-sm max-w-[100px] desktop-wide:max-w-[200px] font-medium text-gray-800">{request.projectName}</p> */}
              <div className="w-36 group relative">
                {/* <p className="mb-1 text-gray-500">{request.projectName}</p> */}
                <span className="block truncate text-sm">{request.projectName}</span>

                {/* Tooltip on Hover */}
                <div className="absolute text-xs left-0 top-full hidden group-hover:flex bg-[#EDF4FD] shadow-md p-2 rounded w-max max-w-[300px] z-10 border border-gray-300">
                  {request.projectName}
                </div>
              </div>
              {/* <span className="text-xs text-gray-500">{request?.expenditureType}</span> */}
              <div className="w-36 group relative">
                {/* <p className="mb-1 text-gray-500">{request.projectName}</p> */}
                <span className="block truncate text-xs text-gray-500">{request?.expenditureType}</span>

                {/* Tooltip on Hover */}
                <div className="absolute text-xs left-0 top-full hidden group-hover:flex bg-[#EDF4FD] shadow-md p-2 rounded w-max max-w-[300px] z-10 border border-gray-300">
                  {request.expenditureType}
                </div>
              </div>
            </div>
            <span>
              <ShowStatus status={request.status} type='rfps' />
            </span>
          </li>
        ))}
      </ul>:<div className='h-[80vh] flex justify-center items-center'><span className='text-center text-sm flex flex-col items-center text-gray-400'><NoDataIcon className='w-10 h-10 text-gray-300 m-2'/> No new requests</span></div>}
    </div>
  );
};

export default NewRequestsCard;
