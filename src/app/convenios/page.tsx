import ConveniosTable from "../components/ConveniosTable";
import { TabView, TabPanel } from 'primereact/tabview';
        

export default function ConveniosPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
    <TabView>
    <TabPanel header="Lista de Convenios">
    <ConveniosTable />
    </TabPanel>
</TabView>
      </div>
    </div>
  );
}

