import { FormControl } from '../ui/form';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import MultipleSelector from '../ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { FormInputProps } from '@/types/formTypes';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
// Import für deutsche Lokalisierung
import { de } from 'date-fns/locale';

/**
 * FormInput-Komponente, die basierend auf dem Feldtyp das passende Eingabefeld rendert
 */
const FormInput = ({ props, field, fieldState }: FormInputProps) => {
  const hasError = !!fieldState.error;

  // Wenn das Feld hidden ist, wird nichts gerendert
  if (props.hidden) return null;

  // Extraktion der sicheren HTML-Eigenschaften für Input/Textarea
  const { type, placeholder, disabled } = props;

  switch (props.type) {
    case 'email':
    case 'password':
    case 'number':
    case 'tel':
    case 'url':
    case 'string':
      return (
        <FormControl>
          <Input
            {...field}
            // Sicherstellen, dass `value` immer ein String ist
            value={field.value === null || field.value === undefined ? '' :
              typeof field.value === 'object' ?
                JSON.stringify(field.value) : String(field.value)}
            type={type}
            placeholder={placeholder || ''}
            disabled={disabled}
            onChange={(e) => {
              // Leere Eingabe als undefined verarbeiten, sonst den normalen Wert
              const value = e.target.value === '' ? undefined : e.target.value;
              field.onChange(value);
            }}
            className={cn(
              'placeholder:text-xs',
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </FormControl>
      );
    case 'checkbox':
      return (
        <FormControl>
          <Checkbox
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
            disabled={disabled}
            className={cn(hasError && 'border-destructive')}
          />
        </FormControl>
      );
    case 'switch':
      return (
        <FormControl>
          <Switch
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
            disabled={disabled}
            className={cn(hasError && 'border-destructive')}
          />
        </FormControl>
      );
    case 'textarea':
      return (
        <FormControl>
          <Textarea
            {...field}
            value={field.value as string}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'placeholder:text-xs',
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </FormControl>
      );
    case 'select':
      return (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value as string}
          value={field.value as string}
          disabled={disabled}>
          <FormControl>
            <SelectTrigger
              className={cn(
                hasError && 'border-destructive focus-visible:ring-destructive'
              )}
              disabled={disabled}>
              <SelectValue placeholder='Bitte auswählen' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {props.options && props.options.length >= 0 ? (
              props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <small>Keine Auswahlmöglichkeiten</small>
            )}
          </SelectContent>
        </Select>
      );
    case 'multi-select':
      return (
        <FormControl>
          <MultipleSelector
            value={Array.isArray(field.value) ? field.value : []}
            defaultOptions={props.options || []}
            placeholder={placeholder || 'Bitte auswählen...'}
            onChange={(selectedOptions) => {
              field.onChange(selectedOptions);
            }}
            disabled={disabled}
            emptyIndicator={
              <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                Keine weiteren Ergebnisse gefunden.
              </p>
            }
            className={cn(
              'placeholder:text-xs',
              hasError && 'border-destructive'
            )}
          />
        </FormControl>
      );
    case 'date':
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
                onSelect={(date) => {
                  if (date) {
                    // Stellen Sie sicher, dass ein gültiges Date-Objekt übergeben wird
                    field.onChange(date);
                  } else {
                    // Bei Abwahl setzen wir undefined, was als Pflichtfeldfehler erkannt wird
                    field.onChange(undefined);
                  }
                }}
                // Die Einschränkung auf Future-Dates entfernt, damit auch Geburtsdaten wählbar sind
                initialFocus
                locale={de} // Deutsche Lokalisierung über date-fns/locale
              />
            </div>
          </PopoverContent>
        </Popover>
      );
    default:
      return <p>Feld wurde nicht gefunden</p>;
  }
};

export default FormInput;
