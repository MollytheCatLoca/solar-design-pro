// src/components/design/DesignMapViewer.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import googleMapsLoader from '@/lib/utils/googleMapsLoader';

interface DesignMapViewerProps {
    polygons: any[];
    panelLayouts: any;
    config: any;
    projectLat?: number;
    projectLng?: number;
    height?: string;
    showControls?: boolean;
}

export default function DesignMapViewer({
    polygons,
    panelLayouts,
    config,
    projectLat,
    projectLng,
    height = '400px',
    showControls = true
}: DesignMapViewerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [showPanels, setShowPanels] = useState(true);
    const [mapType, setMapType] = useState<'satellite' | 'hybrid'>('hybrid');
    const renderedPolygonsRef = useRef<any[]>([]);
    const renderedPanelsRef = useRef<any[]>([]);

    // Inicializar mapa
    useEffect(() => {
        const loadAndInitMap = async () => {
            try {
                await googleMapsLoader.load();
                // Pequeño delay para asegurar que todo esté listo
                setTimeout(() => {
                    if (!mapInstanceRef.current) {
                        initMap();
                    }
                }, 100);
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        loadAndInitMap();

        return () => {
            // Limpiar al desmontar
            clearAllRendered();
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const initMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Calcular centro basado en polígonos o usar coordenadas del proyecto
        let center = { lat: projectLat || -34.6037, lng: projectLng || -58.3816 };
        let bounds = null;

        if (polygons && polygons.length > 0 && window.google) {
            bounds = new window.google.maps.LatLngBounds();
            polygons.forEach(polygon => {
                if (polygon.path) {
                    polygon.path.forEach((point: any) => {
                        bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
                    });
                }
            });
            center = {
                lat: bounds.getCenter().lat(),
                lng: bounds.getCenter().lng()
            };
        }

        const map = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: 18,
            mapTypeId: 'hybrid',
            tilt: 0,
            disableDefaultUI: !showControls,
            streetViewControl: false,
            fullscreenControl: showControls,
            zoomControl: showControls,
            mapTypeControl: false,
            clickableIcons: false,
            gestureHandling: showControls ? 'auto' : 'cooperative',
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Si hay bounds, ajustar vista
        if (bounds && !bounds.isEmpty()) {
            map.fitBounds(bounds);
            // Ajustar zoom para no estar demasiado cerca
            setTimeout(() => {
                const currentZoom = map.getZoom();
                if (currentZoom && currentZoom > 19) {
                    map.setZoom(19);
                }
            }, 100);
        }
    };

    // Renderizar polígonos y paneles cuando el mapa esté listo
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current || !window.google) return;

        clearAllRendered();
        renderPolygons();
        if (showPanels) {
            renderPanels();
        }
    }, [isMapReady, polygons, panelLayouts, showPanels]);

    const clearAllRendered = () => {
        // Limpiar polígonos
        renderedPolygonsRef.current.forEach(polygon => {
            if (polygon && polygon.setMap) {
                polygon.setMap(null);
            }
        });
        renderedPolygonsRef.current = [];

        // Limpiar paneles
        renderedPanelsRef.current.forEach(panel => {
            if (panel && panel.setMap) {
                panel.setMap(null);
            }
        });
        renderedPanelsRef.current = [];
    };

    const renderPolygons = () => {
        if (!mapInstanceRef.current || !polygons || !window.google || !window.google.maps) return;

        polygons.forEach(polygonData => {
            if (polygonData.path && polygonData.path.length >= 3) {
                try {
                    const polygon = new window.google.maps.Polygon({
                        paths: polygonData.path,
                        strokeColor: '#1d4ed8',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#2563eb',
                        fillOpacity: 0.2,
                        map: mapInstanceRef.current,
                        clickable: false,
                    });

                    renderedPolygonsRef.current.push(polygon);

                    // Agregar label con el nombre del segmento
                    if (polygonData.name && window.google.maps.Marker) {
                        const bounds = new window.google.maps.LatLngBounds();
                        polygonData.path.forEach((point: any) => {
                            bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
                        });

                        const labelMarker = new window.google.maps.Marker({
                            position: bounds.getCenter(),
                            map: mapInstanceRef.current,
                            label: {
                                text: polygonData.name,
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                            },
                            icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 0,
                            },
                        });

                        renderedPolygonsRef.current.push(labelMarker);
                    }
                } catch (error) {
                    console.error('Error rendering polygon:', error);
                }
            }
        });
    };

    const renderPanels = () => {
        if (!mapInstanceRef.current || !panelLayouts || !window.google || !window.google.maps) return;

        // panelLayouts es un objeto con claves de polygonId
        Object.entries(panelLayouts).forEach(([polygonId, layout]: [string, any]) => {
            if (layout && layout.panels && Array.isArray(layout.panels)) {
                layout.panels.forEach((panel: any, index: number) => {
                    if (panel.corners && panel.corners.length === 4) {
                        try {
                            const panelPolygon = new window.google.maps.Polygon({
                                paths: panel.corners,
                                strokeColor: '#1e40af',
                                strokeOpacity: 0.8,
                                strokeWeight: 0.5,
                                fillColor: '#3b82f6',
                                fillOpacity: 0.9,
                                map: mapInstanceRef.current,
                                clickable: false,
                                zIndex: 1000 + index
                            });

                            renderedPanelsRef.current.push(panelPolygon);
                        } catch (error) {
                            console.error('Error rendering panel:', error);
                        }
                    }
                });
            }
        });

        console.log(`Rendered ${renderedPanelsRef.current.length} panels`);
    };

    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            mapInstanceRef.current.setZoom(currentZoom + 1);
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            mapInstanceRef.current.setZoom(currentZoom - 1);
        }
    };

    const handleFullscreen = () => {
        if (mapRef.current) {
            if (mapRef.current.requestFullscreen) {
                mapRef.current.requestFullscreen();
            }
        }
    };

    const toggleMapType = () => {
        if (mapInstanceRef.current) {
            const newType = mapType === 'satellite' ? 'hybrid' : 'satellite';
            mapInstanceRef.current.setMapTypeId(newType);
            setMapType(newType);
        }
    };

    // Calcular estadísticas
    const totalPanels = Object.values(panelLayouts || {}).reduce((sum: number, layout: any) =>
        sum + (layout.totalPanels || 0), 0
    );
    const totalArea = polygons.reduce((sum: number, p: any) => sum + (p.area || 0), 0) / 10000;

    return (
        <div className= "relative" style = {{ height }
}>
    {/* Mapa */ }
    < div ref = { mapRef } className = "w-full h-full rounded-lg" />

        {/* Controles flotantes */ }
{
    showControls && (
        <>
        {/* Controles superiores */ }
        < div className = "absolute top-4 left-4 flex gap-2" >
            <Button
                            size="sm"
    variant = "secondary"
    onClick = {() => setShowPanels(!showPanels)
}
className = "shadow-lg"
    >
    { showPanels?<Eye className = "h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
Paneles
    </Button>
    < Button
size = "sm"
variant = "secondary"
onClick = { toggleMapType }
className = "shadow-lg"
    >
    { mapType === 'satellite' ? 'Híbrido' : 'Satélite'}
</Button>
    </div>

{/* Controles de zoom */ }
<div className="absolute top-4 right-4 flex flex-col gap-2" >
    <Button
                            size="icon"
variant = "secondary"
onClick = { handleZoomIn }
className = "shadow-lg h-8 w-8"
    >
    <ZoomIn className="h-4 w-4" />
        </Button>
        < Button
size = "icon"
variant = "secondary"
onClick = { handleZoomOut }
className = "shadow-lg h-8 w-8"
    >
    <ZoomOut className="h-4 w-4" />
        </Button>
        < Button
size = "icon"
variant = "secondary"
onClick = { handleFullscreen }
className = "shadow-lg h-8 w-8"
    >
    <Maximize2 className="h-4 w-4" />
        </Button>
        </div>

{/* Estadísticas */ }
<div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-3" >
    <div className="text-sm space-y-1" >
        <div className="flex items-center gap-2" >
            <div className="w-3 h-3 bg-blue-600 rounded-sm" > </div>
                < span className = "font-medium" > { totalPanels.toLocaleString() } paneles </span>
                    </div>
                    < div className = "flex items-center gap-2" >
                        <div className="w-3 h-3 bg-blue-600/30 border border-blue-600 rounded-sm" > </div>
                            < span className = "text-muted-foreground" > { totalArea.toFixed(2) } ha </span>
                                </div>
                                </div>
                                </div>
                                </>
            )}

{/* Loading indicator */ }
{
    !isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg" >
            <div className="text-center" >
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" > </div>
                    < p className = "text-sm text-muted-foreground" > Cargando mapa...</p>
                        </div>
                        </div>
            )
}
</div>
    );
}