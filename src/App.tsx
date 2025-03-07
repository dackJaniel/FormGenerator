import { test } from './actions/test';
import AutoForm from './components/autoform/AutoForm';

function App() {
  // Typsichere DefaultValueItem Deklarationen
  // const userAdminDefaults: DefaultValueItem<"user">[] = [
  //   { status: "ACTIVE" }
  // ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Benutzerverwaltung</h1>

      <div className="max-w-md mx-auto">
        <AutoForm
          schema="user"
          btnName="Status bearbeiten"
          fieldOverrides={{
            status: {
              label: "Benutzerstatus",
              description: "Wählen Sie den aktuellen Status des Benutzerkontos",
              // Benutzerdefinierte Fehlermeldung über fieldOverrides
              errorMessage: "Bitte wählen Sie einen gültigen Status aus"
            },
            email: {
              errorMessage: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
            }
          }}
          onSubmit={async (data) => {
            console.log(data.status);
            return test();
          }}
        // defaultValues={userAdminDefaults}
        />
      </div>
    </>
  );
}

export default App;
