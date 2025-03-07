import { z } from "zod";
import { FieldMetadata, Option } from "@/types/schemaTypes";

/**
 * Diese Datei erweitert Zod um die Fähigkeit, UI-bezogene Metadaten zu speichern.
 */

interface ExtendedZodType<T extends z.ZodTypeAny> extends z.ZodTypeAny {
    __fieldMetadata?: FieldMetadata;
}

/**
 * Fügt Metadaten zu einem Zod-Schema hinzu.
 * Diese Metadaten werden später verwendet, um UI-Komponenten zu generieren.
 * 
 * @param schema - Das Zod-Schema, das erweitert werden soll
 * @param metadata - Die Metadaten, die zum Schema hinzugefügt werden sollen
 * @returns Das erweiterte Schema mit angehängten Metadaten
 */
export function withMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: FieldMetadata
): T {
    const metadataKey = "__fieldMetadata";
    const extendedSchema = schema as ExtendedZodType<T>;
    const currentMeta = extendedSchema[metadataKey] || {};
    const newMeta = { ...currentMeta, ...metadata };

    // Speicherung der Metadaten als Eigenschaft am Schema-Objekt
    extendedSchema[metadataKey] = newMeta;

    return schema;
}

/**
 * Erstellt ein String-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function string(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "string", ...metadata });
}

/**
 * Erstellt ein E-Mail-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function email(metadata: FieldMetadata = {}) {
    return withMetadata(z.string().email(), { type: "email", ...metadata });
}

/**
 * Erstellt ein Number-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function number(metadata: FieldMetadata = {}) {
    return withMetadata(z.coerce.number(), { type: "number", ...metadata });
}

/**
 * Erstellt ein Boolean-Schema mit UI-Metadaten als Checkbox
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function boolean(metadata: FieldMetadata = {}) {
    return withMetadata(z.boolean(), { type: "checkbox", ...metadata });
}

/**
 * Erstellt ein Select-Schema mit Optionen und UI-Metadaten
 * @param options - Die Auswahlmöglichkeiten für das Dropdown
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function select(options: Option[], metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), {
        type: "select",
        options,
        ...metadata
    });
}

/**
 * Erstellt ein MultiSelect-Schema mit Optionen und UI-Metadaten
 * @param options - Die Auswahlmöglichkeiten für die Mehrfachauswahl
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function multiSelect(options: Option[], metadata: FieldMetadata = {}) {
    return withMetadata(
        z.array(z.object({ label: z.string(), value: z.any() })),
        { type: "multi-select", options, ...metadata }
    );
}

/**
 * Erstellt ein Textarea-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function textarea(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "textarea", ...metadata });
}

/**
 * Erstellt ein Date-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function date(metadata: FieldMetadata = {}) {
    return withMetadata(z.date(), { type: "date", ...metadata });
}

/**
 * Extrahiert Metadaten aus einem Zod-Schema
 * @param schema - Das Schema, aus dem die Metadaten extrahiert werden sollen
 * @returns Die im Schema gespeicherten Metadaten oder ein leeres Objekt
 */
export function extractMetadata(schema: z.ZodTypeAny): FieldMetadata {
    const extendedSchema = schema as ExtendedZodType<z.ZodTypeAny>;
    return extendedSchema.__fieldMetadata || {};
}
