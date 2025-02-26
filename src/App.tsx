import AutoForm from './components/AutoForm';

function App() {
  return (
    <AutoForm
      props={[
        {
          type: 'multi-select',
          name: 'Test',
          options: [
            { label: 'OP1', value: 'OP1' },
            { label: 'OP2', value: 'OP2' },
          ],
          defaultValue: 'test',
          description: 'Test',
        },
        { type: 'email', name: 'Test-2' },
      ]}
    />
  );
}

export default App;
