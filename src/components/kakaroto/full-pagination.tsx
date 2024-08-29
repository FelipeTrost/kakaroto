import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "../ui/pagination";

const pagesSpan = 2;
const limit = 15;
export default function FullPagination({
  setPage,
  itemCount,
  currentPage,
}: {
  setPage: (page: number) => void;
  itemCount: number;
  currentPage: number;
}) {
  const count = Math.ceil(itemCount / limit);

  // Pagination is not that good, but i'm happy with it
  const startPage = Math.max(currentPage - pagesSpan + 1, 2);
  const prev = [];
  for (
    let i = startPage;
    i <= startPage + 2 * pagesSpan - 1 && i <= count;
    i++
  ) {
    prev.push(
      <PaginationItem onClick={() => setPage(i)}>
        <PaginationLink isActive={i === currentPage}>{i}</PaginationLink>
      </PaginationItem>,
    );
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem onClick={() => setPage(Math.max(1, currentPage - 1))}>
          <PaginationPrevious href="#" />
        </PaginationItem>

        <PaginationItem onClick={() => setPage(1)}>
          <PaginationLink isActive={currentPage === 1}>1</PaginationLink>
        </PaginationItem>

        {prev}

        {count > pagesSpan && currentPage + pagesSpan < count && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                isActive={currentPage === count}
                onClick={() => setPage(1)}
              >
                {count}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(count, currentPage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
