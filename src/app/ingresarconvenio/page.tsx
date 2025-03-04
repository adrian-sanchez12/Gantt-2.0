import IngresarConvenioForm from "../components/IngresarConvenioForm";

export default function IngresarConvenioPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Ingresar Nuevo Convenio</h1>
        <IngresarConvenioForm />
      </div>
    </div>
  );
}
