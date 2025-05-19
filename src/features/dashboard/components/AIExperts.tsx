'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const aiExperts = [
  {
    id: 'dr-ai',
    name: 'Dr. AI',
    title: 'Medical Assistant',
    description: 'Get quick health status and symptoms analysis with virtual medical consultation.',
    color: 'bg-violet-100',
    textColor: 'text-violet-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'legalai',
    name: 'LegalAI',
    title: 'Legal Assistant',
    description: 'Understand legal documents, contracts, and get preliminary legal advice instantly.',
    color: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    id: 'financeai',
    name: 'FinanceAI',
    title: 'Finance Advisor',
    description: 'Get personalized investment advice, budget planning, and financial forecasting.',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'taxai',
    name: 'TaxAI',
    title: 'Tax Assistant',
    description: 'Navigate tax questions, deductions, and filing requirements with instant guidance.',
    color: 'bg-orange-100',
    textColor: 'text-orange-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function AIExperts() {
  return (
    <div id="ai-experts">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Experts On Demand</h2>
          <p className="mt-1 text-sm text-gray-500">
            Available 24/7 with subscription - no scheduling required
          </p>
        </div>
        <Link href="/ai/subscription" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            View all
            <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiExperts.map((expert) => (
          <div
            key={expert.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col"
          >
            <div className={`${expert.color} p-6`}>
              <div className={`${expert.textColor} mb-4`}>
                {expert.icon}
              </div>
              <h3 className="font-semibold text-gray-900">
                {expert.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{expert.title}</p>
            </div>
            <div className="p-6 flex-grow">
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {expert.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-2">Available 24/7</span>
                </div>
                <Link
                  href={`/ai/${expert.id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Call Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
