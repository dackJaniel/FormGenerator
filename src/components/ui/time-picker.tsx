"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TimePickerDemoProps {
    date: Date;
    setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerDemoProps) {
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex items-end gap-2">
            <div className="grid gap-1 text-center">
                <Label htmlFor="hours" className="text-xs">
                    Stunden
                </Label>
                <select
                    id="hours"
                    className={cn(
                        "w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    value={date.getHours()}
                    onChange={(e) => {
                        const newDate = new Date(date);
                        newDate.setHours(parseInt(e.target.value));
                        setDate(newDate);
                    }}
                >
                    {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                            {hour.toString().padStart(2, "0")}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="minutes" className="text-xs">
                    Minuten
                </Label>
                <select
                    id="minutes"
                    className={cn(
                        "w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    value={date.getMinutes()}
                    onChange={(e) => {
                        const newDate = new Date(date);
                        newDate.setMinutes(parseInt(e.target.value));
                        setDate(newDate);
                    }}
                >
                    {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                            {minute.toString().padStart(2, "0")}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
