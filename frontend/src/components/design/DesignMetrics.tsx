// src/components/design/DesignMetrics.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Zap,
    Square,
    Sun,
    Grid3x3
} from 'lucide-react';

interface DesignMetricsProps {
    totalCapacity: number;
    totalArea: number;
    estimatedPanels: number;
    polygonCount: number;
}

export default function DesignMetrics({
    totalCapacity,
    totalArea,
    estimatedPanels,
    polygonCount,
}: DesignMetricsProps) {
    const metrics = [
        {
            title: 'Capacidad Total',
            value: totalCapacity.toFixed(2),
            unit: 'MW',
            icon: Zap,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
        },
        {
            title: 'Área Total',
            value: (totalArea / 10000).toFixed(2),
            unit: 'ha',
            icon: Square,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Paneles Estimados',
            value: estimatedPanels.toLocaleString(),
            unit: 'unidades',
            icon: Sun,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Áreas de Instalación',
            value: polygonCount,
            unit: 'segmentos',
            icon: Grid3x3,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ];

    return (
        <div className= "space-y-4" >
        <Card>
        <CardHeader>
        <CardTitle>Resumen del Diseño </CardTitle>
            <CardDescription>
            Métricas principales del sistema
        </CardDescription>
        </CardHeader>
        < CardContent className = "space-y-4" >
        {
            metrics.map((metric) => (
                <div key= { metric.title } className = "flex items-center gap-4" >
                <div className={`p-3 rounded-lg ${metric.bgColor}`} >
            <metric.icon className={ `h-5 w-5 ${metric.color}` } />
                </div>
                < div className = "flex-1" >
                    <p className="text-sm text-muted-foreground" > { metric.title } </p>
                        < p className = "text-2xl font-bold" >
                            { metric.value }
                            < span className = "text-sm font-normal text-muted-foreground ml-1" >
                                { metric.unit }
                                </span>
                                </p>
                                </div>
                                </div>
          ))
}
</CardContent>
    </Card>

    < Card >
    <CardHeader>
    <CardTitle>Estimaciones </CardTitle>
    </CardHeader>
    < CardContent className = "space-y-3" >
        <div className="flex justify-between text-sm" >
            <span className="text-muted-foreground" > Producción anual estimada </span>
                < span className = "font-medium" > {(totalCapacity * 1.5).toFixed(1)} GWh </span>
                    </div>
                    < div className = "flex justify-between text-sm" >
                        <span className="text-muted-foreground" > Factor de capacidad </span>
                            < span className = "font-medium" > 17.1 % </span>
                                </div>
                                < div className = "flex justify-between text-sm" >
                                    <span className="text-muted-foreground" > Ratio DC / AC </span>
                                        < span className = "font-medium" > 1.25 </span>
                                            </div>
                                            < div className = "flex justify-between text-sm" >
                                                <span className="text-muted-foreground" > GCR(Ground Coverage) </span>
                                                    < span className = "font-medium" > 0.45 </span>
                                                        </div>
                                                        </CardContent>
                                                        </Card>

                                                        < Card >
                                                        <CardHeader>
                                                        <CardTitle>Validación </CardTitle>
                                                        </CardHeader>
                                                        < CardContent >
                                                        <div className="space-y-2" >
                                                            { polygonCount === 0 ? (
                                                                <p className= "text-sm text-amber-600" >
                ⚠️ No hay áreas definidas
    </p>
            ) : (
    <p className= "text-sm text-green-600" >
                ✓ { polygonCount } área(s) definida(s)
    </p>
            )}
{
    totalCapacity > 0 ? (
        <p className= "text-sm text-green-600" >
                ✓ Capacidad configurada
        </p>
            ) : (
        <p className= "text-sm text-amber-600" >
                ⚠️ Sin capacidad definida
        </p>
            )
}
</div>
    </CardContent>
    </Card>
    </div>
  );
}