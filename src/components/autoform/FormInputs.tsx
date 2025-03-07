import { FormInputProps } from '@/types/formTypes';
import TextInput from './TextInput';
import CheckboxInput from './CheckboxInput';
import SwitchInput from './SwitchInput';
import TextareaInput from './TextareaInput';
import SelectInput from './SelectInput';
import MultiSelectInput from './MultiSelectInput';
import DateInput from './DateInput';
import DateTimeInput from './DateTimeInput';

/**
 * FormInput-Komponente, die basierend auf dem Feldtyp das passende Eingabefeld rendert
 */
const FormInput = ({ props, field, fieldState }: FormInputProps) => {
  // Wenn das Feld hidden ist, wird nichts gerendert
  if (props.hidden) return null;

  switch (props.type) {
    case 'email':
    case 'password':
    case 'number':
    case 'tel':
    case 'url':
    case 'string':
      return <TextInput
        field={field}
        fieldState={fieldState}
        type={props.type}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />;
    case 'checkbox':
      return <CheckboxInput
        field={field}
        fieldState={fieldState}
        disabled={props.disabled}
      />;
    case 'switch':
      return <SwitchInput
        field={field}
        fieldState={fieldState}
        disabled={props.disabled}
      />;
    case 'textarea':
      return <TextareaInput
        field={field}
        fieldState={fieldState}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />;
    case 'select':
      return <SelectInput
        field={field}
        fieldState={fieldState}
        options={props.options}
        disabled={props.disabled}
      />;
    case 'multi-select':
      return <MultiSelectInput
        field={field}
        fieldState={fieldState}
        options={props.options}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />;
    case 'date':
      return <DateInput
        field={field}
        fieldState={fieldState}
      />;
    case 'datetime':
      return <DateTimeInput
        field={field}
        fieldState={fieldState}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />;
    default:
      return <p>Feld wurde nicht gefunden</p>;
  }
};

export default FormInput;
