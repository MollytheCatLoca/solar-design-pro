// src/components/design/DesignMap.tsx

'use client';

const React = require('react');
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Square,
    Trash2,
    Move,
    ZoomIn,
    ZoomOut,
    Maximize2,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignMapProps {
    projectId: number;
    polygons: any[];
    onPolygonsChange: (polygons: any[]) => void;
}

export default function DesignMap({ projectId, polygons, onPolygonsChange }: DesignMapProps) {
    const [drawMode, setDrawMode] = React.useState<'select' | 'draw'>('select');
    const [selectedPolygon, setSelectedPolygon] = React.useState<number | null>(null);

    // Por ahora usamos coordenadas de ejemplo (Buenos Aires)
    const defaultLat = -34.6037;
    const defaultLng = -58.3816;

    // Simulación de agregar polígono
    const handleAddPolygon = () => {
        const newPolygon = {
            id: Date.now(),
            name: `Segmento ${polygons.length + 1}`,
            area: 10000 + Math.random() * 50000, // m²
            capacity: 1 + Math.random() * 2, // MW
            coordinates: [
                { lat: defaultLat + Math.random() * 0.001, lng: defaultLng + Math.random() * 0.001 },
                { lat: defaultLat + Math.random() * 0.001, lng: defaultLng + Math.random() * 0.001 },
                { lat: defaultLat + Math.random() * 0.001, lng: defaultLng + Math.random() * 0.001 },
                { lat: defaultLat + Math.random() * 0.001, lng: defaultLng + Math.random() * 0.001 },
            ],
        };
        onPolygonsChange([...polygons, newPolygon]);
    };

    const handleDeletePolygon = (id: number) => {
        onPolygonsChange(polygons.filter(p => p.id !== id));
        setSelectedPolygon(null);
    };

    return (
        <div className= "relative h-full" >
        {/* Map Container */ }
        < div className = "absolute inset-0 bg-gray-200" >
            <iframe
          src={ `https://maps.google.com/maps?q=${defaultLat},${defaultLng}&t=k&z=17&ie=UTF8&iwloc=&output=embed` }
    className = "w-full h-full"
    style = {{ border: 0 }
}
allowFullScreen
loading = "lazy"
referrerPolicy = "no-referrer-when-downgrade"
title = "Design Map"
    />
    </div>

{/* Drawing Tools */ }
<div className="absolute top-4 left-4 z-10" >
    <Card className="p-2" >
        <div className="flex gap-1" >
            <Button
              size="sm"
variant = { drawMode === 'select' ? 'default' : 'ghost'}
onClick = {() => setDrawMode('select')}
title = "Seleccionar"
    >
    <Move className="h-4 w-4" />
        </Button>
        < Button
size = "sm"
variant = { drawMode === 'draw' ? 'default' : 'ghost'}
onClick = {() => {
    setDrawMode('draw');
    handleAddPolygon();
}}
title = "Dibujar área"
    >
    <Square className="h-4 w-4" />
        </Button>
        < Button
size = "sm"
variant = "ghost"
onClick = {() => selectedPolygon && handleDeletePolygon(selectedPolygon)}
disabled = {!selectedPolygon}
title = "Eliminar"
    >
    <Trash2 className="h-4 w-4" />
        </Button>
        </div>
        </Card>
        </div>

{/* Zoom Controls */ }
<div className="absolute top-4 right-4 z-10" >
    <Card className="p-2" >
        <div className="flex flex-col gap-1" >
            <Button size="sm" variant = "ghost" title = "Acercar" >
                <ZoomIn className="h-4 w-4" />
                    </Button>
                    < Button size = "sm" variant = "ghost" title = "Alejar" >
                        <ZoomOut className="h-4 w-4" />
                            </Button>
                            < Button size = "sm" variant = "ghost" title = "Pantalla completa" >
                                <Maximize2 className="h-4 w-4" />
                                    </Button>
                                    </div>
                                    </Card>
                                    </div>

{/* Polygon List */ }
<div className="absolute bottom-4 left-4 z-10 max-w-sm" >
    <Card className="p-4" >
        <h3 className="font-semibold mb-2" > Áreas de instalación </h3>
{
    polygons.length === 0 ? (
        <p className= "text-sm text-muted-foreground" >
        Haz clic en el botón de dibujar para crear un área
            </p>
          ) : (
        <div className= "space-y-2" >
        {
            polygons.map((polygon) => (
                <div
                  key= { polygon.id }
                  className = {
                    cn(
                    "p-2 rounded-md border cursor-pointer transition-colors",
                        selectedPolygon === polygon.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
            )
        }
    onClick = {() => setSelectedPolygon(polygon.id)
}
                >
    <div className="flex items-center justify-between" >
        <span className="font-medium text-sm" > { polygon.name } </span>
            < Button
size = "sm"
variant = "ghost"
onClick = {(e) => {
    e.stopPropagation();
    handleDeletePolygon(polygon.id);
}}
                    >
    <Trash2 className="h-3 w-3" />
        </Button>
        </div>
        < div className = "text-xs text-muted-foreground mt-1" >
            {(polygon.area / 10000).toFixed(2)} ha • { polygon.capacity.toFixed(2) } MW
                </div>
                </div>
              ))}
</div>
          )}
</Card>
    </div>

{/* Instructions */ }
<div className="absolute top-20 left-4 z-10" >
    <Card className="p-3 max-w-xs" >
        <p className="text-sm text-muted-foreground" >
            <MapPin className="inline h-4 w-4 mr-1" />
                Usa las herramientas para dibujar las áreas donde se instalarán los paneles solares
                    </p>
                    </Card>
                    </div>
                    </div>
  );
}