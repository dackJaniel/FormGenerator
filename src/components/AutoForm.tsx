import { ControllerRenderProps, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import MultipleSelector, { Option } from './ui/multi-select';
import { cn } from '@/lib/utils';
import { getFormSchema, SchemaTypes } from '@/lib/formSchemas';

type Types =
  | 'string'
  | 'checkbox'
  | 'switch'
  | 'password'
  | 'select'
  | 'textarea'
  | 'number'
  | 'email'
  | 'multi-select';

export type Props = {
  type: Types;
  name: string;
  options?: Option[];
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string | boolean | Option | Option[];
  description?: string;
  validator: z.ZodTypeAny;
};

const isFieldRequired = (schema: z.ZodTypeAny): boolean => {
  try {
    schema.parse(undefined);
    return false;
  } catch {
    return true;
  }
};

const AutoForm = ({
  btnName,
  schema,
}: {
  btnName?: string;
  schema: SchemaTypes;
}) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  const requiredFields: Record<string, boolean> = {};

  const props = getFormSchema(schema);
  if (!props) {
    return;
  }

  props.forEach((prop) => {
    // Verwende immer den benutzerdefinierten Validator
    const validator = prop.validator;

    // Speichern, ob das Feld required ist
    requiredFields[prop.name] = isFieldRequired(validator);
    schemaFields[prop.name] = validator;
  });

  const dynamicSchema = z.object(schemaFields);

  // Dynamische defaultValues basierend auf props erstellen
  const defaultFormValue: Record<string, any> = {};
  props.forEach((prop) => {
    if (prop.type === 'multi-select') {
      if (prop.defaultValue) {
        // Prüfen ob es ein einzelnes Objekt oder ein Array ist
        if (Array.isArray(prop.defaultValue)) {
          defaultFormValue[prop.name] = prop.defaultValue;
        } else {
          defaultFormValue[prop.name] = [prop.defaultValue];
        }
      } else {
        defaultFormValue[prop.name] = [];
      }
    } else if (prop.type === 'select') {
      if (prop.defaultValue) {
        // Wenn ein Objekt übergeben wird, extrahieren wir den value
        if (
          typeof prop.defaultValue === 'object' &&
          'value' in prop.defaultValue
        ) {
          defaultFormValue[prop.name] = prop.defaultValue.value;
        } else {
          defaultFormValue[prop.name] = prop.defaultValue;
        }
      } else {
        defaultFormValue[prop.name] = '';
      }
    } else {
      defaultFormValue[prop.name] = prop.defaultValue || '';
    }
  });

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: defaultFormValue,
  });

  function onSubmit(values: z.infer<typeof dynamicSchema>) {
    console.log('Übermittelte Werte:', values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4'
        noValidate>
        {props.map((prop) => (
          <FormField
            key={prop.name}
            control={form.control}
            name={prop.name}
            render={({ field, fieldState }) => (
              <FormItem>
                {prop.type === 'checkbox' || prop.type === 'switch' ? (
                  <div className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                    <CustomFormInput
                      props={prop}
                      field={field}
                      fieldState={fieldState}
                    />
                    <div className='space-y-1 leading-none'>
                      <FormLabel hidden={prop.hidden}>
                        {prop.name}{' '}
                        {requiredFields[prop.name] && (
                          <span className='text-destructive'>*</span>
                        )}
                      </FormLabel>
                      {prop.description && (
                        <FormDescription>{prop?.description}</FormDescription>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <FormLabel hidden={prop.hidden}>
                      {prop.name}{' '}
                      {requiredFields[prop.name] && (
                        <span className='text-destructive'>*</span>
                      )}
                    </FormLabel>
                    <CustomFormInput
                      props={prop}
                      field={field}
                      fieldState={fieldState}
                    />
                    {prop.description && (
                      <FormDescription>{prop?.description}</FormDescription>
                    )}
                  </>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type='submit'>{btnName ?? 'Absenden'}</Button>
        <p className='text-sm'>
          <span className='text-destructive'>*</span> Sind Pflichtfelder
        </p>
      </form>
    </Form>
  );
};

export default AutoForm;

const CustomFormInput = ({
  props,
  field,
  fieldState,
}: {
  props: Partial<Props>;
  field: ControllerRenderProps<
    {
      [x: string]: any;
    },
    string
  >;
  fieldState: { error?: { message?: string } };
}) => {
  const hasError = !!fieldState.error;

  // Extrahieren der sicheren HTML-Eigenschaften für Input/Textarea
  const { type, placeholder, disabled } = props;

  switch (props.type) {
    case 'email':
    case 'password':
    case 'number':
    case 'string':
      return (
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </FormControl>
      );
    case 'checkbox':
      return (
        <FormControl>
          <Checkbox
            checked={field.value}
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
            checked={field.value}
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
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </FormControl>
      );
    case 'select':
      return (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          value={field.value}>
          <FormControl>
            <SelectTrigger
              className={cn(
                hasError && 'border-destructive focus-visible:ring-destructive'
              )}>
              <SelectValue placeholder='Bitte auswählen' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {props.options && props?.options?.length >= 0 ? (
              props.options?.map((option) => (
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
            placeholder={props.placeholder || 'Bitte auswählen...'}
            onChange={(selectedOptions) => {
              field.onChange(selectedOptions);
            }}
            emptyIndicator={
              <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                Keine Ergebnisse gefunden.
              </p>
            }
            className={cn(hasError && 'border-destructive')}
          />
        </FormControl>
      );
    default:
      return <p>Feld wurde nicht gefunden</p>;
  }
};
