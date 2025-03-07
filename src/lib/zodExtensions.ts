import { z } from "zod";
import { FieldMetadata, Option } from "@/types/schemaTypes";

/**
 * Diese Datei erweitert Zod um die Fähigkeit, UI-bezogene Metadaten zu speichern.
 */

// Symbol als eindeutige ID für unsere Metadaten
const META_KEY = Symbol("fieldMetadata");

// Standardfehlermeldung für Pflichtfelder
const REQUIRED_ERROR_MESSAGE = "Dieses Feld ist ein Pflichtfeld";

/**
 * Fügt Metadaten zu einem Zod-Schema hinzu.
 * Diese werden direkt am Schema-Objekt und mit einem Symbol gespeichert,
 * damit sie auch bei Validierungsketten nicht verloren gehen.
 */
export function withMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: FieldMetadata
): T {
    const extendedSchema = schema as any;

    // Backward-Kompatibilität mit bestehender Implementierung
    const currentMeta = extendedSchema.__fieldMetadata || {};
    extendedSchema.__fieldMetadata = { ...currentMeta, ...metadata };

    // Zusätzliche Symbol-basierte Speicherung für bessere Persistenz
    extendedSchema[META_KEY] = { ...currentMeta, ...metadata };

    // Überschreiben der .optional()-Methode, um Metadaten zu erhalten
    if (typeof extendedSchema.optional === 'function') {
        const originalOptional = extendedSchema.optional;
        extendedSchema.optional = function () {
            const optSchema = originalOptional.apply(this);
            return withMetadata(optSchema, extendedSchema[META_KEY] || {});
        };
    }

    // Validierungsmethoden patchen, um Metadaten zu erhalten
    patchValidationMethods(extendedSchema);

    return schema;
}

/**
 * Patcht die gängigen Validierungsmethoden eines Schemas, um Metadaten zu erhalten
 */
function patchValidationMethods(schema: any): void {
    // Für String-spezifische Methoden
    if (schema instanceof z.ZodString) {
        const methods = ['min', 'max', 'length', 'email', 'url', 'uuid', 'cuid', 'regex', 'startsWith', 'endsWith'];
        methods.forEach(method => {
            if (typeof (schema as any)[method] === 'function') {
                const originalMethod = (schema as any)[method];
                (schema as any)[method] = function (...args: any[]) {
                    const result = originalMethod.apply(this, args);
                    // Metadaten aus dem aktuellen Schema verwenden
                    const currentMeta = (schema as any)[META_KEY] || {};
                    return withMetadata(result, currentMeta);
                };
            }
        });
    }

    // Für Number-spezifische Methoden
    if (schema instanceof z.ZodNumber) {
        const methods = ['min', 'max', 'int', 'positive', 'negative', 'nonpositive', 'nonnegative'];
        methods.forEach(method => {
            if (typeof (schema as any)[method] === 'function') {
                const originalMethod = (schema as any)[method];
                (schema as any)[method] = function (...args: any[]) {
                    const result = originalMethod.apply(this, args);
                    // Metadaten aus dem aktuellen Schema verwenden
                    const currentMeta = (schema as any)[META_KEY] || {};
                    return withMetadata(result, currentMeta);
                };
            }
        });
    }

    // Allgemeine Methoden für alle Schema-Typen
    ['optional', 'nullable', 'nullish', 'default', 'catch', 'refine', 'superRefine', 'transform', 'pipe'].forEach(method => {
        if (typeof schema[method] === 'function') {
            const originalMethod = schema[method];
            schema[method] = function (...args: any[]) {
                const result = originalMethod.apply(this, args);
                // Metadaten aus dem aktuellen Schema verwenden
                const currentMeta = schema[META_KEY] || {};
                return withMetadata(result, currentMeta);
            };
        }
    });
}

/**
 * Verbesserte Metadaten-Extraktion, die tiefer nach Metadaten sucht
 */
export function extractMetadata(schema: z.ZodTypeAny): FieldMetadata {
    if (!schema) return {};

    // Symbol-basierte Metadaten haben höchste Priorität
    const anySchema = schema as any;
    if (anySchema[META_KEY]) {
        return { ...anySchema[META_KEY] }; // Objekt klonen, um Typprobleme zu vermeiden
    }

    // Dann die normale Eigenschaft
    if (anySchema.__fieldMetadata) {
        return { ...anySchema.__fieldMetadata };
    }

    try {
        // Versuche Metadaten aus verschiedenen Schema-Typen zu extrahieren

        // Für ZodEffects (wie bei .refine(), .transform(), etc.)
        if (schema instanceof z.ZodEffects && schema._def) {
            return extractMetadata(schema._def.schema);
        }

        // Für optionale Schemas (ZodOptional)
        if (schema instanceof z.ZodOptional && schema._def) {
            return extractMetadata(schema._def.innerType);
        }

        // Für ZodDefault (bei .default())
        if ('defaultValue' in schema._def && schema._def.innerType) {
            return extractMetadata(schema._def.innerType);
        }

        // Für verschachtelte Schemas mit innerType (z.B. nach min(), max())
        if ('innerType' in schema._def && schema._def.innerType) {
            return extractMetadata(schema._def.innerType);
        }

        // Für ZodEffects und ähnliche
        if ('schema' in schema._def && schema._def.schema) {
            return extractMetadata(schema._def.schema);
        }

        // Für Arrays und Listen
        if ('type' in schema._def && schema._def.type) {
            return extractMetadata(schema._def.type);
        }

        // Überprüfung aller möglichen inneren Schemas
        const innerSchemas = findAllPossibleInnerSchemas(schema);
        for (const innerSchema of innerSchemas) {
            const metadata = extractMetadata(innerSchema);
            if (Object.keys(metadata).length > 0) {
                return metadata;
            }
        }
    } catch (e) {
        console.warn('Fehler beim Extrahieren der Metadaten:', e);
    }

    return {};
}

/**
 * Findet alle möglichen inneren Schemas in einem komplexen Zod-Schema
 */
function findAllPossibleInnerSchemas(schema: z.ZodTypeAny): z.ZodTypeAny[] {
    if (!schema || typeof schema !== 'object' || !('_def' in schema)) return [];

    const result: z.ZodTypeAny[] = [];

    try {
        // Rekursive Suche durch alle properties des _def-Objekts
        const searchInObject = (obj: any): void => {
            if (!obj || typeof obj !== 'object') return;

            // Wenn es ein Zod-Schema ist, hinzufügen
            if ('_def' in obj) {
                result.push(obj as z.ZodTypeAny);
            }

            // Rekursiv durch alle Eigenschaften gehen
            for (const key in obj) {
                const value = obj[key];

                // Arrays durchsuchen
                if (Array.isArray(value)) {
                    value.forEach(item => searchInObject(item));
                }
                // Objekte durchsuchen
                else if (value && typeof value === 'object') {
                    searchInObject(value);
                }
            }
        };

        searchInObject(schema._def);
    } catch (e) {
        console.warn('Fehler beim Suchen innerer Schemas:', e);
    }

    return result;
}

/**
 * Verbesserte optional-Funktion, die immer die Metadaten erhält
 */
export function optional<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
    const metadata = extractMetadata(schema);
    const optionalSchema = schema.optional();
    return withMetadata(optionalSchema, metadata);
}

/**
 * Erstellt ein Schema mit einer eigenen Fehlermeldung für fehlende Werte
 * @param schema - Das ursprüngliche Schema
 * @param message - Die Fehlermeldung für leere Werte
 */
function withRequiredError<T extends z.ZodTypeAny>(schema: T, message: string = REQUIRED_ERROR_MESSAGE): T {
    if (schema instanceof z.ZodString) {
        return schema.min(1, message) as unknown as T;
    } else if (schema instanceof z.ZodNumber) {
        return schema as T;
    } else if (schema instanceof z.ZodArray) {
        return schema as T;
    } else if (schema instanceof z.ZodBoolean) {
        return schema as T;
    } else if (schema instanceof z.ZodDate) {
        return schema as T;
    }
    // Für andere Schema-Typen
    return schema;
}

// Die folgenden Funktionen erstellen Basis-Schemas mit Metadaten und der Standardfehlermeldung für Pflichtfelder

export function string(metadata: FieldMetadata = {}): z.ZodString {
    // Diese Funktion arbeitet bereits korrekt
    return withMetadata(
        withRequiredError(z.string()),
        { type: "string", ...metadata }
    ) as z.ZodString;
}

export function email(metadata: FieldMetadata = {}): z.ZodString {
    // Korrigiert: Zuerst min(1) für Pflichtfeldprüfung, dann erst email()-Validierung
    const schema = z.string()
        .min(1, REQUIRED_ERROR_MESSAGE)
        .email("Bitte geben Sie eine gültige E-Mail-Adresse ein");

    // Explizites Casting statt im Return-Statement
    return withMetadata(schema, { type: "email", ...metadata }) as unknown as z.ZodString;
}

export function password(metadata: FieldMetadata = {}): z.ZodString {
    // Diese Funktion arbeitet bereits korrekt
    return withMetadata(
        withRequiredError(z.string()),
        { type: "password", ...metadata }
    ) as z.ZodString;
}

// Verbesserte number-Funktion mit korrekten Typen
export function number(metadata: FieldMetadata = {}): z.ZodNumber {
    // Erstellen des Basis-Schemas
    const schema = z.number({
        required_error: REQUIRED_ERROR_MESSAGE,
        invalid_type_error: "Bitte geben Sie eine gültige Zahl ein"
    });

    // Metadaten hinzufügen
    const schemaWithMetadata = withMetadata(schema, { type: "number", ...metadata });

    // Schema als originales ZodNumber zurückgeben, damit TypeScript die Methoden kennt
    return schemaWithMetadata as z.ZodNumber;
}

// Verbesserte Funktion für boolean-Schema mit korrekten Typen
export function boolean(metadata: FieldMetadata = {}): z.ZodBoolean {
    // Zuerst die Metadaten mit dem Typ verarbeiten
    const finalMetadata: FieldMetadata = {
        type: metadata.type || "checkbox",
        ...metadata
    };

    // Dann das Schema mit den deutschen Fehlermeldungen erstellen
    const schema = z.boolean({
        required_error: REQUIRED_ERROR_MESSAGE,
        invalid_type_error: "Bitte aktivieren oder deaktivieren Sie diese Option"
    });

    // Metadaten hinzufügen und sicherstellen, dass wir einen ZodBoolean zurückgeben
    return withMetadata(schema, finalMetadata) as z.ZodBoolean;
}

export function select(options: Option[], metadata: FieldMetadata = {}): z.ZodString {
    // Korrigiert: Sicherstellen, dass leere Werte abgefangen werden
    const schema = z.string()
        .min(1, REQUIRED_ERROR_MESSAGE)
        .refine((val) => !options.length || options.some(opt => opt.value === val), {
            message: "Bitte wählen Sie eine Option aus"
        });

    return withMetadata(schema, { type: "select", options, ...metadata }) as unknown as z.ZodString;
}

export function multiSelect(options: Option[], metadata: FieldMetadata = {}) {
    // Korrigiert: Array muss mindestens ein Element enthalten
    const schema = z.array(
        z.object({
            label: z.string(),
            value: z.any()
        })
    ).min(1, REQUIRED_ERROR_MESSAGE);

    return withMetadata(schema, { type: "multi-select", options, ...metadata });
}

export function textarea(metadata: FieldMetadata = {}): z.ZodString {
    // Diese Funktion arbeitet bereits korrekt
    return withMetadata(
        withRequiredError(z.string()),
        { type: "textarea", ...metadata }
    ) as z.ZodString;
}

export function date(metadata: FieldMetadata = {}): z.ZodDate {
    // Verbesserte deutsche Fehlermeldungen für Datumsfelder
    return withMetadata(
        z.date({
            required_error: REQUIRED_ERROR_MESSAGE,
            invalid_type_error: "Bitte wählen Sie ein gültiges Datum aus"
        }),
        { type: "date", ...metadata }
    ) as z.ZodDate;
}

export function tel(metadata: FieldMetadata = {}): z.ZodString {
    // Diese Funktion arbeitet bereits korrekt
    return withMetadata(
        withRequiredError(z.string()),
        { type: "tel", ...metadata }
    ) as z.ZodString;
}

export function url(metadata: FieldMetadata = {}): z.ZodString {
    // Korrigiert: Ähnlich wie email, zuerst min(1) dann url-Validierung
    const schema = z.string()
        .min(1, REQUIRED_ERROR_MESSAGE)
        .url("Bitte geben Sie eine gültige URL ein");

    // Explizites Casting statt im Return-Statement
    return withMetadata(schema, { type: "url", ...metadata }) as unknown as z.ZodString;
}

/**
 * Hilfsfunktion, um bestehende Schemas mit einer Standardfehlermeldung für Pflichtfelder zu erweitern
 * Praktisch für Übergangszeitraum und Kompatibilität mit bestehenden Schemas
 */
export function required<T extends z.ZodTypeAny>(schema: T, message: string = REQUIRED_ERROR_MESSAGE): T {
    const metadata = extractMetadata(schema);

    // String-spezifischer Fall, um leere Strings zu verhindern
    if (schema instanceof z.ZodString) {
        return withMetadata(schema.min(1, message), metadata) as unknown as T;
    }

    // Für andere Schema-Typen Standardprüfung mit Fehlermeldung hinzufügen
    return withMetadata(schema, metadata);
}
