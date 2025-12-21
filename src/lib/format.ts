import { format } from "date-fns";

export function formatDateTime(value?: string | null) {
    if (!value) return "Not yet published";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Incorrect date";
    
    return format(date, "PP p");
}