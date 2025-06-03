// src/components/design/DesignMetrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Sun, BarChart3, Grid3X3 } from 'lucide-react';

interface DesignMetricsProps {
    polygons: any[];
    selectedModule: any;
    config: any;
}

export default function DesignMetrics({ polygons, selectedModule, config }: DesignMetricsProps) {
    // Calcular métricas totales
    const totalArea = polygons.reduce((sum, p) => sum + p.area, 0) / 10000; // hectáreas
    const totalSegments = polygons.length;

    // Calcular capacidad total basada en configuración
    const calculateTotalCapacity = () => {
        if (!selectedModule || !config.maxSize) return 0;

        // Si hay un límite máximo, usarlo
        const maxCapacityKW = parseFloat(config.maxSize) || 0;

        // Calcular capacidad basada en el área disponible
        const totalAreaM2 = totalArea * 10000;
        const usableArea = totalAreaM2 * 0.7; // 70% utilizable
        const panelArea = selectedModule.width * selectedModule.height;
        const gcr = calculateGCR();
        const panelsByArea = Math.floor((usableArea * gcr) / panelArea);
        const capacityByArea = (panelsByArea * selectedModule.power) / 1000; // kW

        // Retornar el menor entre el máximo y lo que cabe
        return Math.min(maxCapacityKW, capacityByArea);
    };

    // Calcular GCR local
    const calculateGCR = () => {
        if (!selectedModule || !config.rowSpacing) return 0.4;
        const panelLength = config.orientation === 'Landscape'
            ? selectedModule.width
            : selectedModule.height;
        const tiltRad = ((config.tilt || 25) * Math.PI) / 180;
        const rowPitch = panelLength * Math.cos(tiltRad) + (parseFloat(config.rowSpacing) || 15) * 0.3048;
        return panelLength * Math.cos(tiltRad) / rowPitch;
    };

    const totalCapacity = calculateTotalCapacity();
    const totalPanels = selectedModule ? Math.floor((totalCapacity * 1000) / selectedModule.power) : 0;

    // Estimaciones de producción (simplificadas)
    const annualProduction = totalCapacity * 1600; // kWh/kWp típico para Buenos Aires
    const capacityFactor = 0.18; // 18% típico para solar fija
    const performanceRatio = 0.84; // 84% PR típico

    // Métricas adicionales
    const dcAcRatio = 1.25; // Típico
    const specificYield = totalCapacity > 0 ? annualProduction / totalCapacity : 0;

    return (
        <Card className= "h-full" >
        <CardHeader>
        <CardTitle className="text-lg" > Métricas del Diseño </CardTitle>
            </CardHeader>
            < CardContent className = "space-y-4" >
                {/* Capacidad */ }
                < div className = "space-y-2" >
                    <div className="flex items-center justify-between" >
                        <div className="flex items-center gap-2 text-sm" >
                            <Zap className="h-4 w-4 text-yellow-600" />
                                <span>Capacidad DC </span>
                                    </div>
                                    < span className = "font-medium" > { totalCapacity.toFixed(0) } kWp </span>
                                        </div>
    {
        config.maxSize && (
            <Progress 
              value={ (totalCapacity / parseFloat(config.maxSize)) * 100 }
        className = "h-2"
            />
          )
    }
    </div>

    {/* Área */ }
    <div className="space-y-2" >
        <div className="flex items-center justify-between" >
            <div className="flex items-center gap-2 text-sm" >
                <Grid3X3 className="h-4 w-4 text-green-600" />
                    <span>Área Total </span>
                        </div>
                        < span className = "font-medium" > { totalArea.toFixed(2) } ha </span>
                            </div>
                            < div className = "text-xs text-gray-600" >
                                { totalSegments } segmento{ totalSegments !== 1 ? 's' : '' }
    </div>
        </div>

    {/* Paneles */ }
    {
        selectedModule && (
            <div className="flex items-center justify-between" >
                <div className="flex items-center gap-2 text-sm" >
                    <Sun className="h-4 w-4 text-blue-600" />
                        <span>Paneles </span>
                        </div>
                        < span className = "font-medium" > { totalPanels.toLocaleString() } </span>
                            </div>
        )
    }

    <div className="border-t pt-4 space-y-3" >
        <h4 className="font-medium text-sm" > Estimaciones </h4>

    {/* Producción anual */ }
    <div className="flex justify-between text-sm" >
        <span className="text-gray-600" > Producción Anual </span>
            < span className = "font-medium" >
                {(annualProduction / 1000).toFixed(1)
} MWh
    </span>
    </div>

{/* Factor de capacidad */ }
<div className="flex justify-between text-sm" >
    <span className="text-gray-600" > Factor de Capacidad </span>
        < span className = "font-medium" > {(capacityFactor * 100).toFixed(0)}% </span>
            </div>

{/* Performance Ratio */ }
<div className="flex justify-between text-sm" >
    <span className="text-gray-600" > Performance Ratio </span>
        < span className = "font-medium" > {(performanceRatio * 100).toFixed(0)}% </span>
            </div>

{/* Ratio DC/AC */ }
<div className="flex justify-between text-sm" >
    <span className="text-gray-600" > Ratio DC / AC </span>
        < span className = "font-medium" > { dcAcRatio.toFixed(2) } </span>
            </div>

{/* GCR */ }
<div className="flex justify-between text-sm" >
    <span className="text-gray-600" > GCR </span>
        < span className = "font-medium" > { calculateGCR().toFixed(2) } </span>
            </div>

{/* Rendimiento específico */ }
<div className="flex justify-between text-sm" >
    <span className="text-gray-600" > Rendimiento </span>
        < span className = "font-medium" >
            { specificYield.toFixed(0) } kWh / kWp / año
                </span>
                </div>
                </div>

{/* Información adicional del sistema */ }
{
    selectedModule && (
        <div className="border-t pt-4 space-y-2" >
            <h4 className="font-medium text-sm" > Configuración </h4>
                < div className = "text-xs text-gray-600 space-y-1" >
                    <div>Panel: { selectedModule.manufacturer } { selectedModule.model } </div>
                        < div > Montaje: { config.racking || 'Fixed Tilt Racking' } </div>
                            < div > Inclinación: { config.tilt || 25 }°</div>
                                < div > Azimut: { config.azimuth || 180 }°</div>
                                    < div > Orientación: { config.orientation || 'Landscape' } </div>
                                        </div>
                                        </div>
        )
}
</CardContent>
    </Card>
  );
}