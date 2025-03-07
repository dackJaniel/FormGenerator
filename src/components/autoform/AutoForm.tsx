'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { getFormSchema } from '@/lib/autoformSchema';
import {
  AutoFormProps,
  DefaultValueItem,
  FieldRequirement,
  FormValues,
  SubmitResult,
} from '@/types/formTypes';
import FormInput from './FormInputs';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SchemaTypes } from '@/schemas/formSchemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

/**
 * AutoForm ist die Hauptkomponente des Systems.
 */

/**
 * Hilfsfunktion zur Bestimmung, ob ein Zod-Schema ein Pflichtfeld darstellt.
 */
const isFieldRequired = (schema: z.ZodTypeAny): boolean => {
  try {
    schema.parse(undefined);
    return false;
  } catch {
    return true;
  }
};

/**
 * Die typsichere AutoForm-Komponente
 */
function AutoForm<T extends SchemaTypes>(props: AutoFormProps<T>) {
  // Extrahiere alle benötigten Props außer options
  const {
    btnName,
    schema,
    defaultValues = [],
    fieldOverrides = {},
    errorMessages = {},
    onSubmit
  } = props;

  // Verwende den tatsächlichen Typ aus props.options ohne explizite Typannotation
  const options = props.options || {};

  const [formError, setFormError] = useState<{ fieldName?: string, message: string } | null>(null);

  // Typsichere Speicherstrukturen für die Formularerstellung
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  const requiredFields: FieldRequirement = {};
  const defaultFormValue: Record<string, unknown> = {};

  // Schema in Props konvertieren mit dem korrekt typisierten options-Objekt
  const props2 = getFormSchema(schema, options, fieldOverrides);

  useEffect(() => {
    // Validiere das Schema und setze Fehlermeldung falls nötig
    if (!props2) {
      setFormError({
        message: `Das Formular kann nicht angezeigt werden. Schema "${schema}" existiert nicht.`
      });
      return;
    }

    if (props2.length === 0) {
      setFormError({
        message: `Das Formular kann nicht angezeigt werden, da es keine Felder enthält.`
      });
      return;
    }

    // Formular-Fehler zurücksetzen, wenn alles in Ordnung ist
    setFormError(null);
  }, [schema, props2]);

  // Schema-Felder verarbeiten, falls das Schema existiert
  if (props2) {
    try {
      props2.forEach((prop) => {
        try {
          // Schema aus den Props extrahieren
          const validator = prop.validator;

          // Pflichtfelder identifizieren und speichern
          requiredFields[prop.name] = isFieldRequired(validator);
          schemaFields[prop.name] = validator;

          // Default-Wert aus den übergebenen Werten finden
          // Hier wird typsicher auf DefaultValueItem<T> geprüft
          const defaultValueItem = defaultValues.find(
            (item: DefaultValueItem<T> | undefined) => {
              if (!item) return false;
              // Prüfung, ob prop.name als Schlüssel existiert
              return prop.name in item;
            }
          );

          // Typsichere Extraktion des tatsächlichen Werts
          const defaultValue = defaultValueItem
            ? (defaultValueItem as Record<string, unknown>)[prop.name]
            : undefined;

          // Feldtyp-spezifische Werteinitalisierung
          if (prop.type === 'multi-select') {
            // MultiSelect benötigt ein Array
            if (defaultValue) {
              defaultFormValue[prop.name] = Array.isArray(defaultValue)
                ? defaultValue
                : [defaultValue];
            } else {
              defaultFormValue[prop.name] = [];
            }
          } else if (prop.type === 'select') {
            // Select-Felder mit Sonderbehandlung für Optionsobjekte
            if (defaultValue) {
              if (
                typeof defaultValue === 'object' &&
                defaultValue !== null &&
                'value' in defaultValue
              ) {
                defaultFormValue[prop.name] = (
                  defaultValue as { value: unknown }
                ).value;
              } else {
                defaultFormValue[prop.name] = defaultValue;
              }
            } else {
              defaultFormValue[prop.name] = '';
            }
          } else {
            // Standardfall für alle anderen Feldtypen
            defaultFormValue[prop.name] =
              defaultValue !== undefined ? defaultValue : '';
          }
        } catch (error) {
          // Fehler bei einem einzelnen Feld
          setFormError({
            fieldName: prop.name,
            message: `Das Formular kann wegen dem Feld "${prop.name}" nicht angezeigt werden. ${error instanceof Error ? error.message : 'Ungültiger Feldtyp oder Konfiguration.'}`
          });
        }
      });
    } catch (error) {
      // Allgemeiner Fehler bei der Formularverarbeitung
      setFormError({
        message: `Ein Fehler ist bei der Formularerstellung aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      });
    }
  }

  // Dynamisches Schema für die Validierung erstellen
  let dynamicSchema: z.ZodObject<any> | null = null;
  try {
    dynamicSchema = z.object(schemaFields);
  } catch (error) {
    if (!formError) {
      setFormError({
        message: `Fehler beim Erstellen des Validierungsschemas: ${error instanceof Error ? error.message : 'Ungültiges Schema'}`
      });
    }
  }

  // Wenn kein gültiges Schema vorhanden ist, früh zurückkehren
  if (!dynamicSchema) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Formularfehler</AlertTitle>
        <AlertDescription>
          {formError?.message || 'Das Formular konnte nicht erstellt werden.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Typsichere Form-Werte basierend auf dem Schema
  type FormSchemaType = z.infer<typeof dynamicSchema>;

  // react-hook-form Setup mit Zod-Validierung und benutzerdefinierten Fehlermeldungen
  const form = useForm<FormSchemaType>({
    resolver: async (values, context, options) => {
      // Werte vorverarbeiten: Leere Strings in optionalen Feldern zu undefined umwandeln
      const processedValues = { ...values };

      // Für jedes Schema-Feld prüfen
      Object.entries(schemaFields).forEach(([key, schema]) => {
        // Nur für optionale Felder
        if (!requiredFields[key]) {
          const value = processedValues[key];

          // Fall 1: Leere Strings in undefined umwandeln
          if (typeof value === 'string' && value === '') {
            processedValues[key] = undefined;
          }

          // Fall 2: Leere Arrays in undefined umwandeln (für Multi-Select)
          if (Array.isArray(value) && value.length === 0) {
            processedValues[key] = undefined;
          }
        }
      });

      // Validierung mit verarbeiteten Werten durchführen
      return zodResolver(dynamicSchema)(processedValues, context, options);
    },
    defaultValues: defaultFormValue as unknown as FormSchemaType,
    // Hier fügen wir eine Logik ein, um die Fehlermeldungen anzupassen
    context: { errorMessages, fieldOverrides }
  });

  /**
   * Formular-Submit-Handler mit typsicherer Verarbeitung
   */
  async function handleSubmit(values: FormSchemaType): Promise<void> {
    try {
      if (onSubmit) {
        // Typenkonvertierung für den übergebenen onSubmit-Handler
        const typedValues = values as unknown as FormValues<T>;
        const res: SubmitResult | void = await onSubmit(typedValues);

        // Fehlerbehandlung
        if (res && 'status' in res && res.status === 'error') {
          console.error(res.message ?? 'Ein Fehler ist aufgetreten');
          return;
        }

        if (res) {
          console.log('Erfolgreich übermittelt:', res);
        }
        return;
      } else {
        // Standardfall, wenn kein onSubmit-Handler übergeben wurde
        console.log('Übermittelte Werte:', values);
      }
    } catch (error) {
      console.error('Fehler beim Submit:', error);
      setFormError({
        message: `Fehler beim Absenden des Formulars: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      });
    }
  }

  // Wenn ein Formularfehler vorliegt, zeigen wir eine Fehlermeldung an
  if (formError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Formularfehler</AlertTitle>
        <AlertDescription>
          {formError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Wenn keine Props vorhanden sind, wird eine Fehlermeldung angezeigt
  if (!props2 || props2.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Formularfehler</AlertTitle>
        <AlertDescription>
          Das Formular kann nicht angezeigt werden, da keine Felder definiert wurden.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-4'
          noValidate>
          {/* Rendering aller Felder aus den Props */}
          {props2.map((prop) => {
            // Versteckte Felder werden komplett übersprungen
            if (prop.hidden === true) return null;

            return (
              <FormField
                key={prop.name}
                control={form.control}
                name={prop.name}
                render={({ field, fieldState }) => (
                  <FormItem>
                    {/* Spezielle Darstellung für Checkbox/Switch vs. andere Feldtypen */}
                    {prop.type === 'checkbox' || prop.type === 'switch' ? (
                      <div className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                        <FormInput
                          props={prop}
                          field={field}
                          fieldState={fieldState}
                        />
                        <div className='space-y-1 leading-none'>
                          <FormLabel>
                            {prop.label} {/* Pflichtfeld-Markierung anzeigen */}
                            {requiredFields[prop.name] && (
                              <span className='text-destructive'>*</span>
                            )}
                          </FormLabel>
                          {prop.description && (
                            <FormDescription>
                              {prop?.description}
                            </FormDescription>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <FormLabel>
                          {prop.label}{' '}
                          {requiredFields[prop.name] && (
                            <span className='text-destructive'>*</span>
                          )}
                        </FormLabel>
                        <FormInput
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
            );
          })}
          <p className='text-sm'>
            <span className='text-destructive'>*</span> Pflichtfelder
          </p>
          <Button type='submit' className='w-full'>
            {btnName ?? 'Absenden'}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default AutoForm;
