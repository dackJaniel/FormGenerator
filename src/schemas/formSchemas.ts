import { z } from 'zod';
import * as zod from '@/lib/zodExtensions';

// User Schema mit integrierten Metadaten und benutzerdefinierten Fehlermeldungen
export const userSchema = z.object({
    id: zod.string({
        label: "ID",
        disabled: true,
        hidden: true
    }).optional(),

    status: zod.select(
        [
            { label: "Aktiv", value: "ACTIVE" },
            { label: "Inaktiv", value: "INACTIVE" },
            { label: "Gesperrt", value: "LOCKED" }
        ],
        { label: "Status" }
    ).optional(),

    days: zod.multiSelect(
        [
            { label: "Montag", value: "monday" },
            { label: "Dienstag", value: "tuesday" },
            { label: "Mittwoch", value: "wednesday" },
            { label: "Donnerstag", value: "thursday" },
            { label: "Freitag", value: "friday" },
            { label: "Samstag", value: "saturday" },
            { label: "Sonntag", value: "sunday" }
        ],
        { label: "Tage" }
    ),

    email: zod.email({
        label: "E-Mail",
        placeholder: "E-Mail eingeben",
    }),

    firstname: zod.string({
        label: "Vorname"
    }).min(2, "Der Vorname muss mindestens 2 Zeichen lang sein").optional(),

    lastname: zod.string({
        label: "Nachname"
    }).min(2, "Der Nachname muss mindestens 2 Zeichen lang sein").optional(),

    age: zod.number({
        label: "Alter"
    }).min(18, "Sie müssen mindestens 18 Jahre alt sein"),

    password: zod.password({
        label: "Passwort",
        placeholder: "Passwort eingeben",
    }),
});

// Sammlung aller Schemas
export const schemas = {
    "user": userSchema
} as const;

// SchemaTypes automatisch aus den Schlüsseln von schemas ableiten
export type SchemaTypes = keyof typeof schemas;

// Export der Schemas-Typen für die Typisierung
export type ZodSchemas = typeof schemas;