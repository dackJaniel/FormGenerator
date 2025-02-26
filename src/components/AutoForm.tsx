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
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import MultipleSelector, { Option } from './ui/multi-select';

type Types =
  | 'string'
  | 'checkbox'
  | 'password'
  | 'select'
  | 'textarea'
  | 'number'
  | 'email'
  | 'multi-select';

type Props = {
  type: Types;
  name: string;
  options?: Option[];
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  // variant?: '';
  defaultValue?: string;
  description?: string;
};

const AutoForm = ({ props }: { props: Props[] }) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  props.forEach((prop) => {
    let validator;
    switch (prop.type) {
      case 'email':
        validator = z.string().email();
        break;
      case 'number':
        validator = z.coerce.number();
        break;
      default:
        validator = z.string().min(2).max(50);
    }
    schemaFields[prop.name] = validator;
  });

  const dynamicSchema = z.object(schemaFields);

  // Dynamische defaultValues basierend auf props erstellen
  const defaultFormValue: Record<string, any> = {};
  props.forEach((prop) => {
    defaultFormValue[prop.name] = prop.defaultValue || '';
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {props.map((prop) => (
          <FormField
            key={prop.name}
            control={form.control}
            name={prop.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel hidden={prop.hidden}>{prop.name}</FormLabel>
                <CustomFormInput props={prop} field={field} />
                {prop.description && (
                  <FormDescription>{prop?.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type='submit'>Absenden</Button>
      </form>
    </Form>
  );
};

export default AutoForm;

const CustomFormInput = ({
  props,
  field,
}: {
  props: Partial<Props>;
  field: ControllerRenderProps<
    {
      [x: string]: any;
    },
    string
  >;
}) => {
  switch (props.type) {
    case 'email':
    case 'password':
    case 'number':
    case 'string':
      return (
        <FormControl>
          <Input {...field} {...props} type={props.type} />
        </FormControl>
      );
    case 'checkbox':
      return (
        <FormControl>
          <Checkbox {...field} />
        </FormControl>
      );
    case 'textarea':
      return (
        <FormControl>
          <Textarea {...field} {...props} />
        </FormControl>
      );
    case 'select':
      return (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
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
      console.log(props.options);
      return (
        <MultipleSelector
          {...field}
          options={props.options}
          placeholder='Wochentage auswählen...'
          emptyIndicator={
            <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
              no results found.
            </p>
          }
        />
      );
    default:
      return <p>Feld wurde nicht gefunden</p>;
  }
};
