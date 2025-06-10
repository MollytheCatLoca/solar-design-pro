// src/app/(dashboard)/projects/[id]/designs/[designId]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import DesignMap from '@/components/design/DesignMap';
import ModuleConfigurator from '@/components/design/ModuleConfigurator';
import DesignMetrics from '@/components/design/DesignMetrics';
import { useDesign, useDesigns } from '@/lib/hooks/useDesigns';
import { useProject } from '@/lib/hooks/useProjects';

export default function EditDesignPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);
    const designId = Number(params.designId);

    // Hooks para datos
    const { design, isLoading: isLoadingDesign } = useDesign(designId);
    const { project, isLoading: isLoadingProject } = useProject(projectId);
    const { updateDesign, isUpdating } = useDesigns();

    // Estados principales
    const [designName, setDesignName] = useState('');
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

    // Cargar datos del diseño existente cuando esté disponible
    useEffect(() => {
        if (design && design.installation_area) {
            const installationArea = design.installation_area as any;

            // Cargar nombre
            setDesignName(design.name);

            // Cargar polígonos
            if (installationArea.polygons) {
                // Necesitamos reconstruir los polígonos para el mapa
                const loadedPolygons = installationArea.polygons.map((poly: any) => ({
                    ...poly,
                    polygon: null, // El componente DesignMap lo recreará
                    originalData: poly // Guardamos los datos originales
                }));
                setPolygons(loadedPolygons);
            }

            // Cargar módulo seleccionado
            if (installationArea.selectedModule) {
                setSelectedModule(installationArea.selectedModule);
            }

            // Cargar configuración
            if (installationArea.config) {
                setDesignConfig({
                    ...designConfig,
                    ...installationArea.config
                });
            }

            // Cargar layouts de paneles
            if (installationArea.panelLayouts) {
                const layoutsMap = new Map();
                Object.entries(installationArea.panelLayouts).forEach(([key, value]) => {
                    layoutsMap.set(parseInt(key), value);
                });
                setPanelLayouts(layoutsMap);
            }
        }
    }, [design]);

    const handleSaveDesign = async () => {
        if (!designName.trim()) {
            toast.error('El nombre del diseño es requerido');
            return;
        }

        if (polygons.length === 0) {
            toast.error('Debes dibujar al menos un área');
            return;
        }

        if (!selectedModule) {
            toast.error('Debes seleccionar un módulo solar');
            return;
        }

        // Preparar datos para guardar
        const panelLayoutsObj: any = {};
        panelLayouts.forEach((value, key) => {
            panelLayoutsObj[key] = value;
        });

        // Calcular totales
        let totalPanels = 0;
        let totalCapacityKW = 0;
        panelLayouts.forEach(layout => {
            totalPanels += layout.totalPanels || 0;
            totalCapacityKW += layout.actualCapacityKW || 0;
        });

        const updatedDesignData = {
            name: designName,
            status: 'draft',
            panel_count: totalPanels,
            inverter_count: 0, // TODO: Agregar configuración de inversores
            capacity_kwp: totalCapacityKW,
            ground_coverage_ratio: parseFloat(calculateGCR(selectedModule, designConfig)) || 0.4,
            installation_area: {
                polygons: polygons.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    area: p.area,
                    path: p.path || [],
                })),
                panelLayouts: panelLayoutsObj,
                config: designConfig,
                selectedModule: selectedModule,
            },
            notes: `Diseño actualizado con ${totalPanels} paneles y ${totalCapacityKW.toFixed(1)} kWp`,
        };

        updateDesign(
            { id: designId, data: updatedDesignData },
            {
                onSuccess: () => {
                    toast.success('Diseño actualizado exitosamente');
                    router.push(`/projects/${projectId}/designs/${designId}`);
                },
                onError: (error) => {
                    console.error('Error updating design:', error);
                    toast.error('Error al actualizar el diseño');
                }
            }
        );
    };

    const handleSegmentSelect = (segment: any) => {
        setSelectedSegment(segment);
    };

    const handleCancel = () => {
        router.push(`/projects/${projectId}/designs/${designId}`);
    };

    // Función auxiliar para calcular GCR
    const calculateGCR = (module: any, config: any): string => {
        if (!module || !config.rowSpacing) return '0.40';
        const panelLength = config.orientation === 'Landscape'
            ? module.width
            : module.height;
        const tiltRad = ((config.tilt || 25) * Math.PI) / 180;
        const rowPitch = panelLength * Math.cos(tiltRad) + (parseFloat(config.rowSpacing) || 2);
        return (panelLength * Math.cos(tiltRad) / rowPitch).toFixed(2);
    };

    if (isLoadingDesign || isLoadingProject) {
        return (
            <div className= "h-screen flex flex-col" >
            <div className="border-b bg-white p-4" >
                <Skeleton className="h-10 w-64" />
                    </div>
                    < div className = "flex-1 grid grid-cols-12 gap-4 p-4 bg-gray-50" >
                        <div className="col-span-8" >
                            <Skeleton className="h-full" />
                                </div>
                                < div className = "col-span-4 space-y-4" >
                                    <Skeleton className="h-[400px]" />
                                        <Skeleton className="h-[300px]" />
                                            </div>
                                            </div>
                                            </div>
        );
    }

    if (!design) {
        return (
            <div className= "flex items-center justify-center h-screen" >
            <div className="text-center" >
                <h2 className="text-2xl font-semibold mb-2" > Diseño no encontrado </h2>
                    < Button onClick = {() => router.push(`/projects/${projectId}`)
    }>
        Volver al proyecto
            </Button>
            </div>
            </div>
        );
}

return (
    <div className= "h-screen flex flex-col" >
    {/* Header */ }
    < div className = "border-b bg-white" >
        <div className="flex items-center justify-between p-4" >
            <div className="flex items-center gap-4" >
                <Button
                            variant="ghost"
size = "sm"
onClick = {() => router.push(`/projects/${projectId}/designs/${designId}`)}
                        >
    <ChevronLeft className="h-4 w-4 mr-1" />
        Volver al diseño
            </Button>
            < Input
value = { designName }
onChange = {(e) => setDesignName(e.target.value)}
className = "w-64"
placeholder = "Nombre del diseño"
    />
    <span className="text-sm text-muted-foreground" >
        Editando v{ design.version }
</span>
    </div>
    < div className = "flex items-center gap-2" >
        <Button 
                            variant="outline"
size = "sm"
onClick = { handleCancel }
disabled = { isUpdating }
    >
    Cancelar
    </Button>
    < Button
onClick = { handleSaveDesign }
size = "sm"
disabled = { isUpdating }
    >
{
    isUpdating?(
                                <>
    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Guardando...
</>
                            ) : (
    <>
    <Save className= "h-4 w-4 mr-2" />
    Guardar cambios
        </>
                            )}
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
projectLat = { project?.latitude }
projectLng = { project?.longitude }
existingPolygons = { design.installation_area?.polygons }
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