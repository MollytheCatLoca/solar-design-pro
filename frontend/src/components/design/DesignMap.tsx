// src/components/design/DesignMap.tsx
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, MapPin, Square, Pentagon, MousePointer, Map as MapIcon, Globe, Eye, EyeOff } from 'lucide-react';
import { calculatePanelLayoutV3 } from '@/utils/panelLayoutV3';
interface DesignMapProps {
    polygons: any[];
    setPolygons: (polygons: any[]) => void;
    selectedModule: any;
    config: any;
    onSegmentSelect?: (segment: any) => void;
    panelLayouts?: Map<number, any>;
    setPanelLayouts?: (layouts: Map<number, any>) => void;
}

export default function DesignMap({
    polygons,
    setPolygons,
    selectedModule,
    config,
    onSegmentSelect,
    panelLayouts: propPanelLayouts,
    setPanelLayouts: propSetPanelLayouts
}: DesignMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const drawingModeRef = useRef<'polygon' | 'rectangle' | null>(null);
    const currentPointsRef = useRef<any[]>([]);
    const currentMarkersRef = useRef<any[]>([]);
    const currentPolylineRef = useRef<any>(null);
    const rectangleStartRef = useRef<any>(null);
    const previewRectangleRef = useRef<any>(null);
    const infoWindowRef = useRef<any>(null);

    const [drawingMode, setDrawingModeState] = useState<'polygon' | 'rectangle' | null>(null);
    const [selectedPolygon, setSelectedPolygon] = useState<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [is3D, setIs3D] = useState(false);
    const [showPanels, setShowPanels] = useState(true);
    const [showGuides, setShowGuides] = useState(false);
    const [panelLayouts, setPanelLayouts] = useState<Map<number, any>>(new Map());
    useEffect(() => {
        if (propSetPanelLayouts) {
            propSetPanelLayouts(panelLayouts);
        }
    }, [panelLayouts]);
    const [renderedPanels, setRenderedPanels] = useState<Map<number, any[]>>(new Map());
    // Función helper para limpiar paneles de un polígono
    // Función helper para limpiar paneles de un polígono
    const clearPanelsForPolygonId = (polygonId: number) => {
        setRenderedPanels(prevRendered => {
            const panels = prevRendered.get(polygonId);
            if (panels && panels.length > 0) {
                console.log(`Limpiando ${panels.length} paneles del polígono ${polygonId}`);
                panels.forEach(panel => {
                    if (panel && panel.setMap) {
                        panel.setMap(null);
                    }
                });
            }
            return prevRendered;
        });
    };
    const [renderedGuides, setRenderedGuides] = useState<Map<number, any[]>>(new Map());

    // Actualizar ref cuando cambia el estado
    useEffect(() => {
        drawingModeRef.current = drawingMode;
    }, [drawingMode]);

    // Cambiar entre 2D/3D
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setTilt(is3D ? 45 : 0);
            // En 3D no se puede dibujar
            if (is3D && drawingMode) {
                setDrawingMode(null);
            }
        }
    }, [is3D]);

    // Actualizar layout de paneles cuando cambia la configuración
    // Actualizar layout de paneles cuando cambia la configuración
    useEffect(() => {
        console.log('Config/Module changed - updating layouts');
        if (!isMapReady || !window.google) {
            console.log('Map not ready yet');
            return;
        }

        if (polygons.length > 0 && selectedModule) {
            console.log(`Updating layouts for ${polygons.length} polygons`);

            // Limpiar todos los paneles existentes
            renderedPanels.forEach((panels, polygonId) => {
                panels.forEach(panel => panel.setMap(null));
            });

            const newLayouts = new Map();
            const newRenderedPanels = new Map();

            polygons.forEach(polygon => {
                if (polygon.polygon) {
                    let path;
                    if (polygon.type === 'polygon') {
                        path = [];
                        polygon.polygon.getPath().forEach((point: any) => {
                            path.push(point);
                        });
                    } else {
                        const bounds = polygon.polygon.getBounds();
                        const ne = bounds.getNorthEast();
                        const sw = bounds.getSouthWest();
                        const se = new window.google.maps.LatLng(sw.lat(), ne.lng());
                        const nw = new window.google.maps.LatLng(ne.lat(), sw.lng());
                        path = [ne, se, sw, nw];
                    }

                    const layout = calculatePanelLayoutV3(
                        polygon.polygon,
                        path,
                        selectedModule,
                        config,
                        window.google
                    );

                    console.log(`Calculated layout for polygon ${polygon.id}: ${layout.totalPanels} panels`);
                    newLayouts.set(polygon.id, layout);

                    // Renderizar inmediatamente
                    if (layout.totalPanels > 0 && layout.panels) {
                        const panels: any[] = [];

                        layout.panels.forEach((panel: any, index: number) => {
                            if (panel.corners && panel.corners.length === 4) {
                                const rectangle = new window.google.maps.Polygon({
                                    paths: panel.corners,
                                    strokeColor: '#1e40af',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 0.5,
                                    fillColor: '#3b82f6',
                                    fillOpacity: 0.9,
                                    map: showPanels ? mapInstanceRef.current : null,
                                    clickable: false,
                                    zIndex: 1000 + index
                                });
                                panels.push(rectangle);
                            }
                        });

                        newRenderedPanels.set(polygon.id, panels);
                        console.log(`Rendered ${panels.length} panels for polygon ${polygon.id}`);
                    }
                }
            });

            setPanelLayouts(newLayouts);
            setRenderedPanels(newRenderedPanels);
        }
    }, [selectedModule, config, polygons.length, isMapReady]);

    // Mostrar/ocultar paneles
    useEffect(() => {
        renderedPanels.forEach((panels, polygonId) => {
            panels.forEach(panel => {
                panel.setMap(showPanels ? mapInstanceRef.current : null);
            });
        });
    }, [showPanels]);

    // Mostrar/ocultar guías
    useEffect(() => {
        renderedGuides.forEach((guides, polygonId) => {
            guides.forEach(guide => {
                guide.setMap(showGuides ? mapInstanceRef.current : null);
            });
        });
    }, [showGuides]);

    // Inicializar mapa
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, []);

    const initMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: -34.6037, lng: -58.3816 },
            zoom: 18,
            mapTypeId: 'satellite',
            tilt: 0,
            disableDefaultUI: false,
            clickableIcons: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: window.google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: ['satellite', 'hybrid', 'terrain'],
            },
            fullscreenControl: true,
            streetViewControl: false,
            rotateControl: true,
            scaleControl: true,
            zoomControl: true,
        });

        // Crear InfoWindow para mostrar área
        infoWindowRef.current = new window.google.maps.InfoWindow();

        // Listener principal para clicks en el mapa
        map.addListener('click', (e: any) => {
            handleMapClick(e.latLng);
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
        console.log('Mapa inicializado');
    };

    const handleMapClick = (latLng: any) => {
        const mode = drawingModeRef.current;

        if (mode === 'polygon') {
            addPolygonPoint(latLng);
        } else if (mode === 'rectangle') {
            handleRectangleClick(latLng);
        }
    };

    const addPolygonPoint = (latLng: any) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Crear marcador
        const marker = new window.google.maps.Marker({
            position: latLng,
            map: map,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
            },
        });

        currentPointsRef.current.push(latLng);
        currentMarkersRef.current.push(marker);

        // Si es el primer punto, agregar click listener para cerrar
        if (currentPointsRef.current.length === 1) {
            marker.addListener('click', () => {
                if (currentPointsRef.current.length >= 3) {
                    completePolygon();
                }
            });
        }

        // Actualizar línea de preview
        updatePolylinePreview();
    };

    const updatePolylinePreview = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Eliminar línea anterior
        if (currentPolylineRef.current) {
            currentPolylineRef.current.setMap(null);
        }

        // Crear nueva línea si hay al menos 2 puntos
        if (currentPointsRef.current.length >= 2) {
            currentPolylineRef.current = new window.google.maps.Polyline({
                path: currentPointsRef.current,
                strokeColor: '#2563eb',
                strokeOpacity: 1,
                strokeWeight: 3,
                map: map,
            });
        }
    };



    // Calcular número de paneles que caben
    const calculatePanelFit = (areaM2: number) => {
        if (!selectedModule || !config.maxSize) return null;

        // Área útil considerando setback y pasillos
        const setbackM = (parseFloat(config.setback) || 40) * 0.3048; // convertir ft a m
        const usableAreaFactor = 0.7; // 70% del área es utilizable
        const usableArea = areaM2 * usableAreaFactor;

        // Calcular basado en capacidad máxima
        const maxCapacityKW = parseFloat(config.maxSize) || 1600;
        const panelPowerKW = selectedModule.power / 1000;
        const panelsByCapacity = Math.floor(maxCapacityKW / panelPowerKW);

        // Calcular basado en área disponible
        const panelArea = selectedModule.width * selectedModule.height;
        const gcr = parseFloat(calculateGCR()) || 0.4;
        const panelsByArea = Math.floor((usableArea * gcr) / panelArea);

        // Tomar el menor entre capacidad y área
        const actualPanels = Math.min(panelsByCapacity, panelsByArea);

        return {
            byCapacity: panelsByCapacity,
            byArea: panelsByArea,
            actual: actualPanels,
            actualCapacityKW: actualPanels * panelPowerKW,
        };
    };

    const calculateGCR = () => {
        if (!selectedModule || !config.rowSpacing) return '0.40';
        const panelLength = config.orientation === 'Landscape'
            ? selectedModule.width
            : selectedModule.height;
        const tiltRad = ((config.tilt || 25) * Math.PI) / 180;
        const rowPitch = panelLength * Math.cos(tiltRad) + (parseFloat(config.rowSpacing) || 15) * 0.3048;
        return (panelLength * Math.cos(tiltRad) / rowPitch).toFixed(2);
    };

    const completePolygon = () => {
        const map = mapInstanceRef.current;
        if (!map || currentPointsRef.current.length < 3) return;

        // Crear polígono
        const polygon = new window.google.maps.Polygon({
            paths: currentPointsRef.current,
            strokeColor: '#1d4ed8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.35,
            editable: true,
            draggable: true,
            map: map,
        });

        // Calcular área
        let area = 0;
        if (window.google.maps.geometry) {
            area = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
        }

        const newPolygon = {
            id: Date.now(),
            name: `Field Segment ${polygons.length + 1}`,
            type: 'polygon',
            area,
            polygon,
            capacity: calculateCapacity(area),
            path: currentPointsRef.current.map(p => ({ lat: p.lat(), lng: p.lng() })),
            originalData: null // Agregamos esto

        };

        // Calcular layout de paneles
        if (selectedModule && config) {
            console.log('Calculating panel layout for new polygon');
            const layout = calculatePanelLayoutV3(
                polygon,
                currentPointsRef.current,
                selectedModule,
                config,
                window.google
            );

            panelLayouts.set(newPolygon.id, layout);
            if (layout.totalPanels > 0) {
                renderPanelsForPolygon(newPolygon.id, layout);
            }
        }

        // Mostrar InfoWindow con área y capacidad
        const panelInfo = calculatePanelFit(area);
        const center = getPolygonCenter(polygon);

        let content = `
      <div style="padding: 8px;">
        <strong>${newPolygon.name}</strong><br/>
        <strong>Área:</strong> ${(area / 10000).toFixed(2)} ha (${area.toFixed(0)} m²)<br/>
    `;

        if (panelInfo && selectedModule) {
            const layout = panelLayouts.get(newPolygon.id);
            if (layout) {
                content += `
          <strong>Módulos:</strong> ${layout.totalPanels.toLocaleString()} (${layout.actualCapacityKW.toFixed(0)} kWp)<br/>
          <strong>Filas:</strong> ${layout.rows}<br/>
        `;
            }
        }

        content += '</div>';

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.setPosition(center);
        infoWindowRef.current.open(map);

        // Cerrar InfoWindow después de 5 segundos
        setTimeout(() => {
            infoWindowRef.current.close();
        }, 5000);

        // Agregar listeners
        polygon.addListener('click', () => {
            setSelectedPolygon(newPolygon);
            onSegmentSelect?.(newPolygon);
        });

        // Listener para actualizar cuando se edite
        ['set_at', 'insert_at', 'remove_at'].forEach(event => {
            polygon.getPath().addListener(event, () => {
                console.log('Polígono editado - recalculando layout');

                // Actualizar área primero
                const newArea = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
                const newCapacity = calculateCapacity(newArea);

                // Actualizar el polígono en el estado manteniendo todas sus propiedades
                setPolygons(prevPolygons => {
                    return prevPolygons.map(p => {
                        if (p.id === newPolygon.id) {
                            return {
                                ...p,
                                area: newArea,
                                capacity: newCapacity,
                                path: []
                            };
                        }
                        return p;
                    });
                });

                // Recalcular layout cuando se edita el polígono
                if (selectedModule && config && window.google) {
                    setTimeout(() => {
                        const updatedPath = [];
                        polygon.getPath().forEach((point: any) => {
                            updatedPath.push(point);
                        });

                        const layout = calculatePanelLayoutV3(
                            polygon,
                            updatedPath,
                            selectedModule,
                            config,
                            window.google
                        );

                        console.log(`Nuevo layout calculado: ${layout.totalPanels} paneles`);

                        // Actualizar layouts
                        setPanelLayouts(prevLayouts => {
                            const newLayouts = new Map(prevLayouts);
                            newLayouts.set(newPolygon.id, layout);
                            return newLayouts;
                        });

                        // Limpiar paneles anteriores
                        // Limpiar TODOS los paneles anteriores de este polígono
                        clearPanelsForPolygonId(newPolygon.id);


                        // Re-renderizar si hay paneles
                        if (layout.totalPanels > 0 && layout.panels) {
                            const newPanels: any[] = [];

                            layout.panels.forEach((panel: any, index: number) => {
                                if (panel.corners && panel.corners.length === 4) {
                                    const rectangle = new window.google.maps.Polygon({
                                        paths: panel.corners,
                                        strokeColor: '#1e40af',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 0.5,
                                        fillColor: '#3b82f6',
                                        fillOpacity: 0.9,
                                        map: showPanels ? mapInstanceRef.current : null,
                                        clickable: false,
                                        zIndex: 1000 + index
                                    });
                                    newPanels.push(rectangle);
                                }
                            });

                            setRenderedPanels(prevRendered => {
                                const newRendered = new Map(prevRendered);
                                newRendered.set(newPolygon.id, newPanels);
                                return newRendered;
                            });

                            console.log(`Renderizados ${newPanels.length} paneles después de edición`);
                        }
                    }, 100);
                }
            });
        });


        // Limpiar
        clearDrawing();

        // Agregar a la lista
        setPolygons([...polygons, newPolygon]);
    };

    const getPolygonCenter = (polygon: any) => {
        const bounds = new window.google.maps.LatLngBounds();
        polygon.getPath().forEach((point: any) => {
            bounds.extend(point);
        });
        return bounds.getCenter();
    };

    const updatePolygonArea = (polygonData: any) => {
        const newArea = window.google.maps.geometry.spherical.computeArea(polygonData.polygon.getPath());
        const newCapacity = calculateCapacity(newArea);

        // Actualizar el polígono en la lista
        const updatedPolygons = polygons.map(p =>
            p.id === polygonData.id
                ? { ...p, area: newArea, capacity: newCapacity }
                : p
        );

        setPolygons(updatedPolygons);

        // Si este es el polígono seleccionado, actualizar la selección
        if (selectedPolygon?.id === polygonData.id) {
            setSelectedPolygon({ ...polygonData, area: newArea, capacity: newCapacity });
        }
    };

    const handleRectangleClick = (latLng: any) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (!rectangleStartRef.current) {
            // Primer click
            rectangleStartRef.current = latLng;

            previewRectangleRef.current = new window.google.maps.Rectangle({
                bounds: new window.google.maps.LatLngBounds(latLng, latLng),
                strokeColor: '#2563eb',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#2563eb',
                fillOpacity: 0.2,
                map: map,
            });

            const mouseMoveListener = map.addListener('mousemove', (e: any) => {
                if (previewRectangleRef.current && rectangleStartRef.current) {
                    const bounds = new window.google.maps.LatLngBounds(
                        rectangleStartRef.current,
                        e.latLng
                    );
                    previewRectangleRef.current.setBounds(bounds);
                }
            });

            previewRectangleRef.current.mouseMoveListener = mouseMoveListener;

        } else {
            // Segundo click - completar
            const bounds = new window.google.maps.LatLngBounds(
                rectangleStartRef.current,
                latLng
            );

            if (previewRectangleRef.current?.mouseMoveListener) {
                window.google.maps.event.removeListener(previewRectangleRef.current.mouseMoveListener);
            }

            if (previewRectangleRef.current) {
                previewRectangleRef.current.setMap(null);
            }

            const rectangle = new window.google.maps.Rectangle({
                bounds: bounds,
                strokeColor: '#1d4ed8',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#2563eb',
                fillOpacity: 0.35,
                editable: true,
                draggable: true,
                map: map,
            });

            // Calcular área
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const se = new window.google.maps.LatLng(sw.lat(), ne.lng());
            const nw = new window.google.maps.LatLng(ne.lat(), sw.lng());
            const area = window.google.maps.geometry.spherical.computeArea([ne, se, sw, nw]);

            const newPolygon = {
                id: Date.now(),
                name: `Field Segment ${polygons.length + 1}`,
                type: 'rectangle',
                area,
                polygon: rectangle,
                capacity: calculateCapacity(area),
                bounds: bounds,
                path: [ne, se, sw, nw],
                originalData: null // Agregamos esto
            };

            // Calcular layout de paneles para rectángulo
            if (selectedModule && config) {
                console.log('Calculating panel layout for new rectangle');
                const path = [ne, se, sw, nw];
                const layout = calculatePanelLayoutV3(
                    rectangle,
                    path,
                    selectedModule,
                    config,
                    window.google
                );

                panelLayouts.set(newPolygon.id, layout);
                if (layout.totalPanels > 0) {
                    renderPanelsForPolygon(newPolygon.id, layout);
                }
            }

            // Mostrar InfoWindow
            const panelInfo = calculatePanelFit(area);
            let content = `
        <div style="padding: 8px;">
          <strong>${newPolygon.name}</strong><br/>
          <strong>Área:</strong> ${(area / 10000).toFixed(2)} ha (${area.toFixed(0)} m²)<br/>
      `;

            if (selectedModule) {
                const layout = panelLayouts.get(newPolygon.id);
                if (layout) {
                    content += `
            <strong>Módulos:</strong> ${layout.totalPanels.toLocaleString()} (${layout.actualCapacityKW.toFixed(0)} kWp)<br/>
            <strong>Filas:</strong> ${layout.rows}<br/>
          `;
                }
            }

            content += '</div>';

            infoWindowRef.current.setContent(content);
            infoWindowRef.current.setPosition(bounds.getCenter());
            infoWindowRef.current.open(map);

            setTimeout(() => {
                infoWindowRef.current.close();
            }, 5000);

            rectangle.addListener('click', () => {
                setSelectedPolygon(newPolygon);
                onSegmentSelect?.(newPolygon);
            });

            rectangle.addListener('bounds_changed', () => {
                console.log('Rectángulo editado - recalculando layout');

                // Calcular nueva área
                const bounds = rectangle.getBounds();
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                const se = new window.google.maps.LatLng(sw.lat(), ne.lng());
                const nw = new window.google.maps.LatLng(ne.lat(), sw.lng());
                const newArea = window.google.maps.geometry.spherical.computeArea([ne, se, sw, nw]);
                const newCapacity = calculateCapacity(newArea);

                // Actualizar el rectángulo en el estado manteniendo todas sus propiedades
                setPolygons(prevPolygons => {
                    return prevPolygons.map(p => {
                        if (p.id === newPolygon.id) {
                            return {
                                ...p,
                                area: newArea,
                                capacity: newCapacity,
                                bounds: bounds
                            };
                        }
                        return p;
                    });
                });

                // Recalcular layout cuando se edita el rectángulo
                if (selectedModule && config && window.google) {
                    setTimeout(() => {
                        const path = [ne, se, sw, nw];

                        const layout = calculatePanelLayoutV3(
                            rectangle,
                            path,
                            selectedModule,
                            config,
                            window.google
                        );

                        console.log(`Nuevo layout calculado: ${layout.totalPanels} paneles`);

                        // Actualizar layouts
                        setPanelLayouts(prevLayouts => {
                            const newLayouts = new Map(prevLayouts);
                            newLayouts.set(newPolygon.id, layout);
                            return newLayouts;
                        });

                        // Limpiar paneles anteriores
                        // Limpiar TODOS los paneles anteriores de este rectángulo
                        clearPanelsForPolygonId(newPolygon.id);


                        // Re-renderizar si hay paneles
                        if (layout.totalPanels > 0 && layout.panels) {
                            const newPanels: any[] = [];

                            layout.panels.forEach((panel: any, index: number) => {
                                if (panel.corners && panel.corners.length === 4) {
                                    const panelRect = new window.google.maps.Polygon({
                                        paths: panel.corners,
                                        strokeColor: '#1e40af',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 0.5,
                                        fillColor: '#3b82f6',
                                        fillOpacity: 0.9,
                                        map: showPanels ? mapInstanceRef.current : null,
                                        clickable: false,
                                        zIndex: 1000 + index
                                    });
                                    newPanels.push(panelRect);
                                }
                            });

                            setRenderedPanels(prevRendered => {
                                const newRendered = new Map(prevRendered);
                                newRendered.set(newPolygon.id, newPanels);
                                return newRendered;
                            });

                            console.log(`Renderizados ${newPanels.length} paneles después de edición`);
                        }
                    }, 100);
                }
            });
            rectangleStartRef.current = null;
            previewRectangleRef.current = null;

            setPolygons([...polygons, newPolygon]);

            // Renderizar paneles inmediatamente después de agregar el polígono
            setTimeout(() => {
                if (selectedModule && config) {
                    console.log('Post-creation panel layout for rectangle');
                    const layout = calculatePanelLayoutV3(
                        rectangle,
                        [ne, se, sw, nw],
                        selectedModule,
                        config,
                        window.google
                    );

                    panelLayouts.set(newPolygon.id, layout);
                    if (layout.totalPanels > 0) {
                        renderPanelsForPolygon(newPolygon.id, layout);
                    }
                }
            }, 100);
        }
    };

    const updateRectangleArea = (polygonData: any) => {
        const bounds = polygonData.polygon.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const se = new window.google.maps.LatLng(sw.lat(), ne.lng());
        const nw = new window.google.maps.LatLng(ne.lat(), sw.lng());
        const newArea = window.google.maps.geometry.spherical.computeArea([ne, se, sw, nw]);
        const newCapacity = calculateCapacity(newArea);

        // Actualizar el polígono en la lista
        const updatedPolygons = polygons.map(p =>
            p.id === polygonData.id
                ? { ...p, area: newArea, capacity: newCapacity }
                : p
        );

        setPolygons(updatedPolygons);

        // Si este es el polígono seleccionado, actualizar la selección
        if (selectedPolygon?.id === polygonData.id) {
            setSelectedPolygon({ ...polygonData, area: newArea, capacity: newCapacity });
        }
    };

    const calculateCapacity = (areaM2: number) => {
        const hectares = areaM2 / 10000;
        return hectares * 2.5;
    };

    const clearDrawing = () => {
        currentMarkersRef.current.forEach(marker => marker.setMap(null));
        currentMarkersRef.current = [];

        if (currentPolylineRef.current) {
            currentPolylineRef.current.setMap(null);
            currentPolylineRef.current = null;
        }

        currentPointsRef.current = [];

        if (previewRectangleRef.current) {
            previewRectangleRef.current.setMap(null);
            previewRectangleRef.current = null;
        }
        rectangleStartRef.current = null;
    };

    const setDrawingMode = (mode: 'polygon' | 'rectangle' | null) => {
        clearDrawing();
        setDrawingModeState(mode);
        drawingModeRef.current = mode;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setOptions({
                draggableCursor: mode ? 'crosshair' : null,
            });
        }
    };

    const deletePolygon = (polygonId: number) => {
        const polygonToDelete = polygons.find(p => p.id === polygonId);
        if (polygonToDelete?.polygon) {
            polygonToDelete.polygon.setMap(null);
        }
        // Limpiar paneles renderizados
        clearPanelsForPolygon(polygonId);
        panelLayouts.delete(polygonId);

        setPolygons(polygons.filter(p => p.id !== polygonId));
        if (selectedPolygon?.id === polygonId) {
            setSelectedPolygon(null);
        }
    };

    // Renderizar paneles para un polígono
    const renderPanelsForPolygon = (polygonId: number, layout: any) => {
        console.log(`Rendering ${layout.totalPanels} panels for polygon ${polygonId}`);

        if (!mapInstanceRef.current || !layout || layout.panels.length === 0) {
            console.log('Cannot render: missing map or no panels');
            return;
        }

        const panels: any[] = [];
        const guides: any[] = [];

        // Renderizar paneles
        layout.panels.forEach((panel: any, index: number) => {
            const rectangle = new window.google.maps.Polygon({
                paths: panel.corners,
                strokeColor: '#1e40af',
                strokeOpacity: 0.8,
                strokeWeight: 0.5,
                fillColor: '#3b82f6',
                fillOpacity: 0.9,
                map: showPanels ? mapInstanceRef.current : null,
                clickable: false,
                zIndex: 1000 + index
            });

            panels.push(rectangle);
        });

        // Agregar indicador de orientación (flecha hacia donde miran los paneles)
        if (showGuides && layout.panels.length > 0 && config.azimuth !== undefined) {
            const firstPanel = layout.panels[0];
            const azimuthRad = (config.azimuth * Math.PI) / 180;

            // Crear una flecha que apunte en la dirección del azimut
            const arrowLength = 20; // metros
            const arrowEnd = {
                lat: firstPanel.center.lat + (Math.cos(azimuthRad) * arrowLength / 111319.5),
                lng: firstPanel.center.lng + (Math.sin(azimuthRad) * arrowLength / (111319.5 * Math.cos(firstPanel.center.lat * Math.PI / 180)))
            };

            const arrow = new window.google.maps.Polyline({
                path: [firstPanel.center, arrowEnd],
                strokeColor: '#ef4444',
                strokeOpacity: 1,
                strokeWeight: 3,
                map: showGuides ? mapInstanceRef.current : null,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 3,
                        strokeColor: '#ef4444',
                        strokeWeight: 2,
                        fillColor: '#ef4444',
                        fillOpacity: 1
                    },
                    offset: '100%'
                }],
                zIndex: 2000
            });

            guides.push(arrow);

            // Agregar texto indicando la dirección
            const infoWindow = new google.maps.InfoWindow({
                content: `Azimut: ${config.azimuth}° (${getCardinalDirection(config.azimuth)})`,
                position: arrowEnd,
                disableAutoPan: true
            });

            if (showGuides) {
                infoWindow.open(mapInstanceRef.current);
                // Guardar referencia para poder cerrarla después
                setTimeout(() => infoWindow.close(), 5000);
            }
        }

        // Renderizar líneas guía de filas (opcional)
        if (showGuides && layout.frames && layout.frames.length > 0) {
            // Agrupar frames por fila
            const rowMap = new Map();
            layout.frames.forEach((frame: any) => {
                const rowIndex = frame.panels[0]?.rowIndex || 0;
                if (!rowMap.has(rowIndex)) {
                    rowMap.set(rowIndex, []);
                }
                rowMap.get(rowIndex).push(frame);
            });

            // Dibujar línea guía para cada fila
            rowMap.forEach((frames, rowIndex) => {
                if (frames.length > 0) {
                    // Encontrar los extremos de la fila
                    let minLng = Infinity;
                    let maxLng = -Infinity;
                    let avgLat = 0;
                    let count = 0;

                    frames.forEach((frame: any) => {
                        frame.panels.forEach((panel: any) => {
                            minLng = Math.min(minLng, panel.center.lng);
                            maxLng = Math.max(maxLng, panel.center.lng);
                            avgLat += panel.center.lat;
                            count++;
                        });
                    });

                    if (count > 0) {
                        avgLat /= count;

                        // Extender la línea un poco más allá de los paneles
                        const extension = 0.0001; // grados

                        const line = new window.google.maps.Polyline({
                            path: [
                                { lat: avgLat, lng: minLng - extension },
                                { lat: avgLat, lng: maxLng + extension }
                            ],
                            strokeColor: '#ef4444',
                            strokeOpacity: 0.5,
                            strokeWeight: 1,
                            map: showGuides ? mapInstanceRef.current : null,
                            clickable: false,
                            zIndex: 900
                        });

                        guides.push(line);
                    }
                }
            });
        }

        renderedPanels.set(polygonId, panels);
        renderedGuides.set(polygonId, guides);
        console.log(`Rendered ${panels.length} panel rectangles`);
    };

    // Limpiar paneles de un polígono
    const clearPanelsForPolygon = (polygonId: number) => {
        const panels = renderedPanels.get(polygonId);
        if (panels) {
            panels.forEach(panel => panel.setMap(null));
            renderedPanels.delete(polygonId);
        }

        const guides = renderedGuides.get(polygonId);
        if (guides) {
            guides.forEach(guide => guide.setMap(null));
            renderedGuides.delete(polygonId);
        }
    };

    // Actualizar layout de todos los polígonos


    const centerOnPolygon = (polygon: any) => {
        const map = mapInstanceRef.current;
        if (!map || !polygon.polygon) return;

        if (polygon.type === 'rectangle') {
            map.fitBounds(polygon.polygon.getBounds());
        } else {
            const bounds = new window.google.maps.LatLngBounds();
            polygon.polygon.getPath().forEach((latLng: any) => {
                bounds.extend(latLng);
            });
            map.fitBounds(bounds);
        }
        map.setZoom(19);
    };

    // Obtener dirección cardinal del azimut
    const getCardinalDirection = (azimuth: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        const index = Math.round(((azimuth % 360) / 45)) % 8;
        return directions[index];
    };

    return (
        <div className= "space-y-4" >
        {/* Barra de herramientas */ }
        < Card >
        <CardContent className="p-3" >
            <div className="flex items-center gap-4" >
                <div className="flex items-center gap-2" >
                    <Button
                variant={ drawingMode === null ? 'default' : 'outline' }
    size = "sm"
    onClick = {() => setDrawingMode(null)
}
disabled = {!isMapReady || is3D}
              >
    <MousePointer className="w-4 h-4 mr-2" />
        Seleccionar
        </Button>
        < Button
variant = { drawingMode === 'polygon' ? 'default' : 'outline'}
size = "sm"
onClick = {() => setDrawingMode('polygon')}
disabled = {!isMapReady || is3D}
              >
    <Pentagon className="w-4 h-4 mr-2" />
        Polígono
        </Button>
        < Button
variant = { drawingMode === 'rectangle' ? 'default' : 'outline'}
size = "sm"
onClick = {() => setDrawingMode('rectangle')}
disabled = {!isMapReady || is3D}
              >
    <Square className="w-4 h-4 mr-2" />
        Rectángulo
        </Button>
        </div>

        < div className = "h-6 w-px bg-gray-300" />

            {/* Switch 2D/3D */ }
            < div className = "flex items-center gap-2" >
                <MapIcon className="w-4 h-4 text-gray-600" />
                    <Label htmlFor="3d-mode" className = "text-sm" > 2D </Label>
                        < Switch
id = "3d-mode"
checked = { is3D }
onCheckedChange = { setIs3D }
disabled = {!isMapReady}
              />
    < Label htmlFor = "3d-mode" className = "text-sm" > 3D </Label>
        < Globe className = "w-4 h-4 text-gray-600" />
            </div>

            < div className = "h-6 w-px bg-gray-300" />

                {/* Toggle paneles */ }
                < div className = "flex items-center gap-2" >
                    <Button
                variant="outline"
size = "sm"
onClick = {() => setShowPanels(!showPanels)}
className = "flex items-center gap-2"
    >
    { showPanels?<Eye className = "w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
{ showPanels ? 'Ocultar' : 'Mostrar' } Paneles
    </Button>
{
    showPanels && (
        <Button
                  variant="outline"
    size = "sm"
    onClick = {() => setShowGuides(!showGuides)
}
className = "flex items-center gap-2"
    >
    { showGuides?<Eye className = "w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
Guías
    </Button>
              )}
</div>

{
    drawingMode && (
        <>
        <div className="h-6 w-px bg-gray-300" />
            <Button
                  variant="ghost"
    size = "sm"
    onClick = {() => setDrawingMode(null)
}
className = "text-red-600"
    >
    Cancelar
    </Button>
{
    drawingMode === 'polygon' && currentPointsRef.current.length >= 3 && (
        <Button
                    variant="default"
    size = "sm"
    onClick = { completePolygon }
        >
        Cerrar Polígono
            </Button>
                )
}
</>
            )}

<div className="ml-auto text-sm text-muted-foreground" >
    {!isMapReady && "Cargando mapa..."}
{ isMapReady && is3D && "Modo 3D activo - Dibujo deshabilitado" }
{ isMapReady && !is3D && drawingMode === 'polygon' && "Clic para puntos. Clic en el primer punto para cerrar." }
{ isMapReady && !is3D && drawingMode === 'rectangle' && "Clic y arrastrar para crear rectángulo." }
{ isMapReady && !is3D && !drawingMode && "Selecciona una herramienta para dibujar." }
</div>
    </div>
    </CardContent>
    </Card>

    < div className = "grid grid-cols-3 gap-4 h-[600px]" >
        {/* Mapa */ }
        < div className = "col-span-2" >
            <Card className="h-full" >
                <CardContent className="p-0 h-full" >
                    <div ref={ mapRef } className = "w-full h-full rounded-lg" />
                        </CardContent>
                        </Card>
                        </div>

{/* Lista de segmentos */ }
<div className="col-span-1" >
    <Card className="h-full overflow-hidden" >
        <CardHeader className="pb-3" >
            <CardTitle className="text-lg" > Field Segments </CardTitle>
                </CardHeader>
                < CardContent className = "overflow-y-auto max-h-[520px]" >
                    <div className="space-y-2" >
                        {
                            polygons.length === 0 ? (
                                <p className= "text-sm text-muted-foreground text-center py-8" >
                                Dibuja polígonos en el mapa para definir las áreas de instalación
                                </ p >
                ) : (
    polygons.map((polygon) => {
        const layout = panelLayouts.get(polygon.id);
        const panelInfo = selectedModule ? calculatePanelFit(polygon.area) : null;

        return (
            <div
                        key= { polygon.id }
        className = {`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPolygon?.id === polygon.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
            }`
    }
                        onClick = {() => {
        setSelectedPolygon(polygon);
                          onSegmentSelect?.(polygon);
                        }}
                      >
    <div className="flex justify-between items-start mb-2" >
        <h4 className="font-medium" > { polygon.name } </h4>
            < div className = "flex gap-1" >
                <Button
                              size="icon"
variant = "ghost"
className = "h-6 w-6"
onClick = {(e) => {
    e.stopPropagation();
    centerOnPolygon(polygon);
}}
                            >
    <MapPin className="h-3 w-3" />
        </Button>
        < Button
size = "icon"
variant = "ghost"
className = "h-6 w-6"
onClick = {(e) => {
    e.stopPropagation();
    deletePolygon(polygon.id);
}}
                            >
    <Trash2 className="h-3 w-3" />
        </Button>
        </div>
        </div>
        < div className = "text-sm text-gray-600 space-y-1" >
            <div>Área: { (polygon.area / 10000).toFixed(2) } ha </div>
{
    layout && selectedModule && (
        <>
        <div>
        Módulos: { layout.totalPanels.toLocaleString() }
    </div>
        <div>
    Capacidad: { layout.actualCapacityKW.toFixed(0) } kWp
        </div>
        <div>
    Filas: { layout.rows }
    </div>
    {
        layout.totalPanels < panelInfo?.byArea && (
            <Badge variant="secondary" className = "text-xs" >
                Limitado por capacidad
                    </Badge>
                              )
    }
    </>
                          )
}
</div>
    </div>
                    );
                  })
                )}
</div>

{
    polygons.length > 0 && (
        <div className="mt-4 pt-4 border-t" >
            <div className="text-sm space-y-1" >
                <div className="flex justify-between" >
                    <span>Total segmentos: </span>
                        < span className = "font-medium" > { polygons.length } </span>
                            </div>
                            < div className = "flex justify-between" >
                                <span>Área total: </span>
                                    < span className = "font-medium" >
                                        {(polygons.reduce((sum, p) => sum + p.area, 0) / 10000).toFixed(2)
} ha
    </span>
    </div>
{
    selectedModule && config.maxSize && (
        <>
        <div className="flex justify-between" >
            <span>Módulos totales: </span>
                < span className = "font-medium" >
                    { Array.from(panelLayouts.values()).reduce((sum, layout) => sum + layout.totalPanels, 0).toLocaleString() }
                    </span>
                    </div>
                    < div className = "flex justify-between" >
                        <span>Capacidad total: </span>
                            < span className = "font-medium" >
                                { Array.from(panelLayouts.values()).reduce((sum, layout) => sum + layout.actualCapacityKW, 0).toFixed(0) } kWp
                                    </span>
                                    </div>
                                    </>
                    )
}
</div>
    </div>
              )}
</CardContent>
    </Card>
    </div>
    </div>
    </div>
  );
}