import { FormControl } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { de } from 'date-fns/locale';
import { BaseFieldProps } from '@/types/formFieldTypes';

const DateInput = ({ field, fieldState }: BaseFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={'outline'}
                        className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                            hasError && 'border-destructive focus-visible:ring-destructive'
                        )}>
                        {field.value ? (
                            format(field.value as Date, 'dd.MM.yyyy')
                        ) : (
                            <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
                <div className="p-2">
                    <Calendar
                        mode='single'
                        selected={field.value as Date}
                        onSelect={(date: Date | undefined) => {
                            if (date) {
                                field.onChange(date);
                            } else {
                                field.onChange(undefined);
                            }
                        }}
                        initialFocus
                        locale={de}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default DateInput;
