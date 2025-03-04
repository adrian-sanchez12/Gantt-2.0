import ConveniosTable from "../components/ConveniosTable";
import ProtectedRoute from "@/utils/protectedRoute";

export default function ConveniosPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Lista de Convenios</h1>
        <ConveniosTable />
      </div>
    </div>
  );
}

