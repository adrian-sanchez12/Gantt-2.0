import { TabView, TabPanel } from 'primereact/tabview';
import Inventario from "../components/Inventario";
import EstadisticasInventario from "../components/EstadisticasInventario";

export default function InventarioPage() {
  return (
    <TabView>
      {/* Pestaña de Inventario */}
      <TabPanel header="Inventario">
        <div>
          {/* Bloque de título, idéntico a Lista de Convenios */}
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-[#172951] tracking-tight leading-tight">
                Inventario
              </h1>
            </div>
            <p className="text-gray-500 text-base mt-1">
              Consulta y administra el inventario de convenios institucionales
            </p>
          </div>
          {/* Componente principal */}
          <Inventario />
        </div>
      </TabPanel>

      {/* Pestaña de Estadísticas */}
      <TabPanel header="Estadísticas">
        <div>
          {/* Bloque de título, idéntico pero con texto de estadísticas */}
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-[#172951] tracking-tight leading-tight">
                Estadísticas del Inventario
              </h1>
            </div>
            <p className="text-gray-500 text-base mt-1">
              Resumen visual de convenios vigentes, próximos a vencer y vencidos.
            </p>
          </div>
          <EstadisticasInventario />
        </div>
      </TabPanel>
    </TabView>
  );
}

