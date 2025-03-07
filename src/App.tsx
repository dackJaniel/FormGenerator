import AutoForm from './components/autoform/AutoForm';
import { DefaultValueItem } from './types/formTypes';

function App() {
  const defaultValues: DefaultValueItem<"user">[] = [{
    username: "daniel.hilmer",
    email: "daniel.hilmer@outlook.de",
    age: 25,
    status: "ACTIVE",
    roles: [{ label: "Administrator", value: "admin" }, { label: "Benutzer", value: "user" }],
    bio: "Hallo, ich bin Daniel und arbeite als Webentwickler.",
    phone: "+49 123 456789",
    website: "https://danielhilmer.de",
    appointmentTime: new Date("2025-12-31T23:59:59.000Z"),
    birthday: new Date("2025-12-31"),
    password: "password123",
    confirmPassword: "password123",
    id: "1",
    newsletter: true,
    termsAccepted: true
  }];

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
              errorMessage: "Bitte wählen Sie einen gültigen Status aus"
            },
            email: {
              errorMessage: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
            }
          }}
          // onSubmit={async (data) => {
          //   console.log(data.status);
          //   return test();
          // }}
          defaultValues={defaultValues}
        />
      </div>
    </>
  );
}

export default App;
