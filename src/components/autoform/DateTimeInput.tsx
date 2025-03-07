import { FormControl } from '../ui/form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { de } from 'date-fns/locale';
import { DateTimeFieldProps } from '@/types/formFieldTypes';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TimePicker } from '../ui/time-picker';

const DateTimeInput = ({ field, fieldState, placeholder, disabled }: DateTimeFieldProps) => {
    const hasError = !!fieldState.error;
    const [date, setDate] = useState<Date | undefined>(field.value as Date | undefined);
    const [isOpen, setIsOpen] = useState(false);

    // Synchronisiere das lokale Datum mit dem Formularfeld
    useEffect(() => {
        if (field.value) {
            setDate(field.value as Date);
        }
    }, [field.value]);

    // Handle Zeitänderungen
    const handleTimeChange = (newTime: Date) => {
        if (!date) return;

        const updatedDate = new Date(date);
        updatedDate.setHours(newTime.getHours());
        updatedDate.setMinutes(newTime.getMinutes());

        setDate(updatedDate);
        field.onChange(updatedDate);
    };

    // Handle Datumsänderungen
    const handleDateChange = (newDate: Date | undefined) => {
        if (!newDate) {
            setDate(undefined);
            field.onChange(undefined);
            return;
        }

        // Behalte die aktuelle Zeit bei, wenn bereits ein Datum ausgewählt ist
        if (date) {
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
        }

        setDate(newDate);
        field.onChange(newDate);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !date && "text-muted-foreground",
                            hasError && "border-destructive focus-visible:ring-destructive"
                        )}
                        disabled={disabled}
                    >
                        {date ? (
                            format(date, "dd.MM.yyyy HH:mm", { locale: de })
                        ) : (
                            <span>{placeholder || "Datum und Uhrzeit auswählen"}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2 space-y-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        locale={de}
                        initialFocus
                    />
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-sm">Uhrzeit</span>
                        </div>
                        <div className="mt-2">
                            {date && (
                                <TimePicker
                                    date={date}
                                    setDate={handleTimeChange}
                                />
                            )}
                            {!date && (
                                <p className="text-sm text-muted-foreground">Bitte zuerst ein Datum auswählen</p>
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default DateTimeInput;
