// src/app/(dashboard)/projects/[id]/designs/new/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';
import DesignMap from '@/components/design/DesignMap';
import ModuleConfigurator from '@/components/design/ModuleConfigurator';
import DesignMetrics from '@/components/design/DesignMetrics';
import { useProject } from '../../../../../../lib/hooks/useProjects';
import { designsApi } from '../../../../../../lib/api/designs';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';


export default function NewDesignPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);
    const { project, isLoading: projectLoading } = useProject(projectId);

    // Estados principales
    const [designName, setDesignName] = useState('Design 1');
    const [polygons, setPolygons] = useState<any[]>([]);
    const [selectedModule, setSelectedModule] = useState<any>(null);
    const [selectedSegment, setSelectedSegment] = useState<any>(null);
    const [panelLayouts, setPanelLayouts] = useState<Map<number, any>>(new Map());
    const [designConfig, setDesignConfig] = useState({
        // Configuración del módulo
        maxSize: 1600, // kWp
        racking: 'Fixed Tilt Racking',
        surfaceHeight: 10,
        azimuth: 180,
        tilt: 25,

        // Configuración del layout
        frameSize: 2,
        frameWidth: 10,
        orientation: 'Landscape',
        rowSpacing: 2,
        moduleSpacing: 0.041,
        frameSpacing: 0,
        setback: 10,
        alignH: 'center',
        alignV: 'middle',
    });

    const handleSaveDesign = async () => {
        // Validaciones
        if (!selectedModule) {
            toast.error('Por favor selecciona un módulo solar');
            return;
        }

        if (polygons.length === 0) {
            toast.error('Por favor dibuja al menos un área de instalación');
            return;
        }

        if (!designName.trim()) {
            toast.error('Por favor ingresa un nombre para el diseño');
            return;
        }

        try {
            toast.loading('Guardando diseño...');

            // Calcular totales
            const totalPanels = Array.from(panelLayouts.values())
                .reduce((sum, layout) => sum + (layout.totalPanels || 0), 0);

            const totalCapacityMW = Array.from(panelLayouts.values())
                .reduce((sum, layout) => sum + (layout.actualCapacityKW || 0), 0) / 1000; // Convertir a MW

            // Preparar installation_area con los polígonos y layouts
            const installationArea = {
                polygons: polygons.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    area: p.area,
                    path: p.path || (p.type === 'polygon'
                        ? p.polygon.getPath().getArray().map((point: any) => ({
                            lat: point.lat(),
                            lng: point.lng()
                        }))
                        : null),
                    bounds: p.type === 'rectangle' && p.bounds ? {
                        north: p.bounds.getNorthEast().lat(),
                        east: p.bounds.getNorthEast().lng(),
                        south: p.bounds.getSouthWest().lat(),
                        west: p.bounds.getSouthWest().lng()
                    } : null
                })),
                panelLayouts: Object.fromEntries(panelLayouts),
                totalPanels: totalPanels,
                totalCapacityKW: totalCapacityMW * 1000,
                config: {
                    ...designConfig,
                    moduleInfo: {
                        id: selectedModule.id,
                        manufacturer: selectedModule.manufacturer,
                        model: selectedModule.model,
                        power: selectedModule.power,
                        width: selectedModule.width,
                        height: selectedModule.height
                    }
                }
            };

            const designData = {
                name: designName,
                project_id: projectId, // IMPORTANTE: Agregar project_id
                capacity_mw: totalCapacityMW || 1.0, // En MW
                panel_type_id: selectedModule.id,
                inverter_type_id: 1, // Por ahora hardcoded
                tilt_angle: parseFloat(designConfig.tilt) || 25,
                azimuth_angle: parseFloat(designConfig.azimuth) || 180,
                row_spacing: parseFloat(designConfig.rowSpacing) || 2,
                module_orientation: designConfig.orientation.toLowerCase(), // IMPORTANTE: en minúsculas
                modules_per_string: 20, // Valor por defecto
                strings_per_inverter: 10, // Valor por defecto
                total_inverters: Math.ceil(totalCapacityMW / 2.5) || 1, // Asumiendo inversores de 2.5MW
                installation_area: installationArea
            };

            console.log('Guardando diseño:', JSON.stringify(designData, null, 2));

            // Guardar en el backend
            const response = await apiClient.post(
                `/api/v1/solar/projects/${projectId}/designs`,
                designData
            );

            console.log('Diseño guardado:', response.data);

            toast.dismiss();
            toast.success('¡Diseño guardado exitosamente!');

            // Redirigir a la página del proyecto
            setTimeout(() => {
                router.push(`/projects/${projectId}`);
            }, 1000);

        } catch (error: any) {
            console.error('Error guardando diseño:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            toast.dismiss();

            // Mostrar error específico si existe
            const errorDetail = error.response?.data?.detail;
            if (typeof errorDetail === 'string') {
                toast.error(errorDetail);
            } else if (Array.isArray(errorDetail)) {
                // Si es un array de errores de validación
                const errorMsg = errorDetail.map(e => e.msg).join(', ');
                toast.error(errorMsg);
            } else {
                toast.error('Error al guardar el diseño');
            }
        }
    };


    const projectCoordinates = project?.latitude && project?.longitude
        ? { lat: project.latitude, lng: project.longitude }
        : null;

    if (projectLoading) {
        return (
            <div className= "h-screen flex items-center justify-center" >
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
    );
    }

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
panelLayouts = { panelLayouts }
setPanelLayouts = { setPanelLayouts }
projectCoordinates = { projectCoordinates }
projectName = { project?.name }
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
panelLayouts = { panelLayouts }
    />
    </div>
    </div>
    </div>
    </div>
  );
}