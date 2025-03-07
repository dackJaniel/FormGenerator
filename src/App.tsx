import { test } from './actions/test';
import AutoForm from './components/autoform/AutoForm';
import { useState } from 'react';
import { DefaultValueItem } from './types/formTypes';

function App() {
  const [hideEmail, setHideEmail] = useState(false);

  // Typsichere DefaultValueItem Deklarationen
  const userAdminDefaults: DefaultValueItem<"user-admin">[] = [
    { status: "ACTIVE" }
  ];

  const userDefaults: DefaultValueItem<"user">[] = [
    {
      generatedId: "USR-" + Math.random().toString(36).substring(2, 10).toUpperCase()
    }
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Benutzerverwaltung</h1>

      <div className="max-w-md mx-auto">
        <AutoForm
          schema="user-admin"
          btnName="Status bearbeiten"
          fieldOverrides={{
            status: {
              label: "Benutzerstatus",
              description: "Wählen Sie den aktuellen Status des Benutzerkontos"
            }
          }}
          onSubmit={async (data) => {
            console.log(data.status);
            return test();
          }}
          defaultValues={userAdminDefaults} // Typsichere Verwendung
        />
      </div>

      <div className="max-w-md mx-auto mt-8">
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-bold mr-4">Benutzer erstellen</h2>
          <button
            onClick={() => setHideEmail(!hideEmail)}
            className="px-3 py-1 bg-slate-200 rounded text-sm"
          >
            {hideEmail ? 'E-Mail anzeigen' : 'E-Mail verstecken'}
          </button>
        </div>

        <AutoForm
          schema="user"
          btnName="Benutzer erstellen"
          fieldOverrides={{
            firstname: {
              label: "Dein Vorname",
              placeholder: "Max"
            },
            lastname: {
              label: "Dein Nachname",
              placeholder: "Mustermann"
            },
            email: {
              placeholder: "deine.email@beispiel.de",
              hidden: hideEmail, // Dynamisch basierend auf State
              disabled: hideEmail // Auch deaktivieren, wenn versteckt
            }
          }}
          defaultValues={userDefaults} // Typsichere Verwendung
          onSubmit={test}
        />
      </div>

      {/* Beispiel für ein Formular mit schemadefinierten deaktivierten Feldern */}
      <div className="max-w-md mx-auto mt-8">
        <h2 className="text-xl font-bold mb-2">Unternehmen hinzufügen</h2>
        <p className="text-sm text-gray-500 mb-4">
          Das Feld "Land" ist im Schema als deaktiviert definiert und kann nicht geändert werden.
        </p>
        <AutoForm
          schema="company"
          btnName="Unternehmen speichern"
          onSubmit={test}
        />
      </div>
    </>
  );
}

export default App;
