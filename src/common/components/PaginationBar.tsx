import { useMemo } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationBarProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
};

function getPageNumbers(current: number, total: number) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, total, current, current - 1, current + 1]);
    const sorted = Array.from(pages)
        .filter((page) => page >= 1 && page <= total)
        .sort((a, b) => a - b);

    const result: Array<number | null> = [];

    for (let index = 0; index < sorted.length; index += 1) {
        const previous = sorted[index - 1];
        const currentPage = sorted[index];

        if (previous && currentPage - previous > 1) {
            result.push(null);
        }

        result.push(currentPage);
    }

    return result;
}

export default function PaginationBar({
    page,
    pageSize,
    total,
    onPageChange,
}: PaginationBarProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const numbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);
    const isPreviousDisabled = page <= 1;
    const isNextDisabled = page >= totalPages;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        aria-disabled={isPreviousDisabled}
                        tabIndex={isPreviousDisabled ? -1 : 0}
                        className={isPreviousDisabled ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => {
                            event.preventDefault();

                            if (!isPreviousDisabled) {
                                onPageChange(Math.max(1, page - 1));
                            }
                        }}
                    />
                </PaginationItem>
                {numbers.map((value, index) => (
                    <PaginationItem key={`${value ?? "gap"}-${index}`}>
                        {value === null ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                isActive={value === page}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onPageChange(value);
                                }}
                            >
                                {value}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        aria-disabled={isNextDisabled}
                        tabIndex={isNextDisabled ? -1 : 0}
                        className={isNextDisabled ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => {
                            event.preventDefault();

                            if (!isNextDisabled) {
                                onPageChange(Math.min(totalPages, page + 1));
                            }
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
