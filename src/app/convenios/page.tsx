import ConveniosTable from "../components/ConveniosTable";
import { TabView, TabPanel } from 'primereact/tabview';
        

export default function ConveniosPage() {
  return (        
  <TabView>
  <TabPanel header="Convenios">
    <div>
      {/* Bloque de título */}
      <div className="mb-8 mt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[#172951] tracking-tight leading-tight">
            Lista de Convenios
          </h1>
        </div>
        <p className="text-gray-500 text-base mt-1">
          Gestión y seguimiento de convenios de cooperación institucional
        </p>
      </div>
      {/* Componente principal */}
      <ConveniosTable />
    </div>
  </TabPanel>
</TabView>
  );
}

