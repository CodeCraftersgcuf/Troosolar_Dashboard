import { ChevronLeft, ChevronRight } from "lucide-react";

const GridPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "items",
  loading = false,
}) => {
  if (loading || totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-[#273e8e] text-white"
                      : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>
      )}
      <p className="text-center text-sm text-gray-500 mt-4">
        Showing {start + 1} - {end} of {totalItems} {itemLabel}
      </p>
    </>
  );
};

export default GridPagination;
