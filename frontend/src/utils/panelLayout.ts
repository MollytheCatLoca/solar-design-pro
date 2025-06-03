// src/utils/panelLayout.ts

interface Panel {
    id: string;
    center: { lat: number; lng: number };
    corners: { lat: number; lng: number }[];
    rotation: number;
    frameId: string;
    rowIndex: number;
    columnIndex: number;
}

interface Frame {
    id: string;
    panels: Panel[];
    bounds: any;
    rowIndex: number;
}

interface LayoutResult {
    panels: Panel[];
    frames: Frame[];
    totalPanels: number;
    actualCapacityKW: number;
    rows: number;
    layoutBounds: any;
}

export function calculatePanelLayout(
    polygon: any,
    polygonPath: any[],
    module: any,
    config: any,
    google: any
): LayoutResult {
    console.log('calculatePanelLayout called with:', { polygon, module, config });

    if (!polygon || !module || !google) {
        console.log('Missing required parameters');
        return { panels: [], frames: [], totalPanels: 0, actualCapacityKW: 0, rows: 0, layoutBounds: null };
    }

    // Configuración
    const setbackMeters = (config.setback || 40) * 0.3048; // ft a metros
    const rowSpacingMeters = (config.rowSpacing || 15) * 0.3048;
    const moduleSpacingMeters = (config.moduleSpacing || 0.041) * 0.3048;
    const frameSpacingMeters = (config.frameSpacing || 0) * 0.3048;
    const azimuthDegrees = config.azimuth || 180;
    const tiltDegrees = config.tilt || 25;
    const orientation = config.orientation || 'Landscape';
    const frameRows = config.frameSize || 4;
    const frameCols = config.frameWidth || 1;
    const maxCapacityKW = config.maxSize || Infinity;

    // Dimensiones del módulo según orientación
    const moduleWidth = orientation === 'Landscape' ? module.width : module.height;
    const moduleHeight = orientation === 'Landscape' ? module.height : module.width;

    // Calcular el polígono con setback
    const insetPolygon = calculateInsetPolygon(polygonPath, setbackMeters, google);
    if (insetPolygon.length < 3) {
        return { panels: [], frames: [], totalPanels: 0, actualCapacityKW: 0, rows: 0, layoutBounds: null };
    }

    // Calcular bounding box del polígono con setback
    const bounds = new google.maps.LatLngBounds();
    insetPolygon.forEach(point => bounds.extend(point));

    // Calcular dimensiones del frame
    const frameWidth = frameCols * moduleWidth + (frameCols - 1) * moduleSpacingMeters;
    const frameHeight = frameRows * moduleHeight + (frameRows - 1) * moduleSpacingMeters;

    // Calcular el espaciado real entre filas considerando la inclinación
    const tiltRad = (tiltDegrees * Math.PI) / 180;
    const rowPitch = frameHeight * Math.cos(tiltRad) + rowSpacingMeters;

    // Generar filas de paneles
    const panels: Panel[] = [];
    const frames: Frame[] = [];
    let totalPanels = 0;
    let rowIndex = 0;

    // Calcular el punto de inicio y la dirección de las filas
    const center = bounds.getCenter();
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();

    // Convertir azimut a radianes (0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste)
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;

    // Dirección perpendicular a las filas (para el espaciado)
    const rowDirection = {
        lat: Math.cos(azimuthRad),
        lng: Math.sin(azimuthRad) / Math.cos(center.lat() * Math.PI / 180)
    };

    // Dirección paralela a las filas
    const colDirection = {
        lat: -Math.sin(azimuthRad),
        lng: Math.cos(azimuthRad) / Math.cos(center.lat() * Math.PI / 180)
    };

    // Calcular el rango de filas necesario
    const diagonalDistance = google.maps.geometry.spherical.computeDistanceBetween(southWest, northEast);
    const maxRows = Math.ceil(diagonalDistance / rowPitch) + 2;

    // Punto de inicio (esquina más al suroeste ajustada por azimut)
    const startPoint = offsetLatLng(
        southWest,
        -maxRows * rowPitch / 2,
        rowDirection,
        google
    );

    // Iterar sobre las filas
    for (let r = 0; r < maxRows; r++) {
        // Calcular la posición de la fila
        const rowStart = offsetLatLng(
            startPoint,
            r * rowPitch,
            rowDirection,
            google
        );

        // Encontrar los segmentos de esta fila que están dentro del polígono
        const segments = findRowSegments(
            rowStart,
            colDirection,
            insetPolygon,
            diagonalDistance * 2,
            google
        );

        if (segments.length === 0) continue;

        // Para cada segmento, colocar frames
        segments.forEach(segment => {
            const segmentLength = google.maps.geometry.spherical.computeDistanceBetween(
                segment.start,
                segment.end
            );

            // Calcular cuántos frames caben en este segmento
            const framesInSegment = Math.floor(
                (segmentLength + frameSpacingMeters) / (frameWidth + frameSpacingMeters)
            );

            if (framesInSegment === 0) return;

            // Distribuir frames uniformemente en el segmento
            const totalFrameWidth = framesInSegment * frameWidth + (framesInSegment - 1) * frameSpacingMeters;
            const startOffset = (segmentLength - totalFrameWidth) / 2;

            for (let f = 0; f < framesInSegment; f++) {
                // Verificar límite de capacidad
                const potentialPanels = totalPanels + (frameRows * frameCols);
                const potentialCapacity = (potentialPanels * module.power) / 1000;
                if (potentialCapacity > maxCapacityKW) {
                    return { panels, frames, totalPanels, actualCapacityKW: (totalPanels * module.power) / 1000, rows: rowIndex + 1, layoutBounds: bounds };
                }

                const frameOffset = startOffset + f * (frameWidth + frameSpacingMeters) + frameWidth / 2;
                const frameCenter = offsetLatLng(
                    segment.start,
                    frameOffset,
                    colDirection,
                    google
                );

                const frame: Frame = {
                    id: `frame-${rowIndex}-${f}`,
                    panels: [],
                    bounds: null,
                    rowIndex: rowIndex
                };

                // Crear paneles dentro del frame
                for (let fr = 0; fr < frameRows; fr++) {
                    for (let fc = 0; fc < frameCols; fc++) {
                        const panelId = `panel-${rowIndex}-${f}-${fr}-${fc}`;

                        // Calcular posición del panel dentro del frame
                        const panelOffsetX = (fc - (frameCols - 1) / 2) * (moduleWidth + moduleSpacingMeters);
                        const panelOffsetY = (fr - (frameRows - 1) / 2) * (moduleHeight + moduleSpacingMeters);

                        // Rotar según azimut
                        const rotatedX = panelOffsetX * Math.cos(azimuthRad) - panelOffsetY * Math.sin(azimuthRad);
                        const rotatedY = panelOffsetX * Math.sin(azimuthRad) + panelOffsetY * Math.cos(azimuthRad);

                        // Calcular posición final del panel
                        const panelCenter = offsetLatLng(
                            frameCenter,
                            rotatedX,
                            { lat: 0, lng: 1 / Math.cos(frameCenter.lat() * Math.PI / 180) },
                            google
                        );
                        const finalPanelCenter = offsetLatLng(
                            panelCenter,
                            rotatedY,
                            { lat: 1, lng: 0 },
                            google
                        );

                        // Calcular las esquinas del panel
                        const corners = calculatePanelCorners(
                            finalPanelCenter,
                            moduleWidth,
                            moduleHeight,
                            azimuthDegrees,
                            google
                        );

                        const panel: Panel = {
                            id: panelId,
                            center: { lat: finalPanelCenter.lat(), lng: finalPanelCenter.lng() },
                            corners: corners,
                            rotation: azimuthDegrees,
                            frameId: frame.id,
                            rowIndex: rowIndex,
                            columnIndex: f
                        };

                        panels.push(panel);
                        frame.panels.push(panel);
                        totalPanels++;
                    }
                }

                frames.push(frame);
            }
        });

        rowIndex++;
    }

    const actualCapacityKW = (totalPanels * module.power) / 1000;

    return {
        panels,
        frames,
        totalPanels,
        actualCapacityKW,
        rows: rowIndex,
        layoutBounds: bounds
    };
}

// Calcular polígono con setback interno
function calculateInsetPolygon(path: any[], setback: number, google: any): any[] {
    if (path.length < 3 || setback <= 0) return path;

    // Simplificación: mover cada punto hacia el centroide
    const centroid = calculateCentroid(path);

    return path.map(point => {
        const bearing = google.maps.geometry.spherical.computeHeading(point, centroid);
        return google.maps.geometry.spherical.computeOffset(point, setback, bearing);
    });
}

// Calcular centroide del polígono
function calculateCentroid(path: any[]): any {
    let latSum = 0;
    let lngSum = 0;

    path.forEach(point => {
        latSum += point.lat();
        lngSum += point.lng();
    });

    return new google.maps.LatLng(latSum / path.length, lngSum / path.length);
}

// Offset de un punto en una dirección
function offsetLatLng(
    point: any,
    distance: number,
    direction: { lat: number; lng: number },
    google: any
): any {
    const R = 6371000; // Radio de la Tierra en metros
    const lat1 = point.lat() * Math.PI / 180;
    const lng1 = point.lng() * Math.PI / 180;

    const dLat = (distance * direction.lat) / R;
    const dLng = (distance * direction.lng) / (R * Math.cos(lat1));

    const lat2 = lat1 + dLat;
    const lng2 = lng1 + dLng;

    return new google.maps.LatLng(
        lat2 * 180 / Math.PI,
        lng2 * 180 / Math.PI
    );
}

// Encontrar segmentos de una fila que están dentro del polígono
function findRowSegments(
    rowStart: any,
    direction: { lat: number; lng: number },
    polygon: any[],
    maxDistance: number,
    google: any
): { start: any; end: any }[] {
    const segments: { start: any; end: any }[] = [];
    const step = 1; // metros
    const steps = Math.ceil(maxDistance / step);

    let inside = false;
    let segmentStart = null;

    for (let i = 0; i <= steps; i++) {
        const point = offsetLatLng(rowStart, i * step, direction, google);
        const isInside = google.maps.geometry.poly.containsLocation(point, new google.maps.Polygon({ paths: polygon }));

        if (isInside && !inside) {
            // Entrando al polígono
            segmentStart = point;
            inside = true;
        } else if (!isInside && inside) {
            // Saliendo del polígono
            if (segmentStart) {
                segments.push({
                    start: segmentStart,
                    end: offsetLatLng(rowStart, (i - 1) * step, direction, google)
                });
            }
            inside = false;
            segmentStart = null;
        }
    }

    // Si terminamos dentro del polígono
    if (inside && segmentStart) {
        segments.push({
            start: segmentStart,
            end: offsetLatLng(rowStart, steps * step, direction, google)
        });
    }

    return segments;
}

// Calcular las esquinas de un panel
function calculatePanelCorners(
    center: any,
    width: number,
    height: number,
    rotation: number,
    google: any
): { lat: number; lng: number }[] {
    const corners: { lat: number; lng: number }[] = [];
    const rotRad = rotation * Math.PI / 180;

    // Definir las esquinas relativas al centro
    const relativeCorners = [
        { x: -width / 2, y: -height / 2 }, // Superior izquierda
        { x: width / 2, y: -height / 2 },  // Superior derecha
        { x: width / 2, y: height / 2 },   // Inferior derecha
        { x: -width / 2, y: height / 2 }   // Inferior izquierda
    ];

    relativeCorners.forEach(corner => {
        // Rotar las esquinas
        const rotatedX = corner.x * Math.cos(rotRad) - corner.y * Math.sin(rotRad);
        const rotatedY = corner.x * Math.sin(rotRad) + corner.y * Math.cos(rotRad);

        // Convertir a coordenadas geográficas
        const cornerLatLng = offsetLatLng(
            center,
            rotatedX,
            { lat: 0, lng: 1 / Math.cos(center.lat() * Math.PI / 180) },
            google
        );
        const finalCorner = offsetLatLng(
            cornerLatLng,
            rotatedY,
            { lat: 1, lng: 0 },
            google
        );

        corners.push({
            lat: finalCorner.lat(),
            lng: finalCorner.lng()
        });
    });

    return corners;
}