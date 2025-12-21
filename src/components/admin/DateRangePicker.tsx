import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
    value?: DateRange;
    onChange: (range?: DateRange) => void;
    className?: string;
};

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
    const label = value?.from
        ? value.to
            ? `${format(value.from, "PP")} - ${format(value.to, "PP")}`
            : format(value.from, "PP")
        : "Pick a date";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value?.from && "text-muted-foreground",
                        className
                    )}
                >
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}