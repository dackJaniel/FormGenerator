"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { getFormSchema } from "@/lib/autoformSchema";
import { SchemaTypes } from '@/schemas/schemaTypes';
import {
  AutoFormProps,
  DefaultValueItem,
  FieldRequirement,
  FormValues,
  SubmitResult
} from "@/types/formTypes";
import FormInput from "./FormInputs";

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
function AutoForm<T extends SchemaTypes>({
  btnName,
  schema,
  defaultValues = [],
  options = {},
  fieldOverrides = {},
  onSubmit,
}: AutoFormProps<T>) {
  // Typsichere Speicherstrukturen für die Formularerstellung
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  const requiredFields: FieldRequirement = {};
  const defaultFormValue: Record<string, unknown> = {};

  // Schema in Props konvertieren
  const props = getFormSchema(schema, options, fieldOverrides);

  // Schema-Felder verarbeiten, falls das Schema existiert
  if (props) {
    props.forEach((prop) => {
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
      if (prop.type === "multi-select") {
        // MultiSelect benötigt ein Array
        if (defaultValue) {
          defaultFormValue[prop.name] = Array.isArray(defaultValue)
            ? defaultValue
            : [defaultValue];
        } else {
          defaultFormValue[prop.name] = [];
        }
      } else if (prop.type === "select") {
        // Select-Felder mit Sonderbehandlung für Optionsobjekte
        if (defaultValue) {
          if (typeof defaultValue === "object" && defaultValue !== null && "value" in defaultValue) {
            defaultFormValue[prop.name] = (defaultValue as { value: unknown }).value;
          } else {
            defaultFormValue[prop.name] = defaultValue;
          }
        } else {
          defaultFormValue[prop.name] = "";
        }
      } else {
        // Standardfall für alle anderen Feldtypen
        defaultFormValue[prop.name] =
          defaultValue !== undefined ? defaultValue : "";
      }
    });
  }

  // Dynamisches Schema für die Validierung erstellen
  const dynamicSchema = z.object(schemaFields);

  // Typsichere Form-Werte basierend auf dem Schema
  type FormSchemaType = z.infer<typeof dynamicSchema>;

  // react-hook-form Setup mit Zod-Validierung
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: defaultFormValue as unknown as FormSchemaType,
  });

  /**
   * Formular-Submit-Handler mit typsicherer Verarbeitung
   */
  async function handleSubmit(values: FormSchemaType): Promise<void> {
    if (onSubmit) {
      // Typenkonvertierung für den übergebenen onSubmit-Handler
      const typedValues = values as unknown as FormValues<T>;
      const res: SubmitResult | void = await onSubmit(typedValues);

      // Fehlerbehandlung
      if (res && 'status' in res && res.status === "error") {
        console.error(res.message ?? "Ein Fehler ist aufgetreten");
        return;
      }

      if (res) {
        console.log("Erfolgreich übermittelt:", res);
      }
      return;
    } else {
      // Standardfall, wenn kein onSubmit-Handler übergeben wurde
      console.log("Übermittelte Werte:", values);
    }
  }

  // Wenn keine Props vorhanden sind, wird nichts gerendert
  if (!props) {
    return null;
  }

  return (
    <>
      <p>Neues Form</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Rendering aller Felder aus den Props */}
          {props.map((prop) => {
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
                    {prop.type === "checkbox" || prop.type === "switch" ? (
                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                        <FormInput
                          props={prop}
                          field={field}
                          fieldState={fieldState}
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {prop.label}{" "}
                            {/* Pflichtfeld-Markierung anzeigen */}
                            {requiredFields[prop.name] && (
                              <span className="text-destructive">*</span>
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
                          {prop.label}{" "}
                          {requiredFields[prop.name] && (
                            <span className="text-destructive">*</span>
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
          <p className="text-sm">
            <span className="text-destructive">*</span> Pflichtfelder
          </p>
          <Button type="submit" className="w-full">
            {btnName ?? "Absenden"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default AutoForm;
