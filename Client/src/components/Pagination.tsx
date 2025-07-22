// import React from 'react';

// interface PaginationProps {
//   currentPage: number;
//   itemsPerPage: number;
//   totalItems: number;
//   onPageChange: (page: number) => void;
// }

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   itemsPerPage,
//   totalItems,
//   onPageChange,
// }) => {
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const handlePageClick = (page: number) => {
//     if (page !== currentPage && page >= 1 && page <= totalPages) {
//       onPageChange(page);
//     }
//   };

//   const getPageNumbers = () => {
//     const delta = 2;
//     const range = [];

//     for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
//       range.push(i);
//     }

//     if (currentPage - delta > 2) {
//       range.unshift('...');
//     }
//     if (currentPage + delta < totalPages - 1) {
//       range.push('...');
//     }

//     range.unshift(1);
//     if (totalPages > 1) {
//       range.push(totalPages);
//     }

//     return range;
//   };

//   return (
//     <div className="flex justify-center mt-6">
//       <nav className="inline-flex space-x-1 text-sm shadow-sm bg-white p-2 rounded-xl border border-gray-200">
//         <button
//           onClick={() => handlePageClick(currentPage - 1)}
//           disabled={currentPage === 1}
//           className={`px-3 py-1 rounded-lg font-medium transition duration-200 ${
//             currentPage === 1
//               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-blue-600 hover:bg-blue-50'
//           }`}
//         >
//           Prev
//         </button>

//         {getPageNumbers().map((page, idx) =>
//           page === '...' ? (
//             <span
//               key={idx}
//               className="px-3 py-1 text-gray-500 font-semibold flex items-center"
//             >
//               ...
//             </span>
//           ) : (
//             <button
//               key={page}
//               onClick={() => handlePageClick(Number(page))}
//               className={`px-3 py-1 rounded-lg font-medium transition duration-200 ${
//                 currentPage === page
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white text-blue-600 hover:bg-blue-50'
//               }`}
//             >
//               {page}
//             </button>
//           )
//         )}

//         <button
//           onClick={() => handlePageClick(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className={`px-3 py-1 rounded-lg font-medium transition duration-200 ${
//             currentPage === totalPages
//               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-blue-600 hover:bg-blue-50'
//           }`}
//         >
//           Next
//         </button>
//       </nav>
//     </div>
//   );
// };

// export default Pagination;
