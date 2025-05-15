'use client';

export default function AIAdvisorButton() {
  const handleAIAdvisorClick = () => {
    document.getElementById('ai-experts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleAIAdvisorClick}
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 cursor-pointer"
    >
      Try AI Advisor
    </button>
  );
}
