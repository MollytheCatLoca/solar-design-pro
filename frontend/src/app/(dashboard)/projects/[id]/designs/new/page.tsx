// src/app/(dashboard)/projects/[id]/designs/new/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft } from 'lucide-react';
import DesignMap from '@/components/design/DesignMap';
import ModuleConfigurator from '@/components/design/ModuleConfigurator';
import DesignMetrics from '@/components/design/DesignMetrics';

export default function NewDesignPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    // Estados principales
    const [designName, setDesignName] = useState('Design 1');
    const [polygons, setPolygons] = useState<any[]>([]);
    const [selectedModule, setSelectedModule] = useState<any>(null);
    const [selectedSegment, setSelectedSegment] = useState<any>(null);
    const [designConfig, setDesignConfig] = useState({
        // Configuración del módulo
        maxSize: 1600, // kWp
        racking: 'Fixed Tilt Racking',
        surfaceHeight: 10,
        azimuth: 180,
        tilt: 25,

        // Configuración del layout
        frameSize: 4,
        frameWidth: 1,
        orientation: 'Landscape',
        rowSpacing: 15,
        moduleSpacing: 0.041,
        frameSpacing: 0,
        setback: 40,
        alignH: 'center',
        alignV: 'middle',
    });

    const handleSaveDesign = async () => {
        // TODO: Implementar guardado
        console.log('Saving design:', {
            name: designName,
            projectId,
            polygons,
            module: selectedModule,
            config: designConfig,
        });
    };

    const handleSegmentSelect = (segment: any) => {
        setSelectedSegment(segment);
    };

    return (
        <div className= "h-screen flex flex-col" >
        {/* Header */ }
        < div className = "border-b bg-white" >
            <div className="flex items-center justify-between p-4" >
                <div className="flex items-center gap-4" >
                    <Button
              variant="ghost"
    size = "sm"
    onClick = {() => router.push(`/projects/${projectId}`)
}
            >
    <ChevronLeft className="h-4 w-4 mr-1" />
        Volver al proyecto
            </Button>
            < Input
value = { designName }
onChange = {(e) => setDesignName(e.target.value)}
className = "w-64"
placeholder = "Nombre del diseño"
    />
    </div>
    < div className = "flex items-center gap-2" >
        <Button variant="outline" size = "sm" >
            Cancelar
            </Button>
            < Button onClick = { handleSaveDesign } size = "sm" >
                <Save className="h-4 w-4 mr-2" />
                    Guardar
                    </Button>
                    </div>
                    </div>
                    </div>

{/* Main content */ }
<div className="flex-1 grid grid-cols-12 gap-4 p-4 bg-gray-50" >
    {/* Mapa - 8 columnas */ }
    < div className = "col-span-8" >
        <DesignMap
            polygons={ polygons }
setPolygons = { setPolygons }
selectedModule = { selectedModule }
config = { designConfig }
onSegmentSelect = { handleSegmentSelect }
    />
    </div>

{/* Panel derecho - 4 columnas */ }
<div className="col-span-4 space-y-4" >
    {/* Configurador de módulos */ }
    < div className = "h-[400px]" >
        <ModuleConfigurator
              selectedModule={ selectedModule }
setSelectedModule = { setSelectedModule }
config = { designConfig }
setConfig = { setDesignConfig }
selectedSegment = { selectedSegment }
    />
    </div>

{/* Métricas */ }
<div className="flex-1" >
    <DesignMetrics
              polygons={ polygons }
selectedModule = { selectedModule }
config = { designConfig }
    />
    </div>
    </div>
    </div>
    </div>
  );
}