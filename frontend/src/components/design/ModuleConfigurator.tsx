// src/components/design/ModuleConfigurator.tsx

'use client';

const React = require('react');
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Info } from 'lucide-react';

// Mock de paneles disponibles
const mockPanels = [
    { id: 1, name: 'TRINA SOLAR TSM-690NEG21C.20', power: 690, efficiency: 21.3 },
    { id: 2, name: 'JinkoSolar Tiger Pro 545', power: 545, efficiency: 21.1 },
    { id: 3, name: 'Canadian Solar HiKu7 590', power: 590, efficiency: 21.4 },
];

interface ModuleConfiguratorProps {
    selectedModule: any;
    onModuleChange: (module: any) => void;
    config: any;
    onConfigChange: (config: any) => void;
}

export default function ModuleConfigurator({
    selectedModule,
    onModuleChange,
    config,
    onConfigChange,
}: ModuleConfiguratorProps) {
    const updateConfig = (key: string, value: any) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <div className= "space-y-4" >
        {/* Module Selection */ }
        < Card >
        <CardHeader>
        <CardTitle>Selección de Panel </CardTitle>
            </CardHeader>
            < CardContent className = "space-y-4" >
                <div className="relative" >
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
              placeholder="Buscar panel..."
    className = "pl-10"
        />
        </div>

        < Select
    value = { selectedModule?.id?.toString() }
    onValueChange = {(value) => {
        const panel = mockPanels.find(p => p.id.toString() === value);
        onModuleChange(panel);
    }
}
          >
    <SelectTrigger>
    <SelectValue placeholder="Selecciona un panel" />
        </SelectTrigger>
        <SelectContent>
{
    mockPanels.map((panel) => (
        <SelectItem key= { panel.id } value = { panel.id.toString() } >
        <div>
        <div className="font-medium" > { panel.name } </div>
    < div className = "text-sm text-muted-foreground" >
    { panel.power }W • { panel.efficiency } % eficiencia
    </div>
    </div>
    </SelectItem>
    ))
}
</SelectContent>
    </Select>

{
    selectedModule && (
        <div className="p-3 bg-muted rounded-lg text-sm" >
            <div className="flex items-center gap-2 mb-1" >
                <Info className="h-4 w-4" />
                    <span className="font-medium" > Panel seleccionado </span>
                        </div>
                        < div className = "space-y-1 text-muted-foreground" >
                            <div>Potencia: { selectedModule.power } W </div>
                                < div > Eficiencia: { selectedModule.efficiency }% </div>
                                    </div>
                                    </div>
          )
}
</CardContent>
    </Card>

{/* Layout Configuration */ }
<Card>
    <CardHeader>
    <CardTitle>Configuración de Layout </CardTitle>
        <CardDescription>
            Ajusta los parámetros de instalación
    </CardDescription>
    </CardHeader>
    < CardContent className = "space-y-4" >
        {/* Tilt Angle */ }
        < div className = "space-y-2" >
            <div className="flex items-center justify-between" >
                <Label>Ángulo de inclinación </Label>
                    < span className = "text-sm font-medium" > { config.tiltAngle }°</span>
                        </div>
                        < Slider
value = { [config.tiltAngle]}
onValueChange = {([value]) => updateConfig('tiltAngle', value)}
min = { 0}
max = { 60}
step = { 5}
    />
    </div>

{/* Azimuth Angle */ }
<div className="space-y-2" >
    <div className="flex items-center justify-between" >
        <Label>Azimut </Label>
        < span className = "text-sm font-medium" > { config.azimuthAngle }°</span>
            </div>
            < Slider
value = { [config.azimuthAngle]}
onValueChange = {([value]) => updateConfig('azimuthAngle', value)}
min = { 0}
max = { 360}
step = { 15}
    />
    <p className="text-xs text-muted-foreground" >
        180° = Sur, 0° = Norte
            </p>
            </div>

{/* Module Orientation */ }
<div className="space-y-2" >
    <Label>Orientación de módulos </Label>
        < Select
value = { config.moduleOrientation }
onValueChange = {(value) => updateConfig('moduleOrientation', value)}
            >
    <SelectTrigger>
    <SelectValue />
    </SelectTrigger>
    < SelectContent >
    <SelectItem value="landscape" > Horizontal(Landscape) </SelectItem>
        < SelectItem value = "portrait" > Vertical(Portrait) </SelectItem>
            </SelectContent>
            </Select>
            </div>

{/* Row Spacing */ }
<div className="space-y-2" >
    <Label>Espaciado entre filas(m) </Label>
        < Input
type = "number"
value = { config.rowSpacing }
onChange = {(e) => updateConfig('rowSpacing', parseFloat(e.target.value))}
min = { 1}
max = { 20}
step = { 0.5}
    />
    </div>

{/* Setback */ }
<div className="space-y-2" >
    <Label>Retranqueo perimetral(m) </Label>
        < Input
type = "number"
value = { config.setback }
onChange = {(e) => updateConfig('setback', parseFloat(e.target.value))}
min = { 0}
max = { 50}
step = { 1}
    />
    <p className="text-xs text-muted-foreground" >
        Distancia desde el borde del área
            </p>
            </div>
            </CardContent>
            </Card>

{/* Advanced Options */ }
<Card>
    <CardHeader>
    <CardTitle>Opciones Avanzadas </CardTitle>
        </CardHeader>
        < CardContent >
        <Button variant="outline" className = "w-full" >
            Configuración eléctrica avanzada
                </Button>
                </CardContent>
                </Card>
                </div>
  );
}