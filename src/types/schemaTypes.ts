/**
 * Diese Datei definiert grundlegende Typen und Schnittstellen für das Schema-basierte Formular-System.
 * Sie dient als zentrale Referenz für gemeinsam genutzte Typen zwischen Schemas und Formularkomponenten.
 */

/**
 * Alle unterstützten Schematypen im System.
 * Jeder Typ entspricht einem vollständigen Formularschema für einen bestimmten Anwendungsfall.
 */
export type SchemaTypes = "group" | "user" | "user-admin" | "company" | "bankDetails" | "product" | "note" | "stampCard" | "stamp" | "plan";

/**
 * Standardisierte Optionsobjekt-Schnittstelle für Select- und MultiSelect-Felder.
 * Wird sowohl in Schemas als auch in der Formular-Darstellung verwendet.
 */
export interface Option {
    value: string;              // Der tatsächliche Wert, der beim Submit übermittelt wird
    label: string;              // Die für den Benutzer sichtbare Bezeichnung
    disable?: boolean;          // Optional: Option deaktivieren
    fixed?: boolean;            // Optional: Option kann nicht entfernt werden (für MultiSelect)
    [key: string]: string | boolean | undefined;  // Zusätzliche benutzerdefinierte Eigenschaften
}

/**
 * Alle unterstützten Eingabetypen für Formularfelder.
 * Diese werden verwendet, um die richtigen UI-Komponenten für jedes Feld zu rendern.
 */
export type InputTypes =
    | "string"
    | "checkbox"
    | "switch"
    | "password"
    | "select"
    | "textarea"
    | "number"
    | "email"
    | "multi-select"
    | "tel"
    | "url"
    | "date";

/**
 * Metadaten für Formularfelder, die in Zod-Schemas gespeichert werden.
 * Diese Informationen werden verwendet, um sowohl die Validierung als auch die UI-Darstellung zu steuern.
 */
export interface FieldMetadata {
    type?: InputTypes;          // Art des Eingabefelds
    label?: string;             // Bezeichnung des Felds
    placeholder?: string;       // Platzhaltertext für leere Felder
    description?: string;       // Hilfetext oder Beschreibung für das Feld
    hidden?: boolean;           // Feld verstecken
    disabled?: boolean;         // Feld deaktivieren
    options?: Option[];         // Optionen für Select/MultiSelect-Felder
}