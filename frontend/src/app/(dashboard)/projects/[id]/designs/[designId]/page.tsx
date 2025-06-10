// src/app/(dashboard)/projects/[id]/designs/[designId]/page.tsx

'use client';

const React = require('react');
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Copy, Trash2, Download, Share2, Zap, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDesign, useDesigns } from '@/lib/hooks/useDesigns';
import DesignMapViewer from '@/components/design/DesignMapViewer';
import { useState } from 'react';

export default function DesignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);
    const designId = Number(params.designId);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const { design, isLoading, error } = useDesign(designId);
    const { deleteDesign, cloneDesign, isDeleting, isCloning } = useDesigns();

    // Función auxiliar: Obtener dirección cardinal del azimut
    const getCardinalDirection = (azimuth: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        const index = Math.round(((azimuth % 360) / 45)) % 8;
        return directions[index];
    };

    // Función auxiliar: Calcular GCR
    const calculateGCR = (selectedModule: any, config: any): string => {
        if (!selectedModule || !config.rowSpacing) return '0.40';
        const panelLength = config.orientation === 'Landscape'
            ? selectedModule.width
            : selectedModule.height;
        const tiltRad = ((config.tilt || 25) * Math.PI) / 180;
        const rowPitch = panelLength * Math.cos(tiltRad) + (parseFloat(config.rowSpacing) || 2);
        return (panelLength * Math.cos(tiltRad) / rowPitch).toFixed(2);
    };



    if (error || !design) {
        return (
            <div className= "text-center py-12" >
            <h2 className="text-2xl font-semibold mb-2" > Diseño no encontrado </h2>
                < p className = "text-muted-foreground mb-4" >
                    El diseño que buscas no existe o ha sido eliminado.
                </p>
                        < Link href = {`/projects/${projectId}`
    }>
        <Button>
        <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al proyecto
                </Button>
                </Link>
                </div>
        );
}

const handleDelete = () => {
    deleteDesign(designId, {
        onSuccess: () => {
            toast.success('Diseño eliminado');
            router.push(`/projects/${projectId}`);
        },
    });
};

const handleClone = () => {
    cloneDesign(designId, {
        onSuccess: (newDesign) => {
            toast.success('Diseño clonado exitosamente');
            router.push(`/projects/${projectId}/designs/${newDesign.id}`);
        },
    });
};

// Extraer datos del installation_area
const installationArea = design.installation_area as any || {};
const polygons = installationArea.polygons || [];
const panelLayouts = installationArea.panelLayouts || {};
const config = installationArea.config || {};
const selectedModule = installationArea.selectedModule || null;

// Calcular métricas totales
const totalArea = polygons.reduce((sum: number, p: any) => sum + (p.area || 0), 0) / 10000; // hectáreas
const totalPanels = Object.values(panelLayouts).reduce((sum: number, layout: any) =>
    sum + (layout.totalPanels || 0), 0
);
const totalCapacity = Object.values(panelLayouts).reduce((sum: number, layout: any) =>
    sum + (layout.actualCapacityKW || 0), 0
);
const totalRows = Object.values(panelLayouts).reduce((sum: number, layout: any) =>
    sum + (layout.rows || 0), 0
);

// Estimaciones
const annualProduction = totalCapacity * 1600; // kWh/kWp típico
const co2Avoided = annualProduction * 0.0004; // toneladas CO2/kWh

const getStatusBadge = (status: string) => {
    const statusConfig = {
        draft: { label: 'Borrador', variant: 'secondary' as const },
        simulated: { label: 'Simulado', variant: 'default' as const },
        optimized: { label: 'Optimizado', variant: 'default' as const, className: 'bg-blue-600' },
        approved: { label: 'Aprobado', variant: 'default' as const, className: 'bg-green-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <Badge variant= { config.variant } className = { config.className } >
            { config.label }
            </Badge>
        );
    };

return (
    <div className= "space-y-6" >
    {/* Header */ }
    < div className = "flex items-center justify-between" >
        <div className="flex items-center gap-4" >
            <Link href={ `/projects/${projectId}` }>
                <Button variant="ghost" size = "icon" >
                    <ArrowLeft className="h-4 w-4" />
                        </Button>
                        </Link>
                        < div >
                        <div className="flex items-center gap-3" >
                            <h1 className="text-3xl font-bold tracking-tight" > { design.name } </h1>
{ getStatusBadge(design.status) }
<Badge variant="outline" > v{ design.version } </Badge>
    </div>
    < p className = "text-muted-foreground" >
        Creado { format(new Date(design.created_at), "d 'de' MMMM, yyyy", { locale: es }) }
</p>
    </div>
    </div>
    < div className = "flex items-center gap-2" >
        <Button variant="outline" size = "sm" >
            <Share2 className="mr-2 h-4 w-4" />
                Compartir
                </Button>
                < Button variant = "outline" size = "sm" >
                    <Download className="mr-2 h-4 w-4" />
                        Exportar
                        </Button>
                        < Link href = {`/projects/${projectId}/designs/${designId}/edit`}>
                            <Button variant="outline" size = "sm" >
                                <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                    </Button>
                                    </Link>
                                    < Button
variant = "outline"
size = "sm"
onClick = { handleClone }
disabled = { isCloning }
    >
    <Copy className="mr-2 h-4 w-4" />
        Clonar
        </Button>
        < Button
variant = "outline"
size = "sm"
onClick = {() => setShowDeleteDialog(true)}
className = "text-red-600 hover:text-red-700"
    >
    <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
        </Button>
        </div>
        </div>

{/* Métricas principales */ }
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5" >
    <Card>
    <CardHeader className="pb-2" >
        <CardTitle className="text-sm font-medium flex items-center gap-2" >
            <Zap className="h-4 w-4 text-yellow-600" />
                Capacidad DC
                    </CardTitle>
                    </CardHeader>
                    < CardContent >
                    <div className="text-2xl font-bold" > { totalCapacity.toFixed(1) } kWp </div>
                        < p className = "text-xs text-muted-foreground" >
                            { design.inverter_count > 0 && `${design.inverter_count} inversores` }
                            </p>
                            </CardContent>
                            </Card>

                            < Card >
                            <CardHeader className="pb-2" >
                                <CardTitle className="text-sm font-medium flex items-center gap-2" >
                                    <Sun className="h-4 w-4 text-blue-600" />
                                        Paneles
                                        </CardTitle>
                                        </CardHeader>
                                        < CardContent >
                                        <div className="text-2xl font-bold" > { totalPanels.toLocaleString() } </div>
                                            < p className = "text-xs text-muted-foreground" >
                                                { selectedModule? `${selectedModule.manufacturer} ${selectedModule.power}W` : 'N/A'}
</p>
    </CardContent>
    </Card>

    < Card >
    <CardHeader className="pb-2" >
        <CardTitle className="text-sm font-medium" > Área Total </CardTitle>
            </CardHeader>
            < CardContent >
            <div className="text-2xl font-bold" > { totalArea.toFixed(2) } ha </div>
                < p className = "text-xs text-muted-foreground" > { polygons.length } segmentos </p>
                    </CardContent>
                    </Card>

                    < Card >
                    <CardHeader className="pb-2" >
                        <CardTitle className="text-sm font-medium" > Producción Anual </CardTitle>
                            </CardHeader>
                            < CardContent >
                            <div className="text-2xl font-bold" > {(annualProduction / 1000).toFixed(0)} MWh </div>
                                < p className = "text-xs text-muted-foreground" > Estimado </p>
                                    </CardContent>
                                    </Card>

                                    < Card >
                                    <CardHeader className="pb-2" >
                                        <CardTitle className="text-sm font-medium" > CO₂ Evitado </CardTitle>
                                            </CardHeader>
                                            < CardContent >
                                            <div className="text-2xl font-bold" > { co2Avoided.toFixed(0) } ton / año </div>
                                                < p className = "text-xs text-muted-foreground" > Impacto ambiental </p>
                                                    </CardContent>
                                                    </Card>
                                                    </div>

{/* Tabs con contenido */ }
<Tabs value={ activeTab } onValueChange = { setActiveTab } className = "space-y-4" >
    <TabsList>
    <TabsTrigger value="overview" > Vista General </TabsTrigger>
        < TabsTrigger value = "layout" > Distribución </TabsTrigger>
            < TabsTrigger value = "technical" > Especificaciones </TabsTrigger>
                < TabsTrigger value = "financial" > Análisis Financiero </TabsTrigger>
                    </TabsList>

                    < TabsContent value = "overview" className = "space-y-4" >
                        <div className="grid gap-4 lg:grid-cols-2" >
                            {/* Mapa de vista previa */ }
                            < Card >
                            <CardHeader>
                            <CardTitle>Vista del Diseño </CardTitle>
                                <CardDescription>
                                    Distribución de paneles en el área definida
    </CardDescription>
    </CardHeader>
    < CardContent >
    <DesignMapViewer
                                    polygons={ polygons }
panelLayouts = { panelLayouts }
config = { config }
projectLat = { design.project?.latitude }
projectLng = { design.project?.longitude }
height = "400px"
showControls = { true}
    />
    </CardContent>
    </Card>

{/* Información del diseño */ }
<Card>
    <CardHeader>
    <CardTitle>Información del Diseño </CardTitle>
        </CardHeader>
        < CardContent className = "space-y-4" >
            <div>
            <h4 className="font-medium mb-2" > Configuración del Sistema </h4>
                < dl className = "grid grid-cols-2 gap-2 text-sm" >
                    <dt className="text-muted-foreground" > Montaje: </dt>
                        < dd > { config.racking || 'Fixed Tilt Racking' } </dd>

                        < dt className = "text-muted-foreground" > Azimut: </dt>
                            < dd > { config.azimuth || 180 }°</dd>

                                < dt className = "text-muted-foreground" > Inclinación: </dt>
                                    < dd > { config.tilt || 25 }°</dd>

                                        < dt className = "text-muted-foreground" > Orientación: </dt>
                                            < dd > { config.orientation || 'Landscape' } </dd>

                                            < dt className = "text-muted-foreground" > Espaciado filas: </dt>
                                                < dd > { config.rowSpacing || 2 } m </dd>

                                                    < dt className = "text-muted-foreground" > GCR: </dt>
                                                        < dd > { design.ground_coverage_ratio || 0.4 } </dd>
                                                        </dl>
                                                        </div>

                                                        < div >
                                                        <h4 className="font-medium mb-2" > Segmentos del Campo </h4>
                                                            < div className = "space-y-2" >
                                                            {
                                                                polygons.map((polygon: any, index: number) => (
                                                                    <div key= { polygon.id || index } className = "flex justify-between text-sm" >
                                                                    <span>{ polygon.name } </span>
                                                                    < span className = "text-muted-foreground" >
                                                                    {(polygon.area / 10000).toFixed(2)} ha
                                                                        </span>
                                                                        </div>
                                        ))}
</div>
    </div>

{
    design.notes && (
        <div>
        <h4 className="font-medium mb-2" > Notas </h4>
            < p className = "text-sm text-muted-foreground" > { design.notes } </p>
                </div>
                                )
}
</CardContent>
    </Card>
    </div>
    </TabsContent>

    < TabsContent value = "layout" >
        <Card>
        <CardHeader>
        <CardTitle>Distribución de Paneles </CardTitle>
            <CardDescription>
                                Vista detallada de la disposición de los módulos solares
    </CardDescription>
    </CardHeader>
    < CardContent >
    <DesignMapViewer
                                polygons={ polygons }
panelLayouts = { panelLayouts }
config = { config }
projectLat = { design.project?.latitude }
projectLng = { design.project?.longitude }
height = "600px"
showControls = { true}
    />
    </CardContent>
    </Card>
    </TabsContent>

    < TabsContent value = "technical" >
        <div className="space-y-4" >
            {/* Resumen del Sistema */ }
            < Card >
            <CardHeader>
            <CardTitle>Resumen del Sistema </CardTitle>
                </CardHeader>
                < CardContent >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
                    <div className="space-y-1" >
                        <p className="text-sm text-muted-foreground" > Capacidad Total DC </p>
                            < p className = "text-2xl font-bold" > { totalCapacity.toFixed(2) } kWp </p>
                                </div>
                                < div className = "space-y-1" >
                                    <p className="text-sm text-muted-foreground" > Número de Paneles </p>
                                        < p className = "text-2xl font-bold" > { totalPanels.toLocaleString() } </p>
                                            </div>
                                            < div className = "space-y-1" >
                                                <p className="text-sm text-muted-foreground" > Área Total </p>
                                                    < p className = "text-2xl font-bold" > { totalArea.toFixed(2) } ha </p>
                                                        </div>
                                                        < div className = "space-y-1" >
                                                            <p className="text-sm text-muted-foreground" > Densidad de Potencia </p>
                                                                < p className = "text-2xl font-bold" >
                                                                    { totalArea > 0 ? (totalCapacity / totalArea).toFixed(1) : 0} kWp / ha
                                                                        </p>
                                                                        </div>
                                                                        </div>
                                                                        </CardContent>
                                                                        </Card>

                                                                        < div className = "grid gap-4 lg:grid-cols-2" >
                                                                            {/* Especificaciones del Módulo */ }
{
    selectedModule && (
        <Card>
        <CardHeader>
        <CardTitle>Módulo Fotovoltaico </CardTitle>
            </CardHeader>
            < CardContent className = "space-y-4" >
                <div>
                <h4 className="font-semibold text-lg mb-2" >
                    { selectedModule.manufacturer } { selectedModule.model }
    </h4>
        < Badge variant = "outline" className = "mb-3" >
            { selectedModule.warranty } años de garantía
                </Badge>
                </div>

                < div className = "grid grid-cols-2 gap-4" >
                    <div>
                    <h5 className="font-medium mb-2" > Características Eléctricas </h5>
                        < dl className = "space-y-2 text-sm" >
                            <div className="flex justify-between" >
                                <dt className="text-muted-foreground" > Potencia nominal: </dt>
                                    < dd className = "font-medium" > { selectedModule.power } W </dd>
                                        </div>
                                        < div className = "flex justify-between" >
                                            <dt className="text-muted-foreground" > Eficiencia: </dt>
                                                < dd className = "font-medium" > { selectedModule.efficiency } % </dd>
                                                    </div>
                                                    < div className = "flex justify-between" >
                                                        <dt className="text-muted-foreground" > Voc: </dt>
                                                            < dd > { selectedModule.voc } V </dd>
                                                                </div>
                                                                < div className = "flex justify-between" >
                                                                    <dt className="text-muted-foreground" > Isc: </dt>
                                                                        < dd > { selectedModule.isc } A </dd>
                                                                            </div>
                                                                            < div className = "flex justify-between" >
                                                                                <dt className="text-muted-foreground" > Vmp: </dt>
                                                                                    < dd > { selectedModule.vmp } V </dd>
                                                                                        </div>
                                                                                        < div className = "flex justify-between" >
                                                                                            <dt className="text-muted-foreground" > Imp: </dt>
                                                                                                < dd > { selectedModule.imp } A </dd>
                                                                                                    </div>
                                                                                                    </dl>
                                                                                                    </div>

                                                                                                    < div >
                                                                                                    <h5 className="font-medium mb-2" > Características Físicas </h5>
                                                                                                        < dl className = "space-y-2 text-sm" >
                                                                                                            <div className="flex justify-between" >
                                                                                                                <dt className="text-muted-foreground" > Dimensiones: </dt>
                                                                                                                    < dd className = "font-medium" >
                                                                                                                        { selectedModule.width } × { selectedModule.height } m
                                                                                                                            </dd>
                                                                                                                            </div>
                                                                                                                            < div className = "flex justify-between" >
                                                                                                                                <dt className="text-muted-foreground" > Área: </dt>
                                                                                                                                    < dd > {(selectedModule.width * selectedModule.height).toFixed(2)
} m²</dd>
    </div>
    < div className = "flex justify-between" >
        <dt className="text-muted-foreground" > Peso: </dt>
            < dd > { selectedModule.weight } kg </dd>
                </div>
                < div className = "flex justify-between" >
                    <dt className="text-muted-foreground" > Coef.Temp.: </dt>
                        < dd > { selectedModule.tempCoeff } % /°C</dd >
                        </div>
                        < div className = "flex justify-between" >
                            <dt className="text-muted-foreground" > Orientación: </dt>
                                < dd className = "font-medium" > { config.orientation || 'Landscape' } </dd>
                                    </div>
                                    </dl>
                                    </div>
                                    </div>
                                    </CardContent>
                                    </Card>
                            )}

{/* Configuración del Sistema */ }
<Card>
    <CardHeader>
    <CardTitle>Configuración del Sistema </CardTitle>
        </CardHeader>
        < CardContent className = "space-y-4" >
            <div>
            <h5 className="font-medium mb-2" > Sistema de Montaje </h5>
                < dl className = "space-y-2 text-sm" >
                    <div className="flex justify-between" >
                        <dt className="text-muted-foreground" > Tipo: </dt>
                            < dd className = "font-medium" > { config.racking || 'Fixed Tilt Racking' } </dd>
                                </div>
                                < div className = "flex justify-between" >
                                    <dt className="text-muted-foreground" > Azimut: </dt>
                                        < dd className = "font-medium" > { config.azimuth || 180 }° ({ getCardinalDirection(config.azimuth || 180) }) </dd>
                                            </div>
                                            < div className = "flex justify-between" >
                                                <dt className="text-muted-foreground" > Inclinación: </dt>
                                                    < dd className = "font-medium" > { config.tilt || 25 }°</dd>
                                                        </div>
                                                        < div className = "flex justify-between" >
                                                            <dt className="text-muted-foreground" > Altura mínima: </dt>
                                                                < dd > { config.surfaceHeight || 0 } m </dd>
                                                                    </div>
                                                                    </dl>
                                                                    </div>

                                                                    < div >
                                                                    <h5 className="font-medium mb-2" > Disposición de Paneles </h5>
                                                                        < dl className = "space-y-2 text-sm" >
                                                                            <div className="flex justify-between" >
                                                                                <dt className="text-muted-foreground" > Configuración mesa: </dt>
                                                                                    < dd className = "font-medium" >
                                                                                        { config.frameSize || 4 } × { config.frameWidth || 1 } paneles
                                                                                            </dd>
                                                                                            </div>
                                                                                            < div className = "flex justify-between" >
                                                                                                <dt className="text-muted-foreground" > Paneles por mesa: </dt>
                                                                                                    < dd > {(config.frameSize || 4) * (config.frameWidth || 1)}</dd>
                                                                                                        </div>
                                                                                                        < div className = "flex justify-between" >
                                                                                                            <dt className="text-muted-foreground" > Número de mesas: </dt>
                                                                                                                < dd > { Math.ceil(totalPanels / ((config.frameSize || 4) * (config.frameWidth || 1))) } </dd>
                                                                                                                </div>
                                                                                                                < div className = "flex justify-between" >
                                                                                                                    <dt className="text-muted-foreground" > Filas totales: </dt>
                                                                                                                        < dd > { totalRows } </dd>
                                                                                                                        </div>
                                                                                                                        </dl>
                                                                                                                        </div>

                                                                                                                        < div >
                                                                                                                        <h5 className="font-medium mb-2" > Espaciados </h5>
                                                                                                                            < dl className = "space-y-2 text-sm" >
                                                                                                                                <div className="flex justify-between" >
                                                                                                                                    <dt className="text-muted-foreground" > Entre filas: </dt>
                                                                                                                                        < dd > { config.rowSpacing || 2 } m </dd>
                                                                                                                                            </div>
                                                                                                                                            < div className = "flex justify-between" >
                                                                                                                                                <dt className="text-muted-foreground" > Entre paneles: </dt>
                                                                                                                                                    < dd > {(config.moduleSpacing || 0.041) * 1000} mm </dd>
                                                                                                                                                        </div>
                                                                                                                                                        < div className = "flex justify-between" >
                                                                                                                                                            <dt className="text-muted-foreground" > Entre mesas: </dt>
                                                                                                                                                                < dd > { config.frameSpacing || 0 } m </dd>
                                                                                                                                                                    </div>
                                                                                                                                                                    < div className = "flex justify-between" >
                                                                                                                                                                        <dt className="text-muted-foreground" > Setback perimetral: </dt>
                                                                                                                                                                            < dd > { config.setback || 10 } m </dd>
                                                                                                                                                                                </div>
                                                                                                                                                                                < div className = "flex justify-between" >
                                                                                                                                                                                    <dt className="text-muted-foreground" > GCR: </dt>
                                                                                                                                                                                        < dd className = "font-medium" > { calculateGCR(selectedModule, config) } </dd>
                                                                                                                                                                                            </div>
                                                                                                                                                                                            </dl>
                                                                                                                                                                                            </div>
                                                                                                                                                                                            </CardContent>
                                                                                                                                                                                            </Card>
                                                                                                                                                                                            </div>

{/* Detalles por Segmento */ }
<Card>
    <CardHeader>
    <CardTitle>Distribución por Segmento </CardTitle>
        <CardDescription>
                                    Detalles de cada área del campo fotovoltaico
    </CardDescription>
    </CardHeader>
    < CardContent >
    <Table>
    <TableHeader>
    <TableRow>
    <TableHead>Segmento </TableHead>
    < TableHead > Área </TableHead>
    < TableHead > Paneles </TableHead>
    < TableHead > Capacidad </TableHead>
    < TableHead > Mesas </TableHead>
    < TableHead > Filas </TableHead>
    < TableHead > Densidad </TableHead>
    </TableRow>
    </TableHeader>
    <TableBody>
{
    polygons.map((polygon: any, index: number) => {
        const layout = panelLayouts[polygon.id] || {};
        const segmentArea = (polygon.area || 0) / 10000; // hectáreas
        const segmentCapacity = layout.actualCapacityKW || 0;
        const segmentPanels = layout.totalPanels || 0;
        const segmentFrames = Math.ceil(segmentPanels / ((config.frameSize || 4) * (config.frameWidth || 1)));
        const density = segmentArea > 0 ? segmentCapacity / segmentArea : 0;

        return (
            <TableRow key= { polygon.id || index } >
            <TableCell className="font-medium" >
                { polygon.name || `Segmento ${index + 1}` }
                </TableCell>
                < TableCell > { segmentArea.toFixed(2) } ha </TableCell>
                    < TableCell > { segmentPanels.toLocaleString() } </TableCell>
                    < TableCell > { segmentCapacity.toFixed(1) } kWp </TableCell>
                        < TableCell > { segmentFrames } </TableCell>
                        < TableCell > { layout.rows || 0 } </TableCell>
                        < TableCell > { density.toFixed(1) } kWp / ha </TableCell>
                            </TableRow>
                                            );
})}
<TableRow className="font-medium" >
    <TableCell>Total </TableCell>
    < TableCell > { totalArea.toFixed(2) } ha </TableCell>
        < TableCell > { totalPanels.toLocaleString() } </TableCell>
        < TableCell > { totalCapacity.toFixed(1) } kWp </TableCell>
            <TableCell>
{ Math.ceil(totalPanels / ((config.frameSize || 4) * (config.frameWidth || 1))) }
</TableCell>
    < TableCell > { totalRows } </TableCell>
    <TableCell>
{ totalArea > 0 ? (totalCapacity / totalArea).toFixed(1) : 0 } kWp / ha
    </TableCell>
    </TableRow>
    </TableBody>
    </Table>
    </CardContent>
    </Card>

{/* Sistema DC/AC */ }
{
    design.inverter_count > 0 && (
        <Card>
        <CardHeader>
        <CardTitle>Sistema Eléctrico </CardTitle>
            </CardHeader>
            < CardContent >
            <div className="grid gap-4 md:grid-cols-2" >
                <div>
                <h5 className="font-medium mb-2" > Inversores </h5>
                    < dl className = "space-y-2 text-sm" >
                        <div className="flex justify-between" >
                            <dt className="text-muted-foreground" > Cantidad: </dt>
                                < dd className = "font-medium" > { design.inverter_count } </dd>
                                    </div>
                                    < div className = "flex justify-between" >
                                        <dt className="text-muted-foreground" > Ratio DC / AC: </dt>
                                            < dd > { design.dc_ac_ratio || 1.25 } </dd>
                                            </div>
                                            </dl>
                                            </div>
                                            < div >
                                            <h5 className="font-medium mb-2" > Strings </h5>
                                                < dl className = "space-y-2 text-sm" >
                                                    <div className="flex justify-between" >
                                                        <dt className="text-muted-foreground" > Total strings: </dt>
                                                            < dd className = "font-medium" > { design.string_count || 'N/A' } </dd>
                                                                </div>
                                                                < div className = "flex justify-between" >
                                                                    <dt className="text-muted-foreground" > Paneles por string: </dt>
                                                                        < dd > { design.panels_per_string || 'N/A' } </dd>
                                                                        </div>
                                                                        </dl>
                                                                        </div>
                                                                        </div>
                                                                        </CardContent>
                                                                        </Card>
                        )
}

{/* Lista de Materiales (BOM) */ }
<Card>
    <CardHeader>
    <CardTitle>Lista de Materiales(BOM) </CardTitle>
        <CardDescription>
                                    Resumen de componentes principales del sistema
    </CardDescription>
    </CardHeader>
    < CardContent >
    <div className="space-y-6" >
        {/* Módulos Fotovoltaicos */ }
{
    selectedModule && (
        <div className="border rounded-lg p-4" >
            <div className="flex items-start justify-between mb-3" >
                <div>
                <h5 className="font-medium text-base" > Módulos Fotovoltaicos </h5>
                    < p className = "text-sm text-muted-foreground" >
                        { selectedModule.manufacturer } { selectedModule.model }
    </p>
        </div>
        < Badge variant = "secondary" className = "text-lg px-3 py-1" >
            { totalPanels.toLocaleString() } uds
                </Badge>
                </div>

                < div className = "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" >
                    <div>
                    <p className="text-muted-foreground" > Potencia unitaria </p>
                        < p className = "font-medium" > { selectedModule.power } W </p>
                            </div>
                            < div >
                            <p className="text-muted-foreground" > Potencia total </p>
                                < p className = "font-medium" > { totalCapacity.toFixed(2) } kWp </p>
                                    </div>
                                    < div >
                                    <p className="text-muted-foreground" > Peso unitario </p>
                                        < p className = "font-medium" > { selectedModule.weight } kg </p>
                                            </div>
                                            < div >
                                            <p className="text-muted-foreground" > Peso total </p>
                                                < p className = "font-medium" >
                                                    {((selectedModule.weight * totalPanels) / 1000).toFixed(1)
} ton
    </p>
    </div>
    </div>

    < div className = "mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-3 gap-4 text-sm" >
        <div>
        <p className="text-muted-foreground" > Área por panel </p>
            < p className = "font-medium" >
                {(selectedModule.width * selectedModule.height).toFixed(2)} m²
</p>
    </div>
    < div >
    <p className="text-muted-foreground" > Área total paneles </p>
        < p className = "font-medium" >
            {((selectedModule.width * selectedModule.height * totalPanels) / 10000).toFixed(2)} ha
                </p>
                </div>
                < div >
                <p className="text-muted-foreground" > Garantía </p>
                    < p className = "font-medium" > { selectedModule.warranty } años </p>
                        </div>
                        </div>
                        </div>
                                    )}

{/* Estructura de Montaje */ }
<div className="border rounded-lg p-4" >
    <div className="flex items-start justify-between mb-3" >
        <div>
        <h5 className="font-medium text-base" > Estructura de Montaje </h5>
            < p className = "text-sm text-muted-foreground" >
                { config.racking || 'Fixed Tilt Racking' }
                </p>
                </div>
                < Badge variant = "secondary" className = "text-lg px-3 py-1" >
                    { Math.ceil(totalPanels / ((config.frameSize || 4) * (config.frameWidth || 1))) } mesas
                        </Badge>
                        </div>

                        < div className = "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm" >
                            <div>
                            <p className="text-muted-foreground" > Config.por mesa </p>
                                < p className = "font-medium" >
                                    { config.frameSize || 4 } × { config.frameWidth || 1 } paneles
                                        </p>
                                        </div>
                                        < div >
                                        <p className="text-muted-foreground" > Paneles por mesa </p>
                                            < p className = "font-medium" >
                                                {(config.frameSize || 4) * (config.frameWidth || 1)} uds
                                                    </p>
                                                    </div>
                                                    < div >
                                                    <p className="text-muted-foreground" > Inclinación </p>
                                                        < p className = "font-medium" > { config.tilt || 25 }°</p>
                                                            </div>
                                                            </div>
                                                            </div>

{/* Inversores */ }
{
    design.inverter_count > 0 && (
        <div className="border rounded-lg p-4" >
            <div className="flex items-start justify-between mb-3" >
                <div>
                <h5 className="font-medium text-base" > Inversores </h5>
                    < p className = "text-sm text-muted-foreground" >
                        { design.inverter_type || 'Por definir' }
                        </p>
                        </div>
                        < Badge variant = "secondary" className = "text-lg px-3 py-1" >
                            { design.inverter_count } uds
                                </Badge>
                                </div>

                                < div className = "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm" >
                                    <div>
                                    <p className="text-muted-foreground" > Potencia AC total </p>
                                        < p className = "font-medium" >
                                            {(totalCapacity / (design.dc_ac_ratio || 1.25)).toFixed(1)
} kW
    </p>
    </div>
    < div >
    <p className="text-muted-foreground" > Potencia por inversor </p>
        < p className = "font-medium" >
            {(totalCapacity / (design.dc_ac_ratio || 1.25) / design.inverter_count).toFixed(1)} kW
                </p>
                </div>
                < div >
                <p className="text-muted-foreground" > Strings por inversor </p>
                    < p className = "font-medium" >
                        { design.string_count ? Math.ceil(design.string_count / design.inverter_count) : 'N/A' }
                        </p>
                        </div>
                        </div>
                        </div>
                                    )}

{/* Cableado y Conectores */ }
<div className="border rounded-lg p-4" >
    <h5 className="font-medium text-base mb-3" > Cableado y Conectores(Estimado) </h5>

        < div className = "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm" >
            <div>
            <p className="text-muted-foreground" > Cable DC(4 - 6mm²) </p>
                < p className = "font-medium" >
                    ~{(totalPanels * 3).toLocaleString()} m
                        </p>
                        </div>
                        < div >
                        <p className="text-muted-foreground" > Conectores MC4 </p>
                            < p className = "font-medium" >
                                ~{(totalPanels * 2).toLocaleString()} pares
                                    </p>
                                    </div>
                                    < div >
                                    <p className="text-muted-foreground" > Cajas combinadoras </p>
                                        < p className = "font-medium" >
                                            ~{ Math.ceil((design.string_count || totalPanels / 20) / 12) } uds
                                                </p>
                                                </div>
                                                </div>
                                                </div>

{/* Resumen de costos estimados */ }
<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4" >
    <h5 className="font-medium text-base mb-3" > Resumen de Inversión(Estimado) </h5>

        < div className = "space-y-2" >
            <div className="flex justify-between text-sm" >
                <span className="text-muted-foreground" > Módulos FV(~$0.25 / W) </span>
                    < span className = "font-medium" >
                        ${ (totalCapacity * 250).toLocaleString() } USD
                            </span>
                            </div>
                            < div className = "flex justify-between text-sm" >
                                <span className="text-muted-foreground" > Estructura(~$50 / kW) </span>
                                    < span className = "font-medium" >
                                        ${ (totalCapacity * 50).toLocaleString() } USD
                                            </span>
                                            </div>
{
    design.inverter_count > 0 && (
        <div className="flex justify-between text-sm" >
            <span className="text-muted-foreground" > Inversores(~$60 / kW) </span>
                < span className = "font-medium" >
                    ${ (totalCapacity * 60).toLocaleString() } USD
                        </span>
                        </div>
                                            )
}
<div className="flex justify-between text-sm" >
    <span className="text-muted-foreground" > BOS y otros(~$140 / kW) </span>
        < span className = "font-medium" >
            ${ (totalCapacity * 140).toLocaleString() } USD
                </span>
                </div>
                < div className = "border-t pt-2 flex justify-between" >
                    <span className="font-medium" > CAPEX Total Estimado </span>
                        < span className = "font-bold text-lg" >
                            ${ (totalCapacity * 500).toLocaleString() } USD
                                </span>
                                </div>
                                < div className = "flex justify-between text-sm text-muted-foreground" >
                                    <span>Costo por kW instalado </span>
                                        < span > ~$500 / kW </span>
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        </CardContent>
                                        </Card>
                                        </div>
                                        </TabsContent>

                                        < TabsContent value = "financial" >
                                            <Card>
                                            <CardHeader>
                                            <CardTitle>Análisis Financiero </CardTitle>
                                                <CardDescription>
                                Proyecciones económicas del proyecto
    </CardDescription>
    </CardHeader>
    < CardContent >
    <p className="text-muted-foreground" >
        El análisis financiero estará disponible próximamente
            </p>
            </CardContent>
            </Card>
            </TabsContent>
            </Tabs>

{/* Delete Dialog */ }
<AlertDialog open={ showDeleteDialog } onOpenChange = { setShowDeleteDialog } >
    <AlertDialogContent>
    <AlertDialogHeader>
    <AlertDialogTitle>¿Eliminar diseño ? </AlertDialogTitle>
        <AlertDialogDescription>
                            Esta acción no se puede deshacer.Se eliminará permanentemente el diseño
"{design.name}" y toda su configuración.
                        </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel>Cancelar </AlertDialogCancel>
    < AlertDialogAction
onClick = { handleDelete }
className = "bg-red-600 hover:bg-red-700"
disabled = { isDeleting }
    >
    { isDeleting? 'Eliminando...': 'Eliminar' }
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
    </div>
    );
}