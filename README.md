# FormGenerator

Ein typsicheres, schema-basiertes Formular-Generator-System für React-Anwendungen. Mit diesem Tool können Formulare dynamisch generiert, validiert und verarbeitet werden - alles mit vollständiger TypeScript-Unterstützung.

## Features

- **Typsicherheit**: Vollständige TypeScript-Integration für Formulardefinitionen und Werte
- **Schema-basiert**: Generierung von Formularen aus Zod-Schemas
- **Erweiterbar**: Einfache Anpassung und Erweiterung von Formularfeldern
- **Responsive Design**: Moderne UI mit Tailwind CSS
- **Validierung**: Integrierte Formularvalidierung mit Zod
- **Barrierefreiheit**: Zugängliche UI-Komponenten mit aria-Attributen

## Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/FormGenerator.git
cd FormGenerator

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Schnellstart

1. Definiere ein Schema in `src/schemas/formSchemas.ts`:

```typescript
// Beispiel für ein neues Schema
export const contactFormSchema = z.object({
    name: zod.string({
        label: "Name",
        placeholder: "Max Mustermann"
    }).min(2, "Name muss mindestens 2 Zeichen lang sein"),
    email: zod.email({
        label: "E-Mail",
        placeholder: "max@beispiel.de"
    }),
    message: zod.textarea({
        label: "Nachricht",
        placeholder: "Ihre Nachricht hier..."
    }).min(10, "Die Nachricht sollte mindestens 10 Zeichen enthalten")
});

// Schema zur Sammlung hinzufügen
export const schemas: Record<SchemaTypes, z.ZodObject<any>> = {
    // ...bestehende Schemas
    "contact": contactFormSchema,
};
```

2. Füge den neuen Schema-Typ zur `SchemaTypes` in `src/types/schemaTypes.ts` hinzu:

```typescript
export type SchemaTypes = "group" | "user" | /* bestehende Typen */ | "contact";
```

3. Verwende das Formular in deiner Komponente:

```tsx
import AutoForm from './components/autoform/AutoForm';

function ContactPage() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Kontaktformular</h2>
      
      <AutoForm
        schema="contact"
        btnName="Nachricht senden"
        onSubmit={async (data) => {
          console.log("Formular gesendet:", data);
          // Hier API-Call oder andere Verarbeitung
        }}
      />
    </div>
  );
}
```

## Verfügbare Feldtypen

- `string`: Texteingabe
- `email`: E-Mail-Eingabe mit Validierung
- `password`: Passwort-Eingabe
- `number`: Numerische Eingabe
- `textarea`: Mehrzeiliges Textfeld
- `checkbox`: Checkbox
- `switch`: Toggle-Schalter
- `select`: Dropdown-Auswahl
- `multi-select`: Mehrfachauswahl
- `date`: Datumswähler
- `tel`: Telefonnummer
- `url`: URL-Eingabe

## API-Referenz

### AutoForm Komponente

```tsx
<AutoForm
  schema="user"                  // Der Schema-Typ aus SchemaTypes
  btnName="Speichern"            // Name des Submit-Buttons
  defaultValues={[{ id: "123" }]} // Standardwerte für Felder
  options={{ 
    field: [{ label: "Option", value: "option" }] 
  }}                             // Dynamische Optionen für Select-Felder
  fieldOverrides={{
    name: {
      label: "Benutzername",     // Überschreibt Label
      description: "Min. 3 Zeichen" // Überschreibt Beschreibung
    }
  }}                             // Überschreibungen für einzelne Felder
  onSubmit={handleSubmit}        // Submit-Handler-Funktion
/>
```

## Erweiterung des Formular-Generators

### Neues Feld hinzufügen

1. Definiere den Feldtyp in `src/types/schemaTypes.ts`:

```typescript
export type InputTypes = 
  // ...bestehende Typen
  | "color";  // Neuer Typ
```

2. Füge die Implementierung in `src/components/autoform/FormInputs.tsx` hinzu:

```tsx
// Im switch-Statement:
case 'color':
  return (
    <FormControl>
      <Input
        {...field}
        type="color"
        disabled={disabled}
        className={cn(hasError && 'border-destructive')}
      />
    </FormControl>
  );
```

3. Erstelle eine neue Helper-Funktion in `src/lib/zodExtensions.ts`:

```typescript
export function color(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "color", ...metadata });
}
```

## Projektstruktur

```
src/
├── actions/           # Server-Actions
├── components/        
│   ├── autoform/      # Formular-Generator-Komponenten
│   │   ├── AutoForm.tsx     # Hauptkomponente
│   │   └── FormInputs.tsx   # Eingabefeld-Komponenten
│   └── ui/            # UI-Grundkomponenten
├── lib/               # Hilfsmodule
│   ├── autoformSchema.ts     # Schema-Verarbeitung
│   ├── utils.ts              # Allgemeine Hilfsfunktionen
│   └── zodExtensions.ts      # Zod-Erweiterungen für Metadaten
├── schemas/           # Formularschemas
│   └── formSchemas.ts        # Schema-Definitionen
└── types/             # TypeScript-Typdefinitionen
    ├── formTypes.ts          # Formular-bezogene Typen
    └── schemaTypes.ts        # Schema-bezogene Typen
```

## Beispiele

Weitere Beispiele findest du in der Datei `src/App.tsx`, die verschiedene Anwendungsfälle des FormGenerators demonstriert.

## Lizenz

MIT
