export const formStyles = {
  // Form sections
  section: "bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100",
  sectionTitle: "text-xl font-semibold text-gray-900 mb-4",
  sectionSubtitle: "text-sm text-gray-500 mb-6",
  
  // Form fields
  fieldGroup: "space-y-2 mb-6",
  label: "block text-sm font-medium text-gray-700",
  input: "block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 cursor-text",
  textarea: "block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 min-h-[100px] cursor-text",
  
  // Buttons
  addButton: "inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer",
  removeButton: "inline-flex items-center px-3 py-1 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 cursor-pointer",
  primaryButton: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4f46e5] hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  secondaryButton: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer",
  
  // Tags/Categories
  tagsContainer: "flex flex-wrap gap-2 p-2 rounded-lg border border-gray-300",
  tag: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-[#4f46e5] gap-1",
  tagDelete: "w-4 h-4 text-indigo-400 hover:text-indigo-600 transition-colors duration-200 cursor-pointer",
  tagInput: "flex-1 outline-none bg-transparent min-w-[150px] text-sm",
  
  // Lists
  list: "space-y-4",
  listItem: "border-l-2 border-indigo-200 pl-4 py-2",
  
  // Modal
  modal: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",
  modalContent: "bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6",
  
  // Misc
  error: "bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6",
  success: "bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6"
};
