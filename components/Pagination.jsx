"use client"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    onPageChange(page);
    
    // Add a small delay to ensure DOM has updated with new page content before scrolling
    setTimeout(() => {
      // Scroll to Featured Listings section with smooth behavior
      const featuredSection = document.getElementById('featured-listings');
      if (featuredSection) {
        featuredSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center my-8">
      {/* Page indicator */}
      <div className="mb-4 text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <nav className="inline-flex rounded-md shadow">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>
        {totalPages <= 5 ? (
          // Show all page numbers if 5 or fewer pages
          [...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === idx + 1 ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
              }`}
              aria-label={`Page ${idx + 1}`}
              aria-current={currentPage === idx + 1 ? "page" : undefined}
            >
              {idx + 1}
            </button>
          ))
        ) : (
          // Show limited page numbers with ellipsis for more than 5 pages
          <>
            {/* First page always shown */}
            <button
              onClick={() => handlePageChange(1)}
              className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
              }`}
              aria-label="Page 1"
              aria-current={currentPage === 1 ? "page" : undefined}
            >
              1
            </button>
            
            {/* Show ellipsis if not near the start */}
            {currentPage > 3 && (
              <span className="py-2 px-4 border border-gray-300 bg-white text-sm text-gray-500">
                ...
              </span>
            )}
            
            {/* Pages around current page */}
            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              // Show current page and one page before/after
              if (
                (pageNum > 1 && pageNum < totalPages) && // Not first or last page
                (Math.abs(pageNum - currentPage) <= 1) // Within 1 of current page
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === pageNum ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            {/* Show ellipsis if not near the end */}
            {currentPage < totalPages - 2 && (
              <span className="py-2 px-4 border border-gray-300 bg-white text-sm text-gray-500">
                ...
              </span>
            )}
            
            {/* Last page always shown */}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
              }`}
              aria-label={`Page ${totalPages}`}
              aria-current={currentPage === totalPages ? "page" : undefined}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;