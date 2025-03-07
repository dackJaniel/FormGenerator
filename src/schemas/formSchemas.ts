import { z } from 'zod';
import * as zod from '@/lib/zodExtensions';

// User Schema mit allen verfügbaren Datentypen und Funktionen
export const userSchema = z.object({
    // Basis-Felder mit verschiedenen Eigenschaften
    id: zod.string({
        label: "ID",
        description: "Automatisch generierte ID",
        disabled: true,
        hidden: true
    }).optional(),

    // String-Feld mit min-Validierung
    username: zod.string({
        label: "Benutzername",
        placeholder: "Geben Sie Ihren Benutzernamen ein",
        description: "Ein eindeutiger Benutzername für Ihr Konto"
    }).min(3, "Der Benutzername muss mindestens 3 Zeichen lang sein"),

    // Email mit Validierung
    email: zod.email({
        label: "E-Mail Adresse",
        placeholder: "beispiel@domain.de",
        description: "Ihre E-Mail-Adresse für Kontakt und Anmeldung"
    }),

    // Passwort mit mehreren Validierungen
    password: zod.password({
        label: "Passwort",
        placeholder: "Passwort eingeben",
        description: "Sicheres Passwort mit min. 8 Zeichen"
    }).min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),

    // Number-Feld mit min/max-Validierung - Jetzt aktiviert
    age: zod.number({
        label: "Alter",
        description: "Ihr aktuelles Alter"
    }).min(18, "Sie müssen mindestens 18 Jahre alt sein").max(120, "Bitte geben Sie ein realistisches Alter ein"),

    // Telefonnummer
    phone: zod.tel({
        label: "Telefonnummer",
        placeholder: "+49 123 456789",
        description: "Ihre Telefonnummer für dringende Kontaktaufnahme"
    }).optional(),

    // URL-Feld
    website: zod.url({
        label: "Webseite",
        placeholder: "https://example.com",
        description: "Ihre persönliche oder Unternehmenswebseite"
    }).optional(),

    // Textarea für mehrzeiligen Text
    bio: zod.textarea({
        label: "Biografie",
        placeholder: "Erzählen Sie etwas über sich...",
        description: "Eine kurze Beschreibung über Sie"
    }).min(10, "Die Biografie muss mindestens 10 Zeichen lang sein").optional(),

    // Select-Feld (Dropdown) mit vordefinierten Optionen
    status: zod.select(
        [
            { label: "Aktiv", value: "ACTIVE" },
            { label: "Inaktiv", value: "INACTIVE" },
            { label: "Gesperrt", value: "LOCKED" }
        ],
        {
            label: "Status",
            description: "Aktueller Status Ihres Kontos"
        }
    ),

    // Mehrfachauswahl (Multi-Select)
    roles: zod.multiSelect(
        [
            { label: "Administrator", value: "admin" },
            { label: "Moderator", value: "moderator" },
            { label: "Benutzer", value: "user" },
            { label: "Gast", value: "guest" }
        ],
        {
            label: "Rollen",
            description: "Benutzerrollen und Berechtigungen"
        }
    ).optional(),

    // Datum-Feld mit benutzerfreundlicherer Konfiguration
    birthday: zod.date({
        label: "Geburtsdatum",
        description: "Bitte wählen Sie Ihr Geburtsdatum aus",
        placeholder: "TT.MM.JJJJ"
    }).optional(),

    // Boolean-Feld (Checkbox)
    newsletter: zod.boolean({
        label: "Newsletter abonnieren",
        description: "Möchten Sie unseren Newsletter erhalten?"
    }),

    // Boolean-Feld als Switch
    termsAccepted: zod.boolean({
        label: "AGB akzeptieren",
        description: "Ich akzeptiere die Allgemeinen Geschäftsbedingungen",
        type: "switch"  // Als Switch-Element anzeigen
    }),

    // Demonstriert das Hinzufügen von zusätzlichen Validierungen mit .refine
    confirmPassword: zod.password({
        label: "Passwort bestätigen",
        placeholder: "Passwort wiederholen"
    }).min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
});

// Sammlung aller Schemas
export const schemas = {
    "user": userSchema,
    // Hier können weitere Schemas hinzugefügt werden
} as const;

// SchemaTypes automatisch aus den Schlüsseln von schemas ableiten
export type SchemaTypes = keyof typeof schemas;

// Export der Schemas-Typen für die Typisierung
export type ZodSchemas = typeof schemas;