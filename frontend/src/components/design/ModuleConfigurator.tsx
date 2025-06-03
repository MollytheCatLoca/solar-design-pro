// src/components/design/ModuleConfigurator.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Plus } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModuleConfiguratorProps {
    selectedModule: any;
    setSelectedModule: (module: any) => void;
    config: any;
    setConfig: (config: any) => void;
    selectedSegment?: any;
}

// Datos de paneles reales con dimensiones
const panelDatabase = [
    {
        id: 1,
        manufacturer: 'TRINA SOLAR',
        model: 'TSM-690NEG21C.20',
        power: 690,
        efficiency: 21.3,
        width: 2.384, // metros
        height: 1.303, // metros
        weight: 37.9, // kg
        voc: 46.9,
        isc: 18.52,
        vmp: 38.5,
        imp: 17.93,
        tempCoeff: -0.29,
        warranty: 30,
    },
    {
        id: 2,
        manufacturer: 'JinkoSolar',
        model: 'Tiger Pro 545',
        power: 545,
        efficiency: 21.1,
        width: 2.274,
        height: 1.134,
        weight: 28.9,
        voc: 49.5,
        isc: 13.9,
        vmp: 41.7,
        imp: 13.08,
        tempCoeff: -0.35,
        warranty: 25,
    },
    {
        id: 3,
        manufacturer: 'Canadian Solar',
        model: 'HiKu7 CS7L-590MS',
        power: 590,
        efficiency: 21.4,
        width: 2.384,
        height: 1.303,
        weight: 34.4,
        voc: 51.9,
        isc: 14.45,
        vmp: 43.6,
        imp: 13.54,
        tempCoeff: -0.34,
        warranty: 25,
    },
];

export default function ModuleConfigurator({
    selectedModule,
    setSelectedModule,
    config,
    setConfig,
    selectedSegment,
}: ModuleConfiguratorProps) {
    const [layoutMode, setLayoutMode] = useState('automatic');

    // Calcular capacidad máxima basada en el área del segmento
    const calculateMaxCapacity = () => {
        if (!selectedSegment?.area) return 0;
        // Fórmula aproximada: área útil * densidad de potencia
        const usableArea = selectedSegment.area * 0.7; // 70% del área es utilizable
        const powerDensity = 200; // W/m² típico para instalaciones modernas
        return (usableArea * powerDensity) / 1000000; // Convertir a MW
    };

    // Calcular número de paneles basado en capacidad objetivo
    const calculatePanelCount = () => {
        if (!config.maxSize || !selectedModule) return 0;
        const targetPowerKW = parseFloat(config.maxSize) || 0;
        const panelPowerKW = selectedModule.power / 1000;
        return Math.floor(targetPowerKW / panelPowerKW);
    };

    // Calcular GCR (Ground Coverage Ratio)
    const calculateGCR = () => {
        if (!selectedModule || !config.rowSpacing) return 0;
        const panelLength = config.orientation === 'Landscape'
            ? selectedModule.width
            : selectedModule.height;
        const tiltRad = (config.tilt * Math.PI) / 180;
        const rowPitch = panelLength * Math.cos(tiltRad) + parseFloat(config.rowSpacing);
        return (panelLength * Math.cos(tiltRad) / rowPitch).toFixed(2);
    };

    return (
        <Card className= "h-full overflow-auto" >
        <CardHeader className="pb-3" >
            <CardTitle className="text-lg" > Configuración del Campo </CardTitle>
                </CardHeader>
                < CardContent className = "space-y-4" >
                    {/* Información del segmento seleccionado */ }
    {
        selectedSegment && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm" >
                <div className="font-medium mb-1" > { selectedSegment.name } </div>
                    < div > Área: { (selectedSegment.area / 10000).toFixed(2) } ha </div>
                        < div > Capacidad estimada: { calculateMaxCapacity().toFixed(2) } MW </div>
                            </div>
        )
    }

    <Tabs defaultValue="module" className = "w-full" >
        <TabsList className="grid w-full grid-cols-3" >
            <TabsTrigger value="module" > Módulo </TabsTrigger>
                < TabsTrigger value = "layout" > Disposición </TabsTrigger>
                    < TabsTrigger value = "electrical" > Eléctrico </TabsTrigger>
                        </TabsList>

    {/* Tab de Módulo */ }
    <TabsContent value="module" className = "space-y-4" >
        <div className="space-y-2" >
            <Label>Panel Solar </Label>
                < Select
    value = { selectedModule?.id?.toString() }
    onValueChange = {(value) => {
        const panel = panelDatabase.find((p) => p.id.toString() === value);
        setSelectedModule(panel);
    }
}
              >
    <SelectTrigger>
    <SelectValue placeholder="Selecciona un panel" />
        </SelectTrigger>
        <SelectContent>
{
    panelDatabase.map((panel) => (
        <SelectItem key= { panel.id } value = { panel.id.toString() } >
        <div>
        <div className="font-medium" >
    { panel.manufacturer } { panel.model }
    </div>
    < div className = "text-sm text-muted-foreground" >
    { panel.power }W • { panel.width }×{ panel.height }m • { panel.efficiency } % eff
    </div>
    </div>
    </SelectItem>
    ))
}
</SelectContent>
    </Select>
    </div>

{
    selectedModule && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm" >
            <div className="grid grid-cols-2 gap-2" >
                <div>
                <span className="text-gray-600" > Potencia: </span>
                    < span className = "ml-2 font-medium" > { selectedModule.power }W </span>
                        </div>
                        < div >
                        <span className="text-gray-600" > Eficiencia: </span>
                            < span className = "ml-2 font-medium" > { selectedModule.efficiency } % </span>
                                </div>
                                < div >
                                <span className="text-gray-600" > Dimensiones: </span>
                                    < span className = "ml-2 font-medium" >
                                        { selectedModule.width }×{ selectedModule.height } m
                                            </span>
                                            </div>
                                            < div >
                                            <span className="text-gray-600" > Área: </span>
                                                < span className = "ml-2 font-medium" >
                                                    {(selectedModule.width * selectedModule.height).toFixed(2)
} m²
</span>
    </div>
    </div>
    </div>
            )}

{/* Configuración de montaje */ }
<div className="space-y-2" >
    <Label>Sistema de Montaje </Label>
        < Select
value = { config.racking || 'Fixed Tilt Racking' }
onValueChange = {(value) => setConfig({ ...config, racking: value })}
              >
    <SelectTrigger>
    <SelectValue />
    </SelectTrigger>
    < SelectContent >
    <SelectItem value="Fixed Tilt Racking" > Inclinación Fija </SelectItem>
        < SelectItem value = "Single Axis Tracker" > Seguidor 1 Eje </SelectItem>
            < SelectItem value = "Dual Axis Tracker" > Seguidor 2 Ejes </SelectItem>
                < SelectItem value = "Seasonal Tilt" > Inclinación Estacional </SelectItem>
                    </SelectContent>
                    </Select>
                    </div>

{/* Altura de superficie */ }
<div className="space-y-2" >
    <div className="flex items-center gap-2" >
        <Label>Altura de Superficie </Label>
            < TooltipProvider >
            <Tooltip>
            <TooltipTrigger>
            <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                < TooltipContent >
                <p>Altura del borde inferior del panel sobre el suelo </p>
                    </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                    </div>
                    < div className = "flex gap-2" >
                        <Input
                  type="number"
value = { config.surfaceHeight || 10 }
onChange = {(e) => setConfig({ ...config, surfaceHeight: e.target.value })}
className = "w-20"
    />
    <span className="flex items-center text-sm text-gray-600" > ft </span>
        </div>
        </div>

{/* Azimut del módulo */ }
<div className="space-y-2" >
    <div className="flex justify-between items-center" >
        <Label>Azimut del Módulo </Label>
            < span className = "text-sm text-muted-foreground" > { config.azimuth || 0 }°</span>
                </div>
                < Slider
value = { [config.azimuth || 0]}
onValueChange = {([value]) => setConfig({ ...config, azimuth: value })}
max = { 360}
step = { 1}
    />
    <div className="flex justify-between text-xs text-muted-foreground" >
        <span>N(0°) </span>
        < span > E(90°) </span>
        < span > S(180°) </span>
        < span > O(270°) </span>
        </div>
        </div>

{/* Inclinación del módulo */ }
<div className="space-y-2" >
    <div className="flex justify-between items-center" >
        <Label>Inclinación del Módulo </Label>
            < span className = "text-sm text-muted-foreground" > { config.tilt || 25 }°</span>
                </div>
                < Slider
value = { [config.tilt || 25]}
onValueChange = {([value]) => setConfig({ ...config, tilt: value })}
max = { 60}
step = { 1}
    />
    </div>
    </TabsContent>

{/* Tab de Layout */ }
<TabsContent value="layout" className = "space-y-4" >
    {/* Tamaño máximo del sistema */ }
    < div className = "space-y-2" >
        <div className="flex items-center gap-2" >
            <Label>Tamaño Máximo </Label>
                < TooltipProvider >
                <Tooltip>
                <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    < TooltipContent >
                    <p>Capacidad DC máxima del sistema </p>
                        </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                        </div>
                        < div className = "flex gap-2" >
                            <Input
                  type="number"
value = { config.maxSize || 1600 }
onChange = {(e) => setConfig({ ...config, maxSize: e.target.value })}
className = "w-24"
    />
    <span className="flex items-center text-sm text-gray-600" > kWp </span>
        < Button variant = "link" size = "sm" className = "ml-auto" >
            Remove
            </Button>
            </div>
{
    selectedModule && (
        <p className="text-sm text-gray-600" >
                  ≈ { calculatePanelCount().toLocaleString() } paneles
        </p>
              )
}
</div>

{/* Reglas de layout automático */ }
<div className="space-y-2" >
    <Label>Reglas de Layout Automático </Label>

{/* Tamaño del frame */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Frame Size: </span>
        < Input
type = "number"
value = { config.frameSize || 4 }
onChange = {(e) => setConfig({ ...config, frameSize: e.target.value })}
className = "w-16"
    />
    <span className="text-sm" > alto </span>
        < span className = "text-sm mx-1" >×</span>
            < Input
type = "number"
value = { config.frameWidth || 1 }
onChange = {(e) => setConfig({ ...config, frameWidth: e.target.value })}
className = "w-16"
    />
    <span className="text-sm" > ancho </span>
        </div>

{/* Orientación */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Orientación: </span>
        < Select
value = { config.orientation || 'Landscape' }
onValueChange = {(value) => setConfig({ ...config, orientation: value })}
                >
    <SelectTrigger className="w-full" >
        <SelectValue />
        </SelectTrigger>
        < SelectContent >
        <SelectItem value="Landscape" > Landscape(Horizontal) </SelectItem>
            < SelectItem value = "Portrait" > Portrait(Vertical) </SelectItem>
                </SelectContent>
                </Select>
                </div>

{/* Espaciado entre filas */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Row Spacing: </span>
        < Input
type = "number"
value = { config.rowSpacing || 15 }
onChange = {(e) => setConfig({ ...config, rowSpacing: e.target.value })}
className = "w-16"
    />
    <span className="text-sm" > ft </span>
        < span className = "text-sm text-gray-600 ml-2" >
            Span / rise: {
                ((parseFloat(config.rowSpacing) || 15) /
                    (selectedModule?.height || 1) /
                    Math.sin((config.tilt || 25) * Math.PI / 180)).toFixed(1)
}
</span>
    </div>

{/* Espaciado entre módulos */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Module Gap: </span>
        < Input
type = "number"
value = { config.moduleSpacing || 0.041 }
onChange = {(e) => setConfig({ ...config, moduleSpacing: e.target.value })}
className = "w-20"
step = "0.001"
    />
    <span className="text-sm" > ft </span>
        < span className = "text-sm text-gray-600 ml-2" >
            GCR: { calculateGCR() }
</span>
    </div>

{/* Espaciado entre frames */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Frame Gap: </span>
        < Input
type = "number"
value = { config.frameSpacing || 0 }
onChange = {(e) => setConfig({ ...config, frameSpacing: e.target.value })}
className = "w-16"
    />
    <span className="text-sm" > ft </span>
        < Button variant = "link" size = "sm" className = "ml-auto text-blue-600" >
            Time of Day
                </Button>
                </div>

{/* Setback */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Setback: </span>
        < Input
type = "number"
value = { config.setback || 40 }
onChange = {(e) => setConfig({ ...config, setback: e.target.value })}
className = "w-16"
    />
    <span className="text-sm" > ft </span>
        </div>

{/* Alineación */ }
<div className="flex items-center gap-2" >
    <span className="text-sm w-24" > Alineación: </span>
        < div className = "flex gap-1" >
            <Button
                    variant={ config.alignH === 'left' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignH: 'left' })}
                  >
                    ⬅
</Button>
    < Button
variant = { config.alignH === 'center' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignH: 'center' })}
                  >
                    ↔
</Button>
    < Button
variant = { config.alignH === 'right' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignH: 'right' })}
                  >
                    ➡
</Button>
    < div className = "w-2" />
        <Button
                    variant={ config.alignV === 'top' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignV: 'top' })}
                  >
                    ⬆
</Button>
    < Button
variant = { config.alignV === 'middle' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignV: 'middle' })}
                  >
                    ↕
</Button>
    < Button
variant = { config.alignV === 'bottom' ? 'default' : 'outline' }
size = "icon"
className = "h-8 w-8"
onClick = {() => setConfig({ ...config, alignV: 'bottom' })}
                  >
                    ⬇
</Button>
    </div>
    </div>
    </div>

{/* Añadir inclinación independiente */ }
<Button variant="link" size = "sm" className = "text-blue-600" >
    <Plus className="h-4 w-4 mr-1" />
        Add Independent Tilt
            </Button>
            </TabsContent>

{/* Tab Eléctrico */ }
<TabsContent value="electrical" className = "space-y-4" >
    <div className="text-sm text-gray-600" >
        Configuración eléctrica del sistema
            </div>
{/* Aquí irían las configuraciones eléctricas */ }
</TabsContent>
    </Tabs>
    </CardContent>
    </Card>
  );
}