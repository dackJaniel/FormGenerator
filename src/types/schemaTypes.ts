/**
 * Diese Datei definiert grundlegende Typen und Schnittstellen für das Schema-basierte Formular-System.
 * Sie dient als zentrale Referenz für gemeinsam genutzte Typen zwischen Schemas und Formularkomponenten.
 */

import { InputTypes } from "./formTypes";

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