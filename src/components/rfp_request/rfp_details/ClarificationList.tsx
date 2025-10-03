import React, { useEffect, useState } from 'react';
import { getAllRfpsClarification, sendRfpClarificationRequestAsync } from '../../../services/rfpService';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Clarification {
  id: number;
  vendor: any
  clarificationRequest: string;
  createdAt: string;
  clarificationResponse?: string;
  updatedAt?: string;
}

interface ClarificationListProps {
  rfpId: number | string;
}

const mockClarifications: Clarification[] = [
  // {
  //   id: 1,
  //   vendor: { organisationName: "Microsoft" },
  //   clarificationRequest:
  //     'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex quibusdam,nostrum corporis quos delectus autem officiis amet. Cum sit culpa neque quaerat,laudantium exercitationem perspiciatis accusantium officiis repellat aperiam',
  //   createdAt: '2024-07-07',
  //   // No answer yet
  // },
  // {
  //   id: 2,
  //   vendor: { organisationName: "Microsoft" },
  //   clarificationRequest: 'Can you clarify the delivery timeline?',
  //   createdAt: '2024-07-05',
  //   clarificationResponse: 'Delivery is expected within 30 days.',
  //   updatedAt: '2024-07-06',
  // },
];

const ClarificationList: React.FC<ClarificationListProps> = ({ rfpId }) => {
  const [clarificationsList, setClarificationsList] = useState<Clarification[]>(mockClarifications);
  const [expandedId, setExpandedId] = useState<number | null>(clarificationsList[0]?.id || null);
  const [response, setResponse] = useState<{ [id: number]: string }>({});

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleResponseChange = (id: number, value: string) => {
    setResponse((prev) => ({ ...prev, [id]: value }));
  };

  const handleSend = async(id: number) => {
    const current_clarification = clarificationsList.find(item => item.id == id);
    if (!current_clarification) return;
    // Placeholder for send logic
    console.log(response, "response-----");

    await sendRfpClarificationRequestAsync({ ...current_clarification, clarificationResponse: response[id], IsClarificationSubmitted: true })
    setResponse((prev) => ({ ...prev, [id]: '' }));
    alert(`Response sent for clarification ${id}: ${response[id]}`);
  };

  const setupClarificationsTab = async () => {
    try {
      const clarifications_list = await getAllRfpsClarification(rfpId as number, 0);
      setClarificationsList(clarifications_list);
    } catch (err) {

    }
  }

  useEffect(() => {
    setupClarificationsTab();
  }, [rfpId])

  return (
    <div className="space-y-4">
      {clarificationsList.map((clar) => (
        <div
          key={clar.id}
          className={`rounded-xl border ${expandedId === clar.id ? 'bg-[#F8FAFC] border-[#F1F1F1]' : 'bg-[#F8FBFF] border-blue-200'} transition-all`}
        >
          <div
            className={`flex items-center justify-between px-6 py-4 cursor-pointer ${expandedId === clar.id ? '' : 'font-semibold'}`}
            onClick={() => handleExpand(clar.id)}
          >
            <span className="text-lg font-semibold">{clar?.vendor?.organisationName}</span>
            <span className="text-xl">{expandedId === clar.id ? <ChevronUp /> : <ChevronDown />}</span>
          </div>
          {expandedId === clar.id && (
            <div className="px-6">
              <div className="rounded-xl p-5 mb-2">
                <div className="mb-2 text-xs text-gray-600">Clarification Requested on</div>
                <div className="mb-4 text-sm">{dayjs(clar.createdAt).format("DD-MM-YYYY hh:mm A")}</div>
                <div className="mb-2 text-xs text-gray-600">Clarification comments</div>
                <div className="mb-4 text-black text-sm leading-relaxed">{clar.clarificationRequest}</div>
                {clar.clarificationResponse ? (
                  <>
                    <div className="mb-2 text-xs text-gray-600">Response</div>
                    <div className="mb-2 text-black text-sm leading-relaxed">{clar?.clarificationResponse}</div>
                    <div className="text-xs text-gray-400">Answered on {dayjs(clar.updatedAt).format("DD-MM-YYYY hh:mm A")}</div>
                  </>
                ) : (
                  <div className="rounded-xl mt-4">
                    <label className="block mb-2 text-xs font-medium text-gray-700">Response Comments</label>
                    <textarea
                      className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[70px] mb-2 text-sm"
                      placeholder="Enter your response comments"
                      value={response[clar.id] || ''}
                      onChange={(e) => handleResponseChange(clar.id, e.target.value)}
                    />
                    <div className="flex gap-3">
                      <button
                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
                        onClick={() => handleSend(clar.id)}
                      >
                        Send
                      </button>
                      <button
                        className="px-4 py-1 rounded border border-gray-300 text-gray-700 text-sm bg-white hover:bg-gray-100 transition"
                        onClick={() => setResponse((prev) => ({ ...prev, [clar.id]: '' }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      {clarificationsList.length == 0 && <p className='text-sm py-5 text-center'>No clarification request found</p>}
    </div>
  );
};

export default ClarificationList;
