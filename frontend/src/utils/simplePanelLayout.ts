// src/utils/simplePanelLayout.ts

interface Panel {
    id: string;
    center: { lat: number; lng: number };
    corners: { lat: number; lng: number }[];
    rotation: number;
    frameId: string;
    rowIndex: number;
    colIndex: number;
}

interface Frame {
    id: string;
    panels: Panel[];
    bounds: { lat: number; lng: number }[];
}

interface LayoutResult {
    panels: Panel[];
    frames: Frame[];
    totalPanels: number;
    actualCapacityKW: number;
    rows: number;
}

export function calculateSimplePanelLayout(
    polygon: any,
    polygonPath: any[],
    module: any,
    config: any,
    google: any
): LayoutResult {
    console.log('Panel layout calculation started', config);

    if (!polygon || !module || !google || !polygonPath || polygonPath.length < 3) {
        return { panels: [], frames: [], totalPanels: 0, actualCapacityKW: 0, rows: 0 };
    }

    const panels: Panel[] = [];
    const frames: Frame[] = [];

    // Configuración
    const setbackMeters = (config.setback || 40) * 0.3048; // ft a metros
    const rowSpacingMeters = (config.rowSpacing || 15) * 0.3048;
    const moduleSpacingMeters = (config.moduleSpacing || 0.041) * 0.3048;
    const frameSpacingMeters = (config.frameSpacing || 0) * 0.3048;
    const azimuthDegrees = config.azimuth || 180; // Default sur en hemisferio sur
    const tiltDegrees = config.tilt || 25;
    const orientation = config.orientation || 'Landscape';
    const maxCapacityKW = config.maxSize || Infinity;

    // Frame configuration
    const frameRows = config.frameSize || 4;
    const frameCols = config.frameWidth || 1;
    const alignH = config.alignH || 'center';
    const alignV = config.alignV || 'middle';

    // Dimensiones del módulo según orientación
    const moduleWidth = orientation === 'Landscape' ? module.width : module.height;
    const moduleHeight = orientation === 'Landscape' ? module.height : module.width;

    // Dimensiones del frame
    const frameWidth = frameCols * moduleWidth + (frameCols - 1) * moduleSpacingMeters;
    const frameHeight = frameRows * moduleHeight + (frameRows - 1) * moduleSpacingMeters;

    // Calcular bounding box
    const bounds = new google.maps.LatLngBounds();
    polygonPath.forEach(point => {
        if (point.lat && point.lng) {
            bounds.extend(new google.maps.LatLng(point.lat(), point.lng()));
        } else {
            bounds.extend(point);
        }
    });

    const center = bounds.getCenter();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Calcular el polígono con setback
    const insetPolygon = calculateInsetPolygon(polygonPath, setbackMeters, google);
    if (insetPolygon.length < 3) {
        console.log('Area too small after setback');
        return { panels: [], frames: [], totalPanels: 0, actualCapacityKW: 0, rows: 0 };
    }

    // Calcular el bounding box del polígono con setback
    const insetBounds = new google.maps.LatLngBounds();
    insetPolygon.forEach(point => insetBounds.extend(point));

    // Convertir azimut a radianes (0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste)
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;

    // Vector de dirección de las filas (perpendicular al azimut)
    // Si azimut es 180° (sur), las filas van de este a oeste
    const rowDirection = {
        east: Math.cos(azimuthRad + Math.PI / 2),
        north: Math.sin(azimuthRad + Math.PI / 2)
    };

    // Vector de dirección entre filas (en la dirección del azimut)
    const colDirection = {
        east: Math.cos(azimuthRad),
        north: Math.sin(azimuthRad)
    };

    // Calcular espaciado entre filas considerando la inclinación
    const tiltRad = (tiltDegrees * Math.PI) / 180;
    const rowPitch = frameHeight * Math.cos(tiltRad) + rowSpacingMeters;

    // Encontrar los extremos del polígono en la dirección del azimut
    let minProjection = Infinity;
    let maxProjection = -Infinity;
    let minRowProjection = Infinity;
    let maxRowProjection = -Infinity;

    insetPolygon.forEach(point => {
        const relLat = point.lat() - center.lat();
        const relLng = point.lng() - center.lng();

        // Proyectar en la dirección de las filas
        const rowProjection = relLng * rowDirection.east + relLat * rowDirection.north;
        // Proyectar en la dirección entre filas
        const colProjection = relLng * colDirection.east + relLat * colDirection.north;

        minProjection = Math.min(minProjection, colProjection);
        maxProjection = Math.max(maxProjection, colProjection);
        minRowProjection = Math.min(minRowProjection, rowProjection);
        maxRowProjection = Math.max(maxRowProjection, rowProjection);
    });

    // Calcular número de filas y punto de inicio según alineación
    const totalRowDistance = maxProjection - minProjection;
    const numberOfRows = Math.floor(totalRowDistance * 111319.5 / rowPitch);

    // Ajustar punto de inicio según alineación vertical
    let startRowOffset = minProjection * 111319.5;
    if (alignV === 'middle') {
        const unusedSpace = totalRowDistance * 111319.5 - numberOfRows * rowPitch;
        startRowOffset += unusedSpace / 2;
    } else if (alignV === 'bottom') {
        const unusedSpace = totalRowDistance * 111319.5 - numberOfRows * rowPitch;
        startRowOffset += unusedSpace;
    }

    console.log(`Generating ${numberOfRows} rows with azimuth ${azimuthDegrees}°`);

    let totalPanels = 0;
    let rowIndex = 0;

    // Generar filas
    for (let row = 0; row < numberOfRows; row++) {
        // Calcular posición de la fila
        const rowOffset = startRowOffset + row * rowPitch;

        // Encontrar los límites de esta fila dentro del polígono
        const rowSegments = findRowSegments(
            center,
            rowOffset,
            rowDirection,
            colDirection,
            insetPolygon,
            minRowProjection * 111319.5,
            maxRowProjection * 111319.5,
            google
        );

        if (rowSegments.length === 0) continue;

        // Para cada segmento de la fila
        rowSegments.forEach(segment => {
            const segmentLength = segment.endOffset - segment.startOffset;
            const framesInSegment = Math.floor((segmentLength + frameSpacingMeters) / (frameWidth + frameSpacingMeters));

            if (framesInSegment === 0) return;

            // Calcular offset inicial según alineación horizontal
            let startOffset = segment.startOffset;
            if (alignH === 'center') {
                const totalFramesWidth = framesInSegment * frameWidth + (framesInSegment - 1) * frameSpacingMeters;
                startOffset += (segmentLength - totalFramesWidth) / 2;
            } else if (alignH === 'right') {
                const totalFramesWidth = framesInSegment * frameWidth + (framesInSegment - 1) * frameSpacingMeters;
                startOffset += segmentLength - totalFramesWidth;
            }

            // Generar frames en el segmento
            for (let f = 0; f < framesInSegment; f++) {
                // Verificar límite de capacidad
                const potentialPanels = totalPanels + (frameRows * frameCols);
                const potentialCapacity = (potentialPanels * module.power) / 1000;
                if (potentialCapacity > maxCapacityKW) {
                    console.log('Capacity limit reached');
                    return { panels, frames, totalPanels, actualCapacityKW: (totalPanels * module.power) / 1000, rows: rowIndex + 1 };
                }

                const frameOffset = startOffset + f * (frameWidth + frameSpacingMeters);
                const frameCenter = calculatePointAtOffset(center, rowOffset, frameOffset, rowDirection, colDirection);

                const frame: Frame = {
                    id: `frame-${rowIndex}-${f}`,
                    panels: [],
                    bounds: []
                };

                // Generar paneles dentro del frame
                for (let fr = 0; fr < frameRows; fr++) {
                    for (let fc = 0; fc < frameCols; fc++) {
                        // Posición relativa del panel dentro del frame
                        const panelRelX = (fc - (frameCols - 1) / 2) * (moduleWidth + moduleSpacingMeters);
                        const panelRelY = (fr - (frameRows - 1) / 2) * (moduleHeight + moduleSpacingMeters);

                        // Aplicar rotación según azimut
                        const rotatedX = panelRelX * Math.cos(azimuthRad) - panelRelY * Math.sin(azimuthRad);
                        const rotatedY = panelRelX * Math.sin(azimuthRad) + panelRelY * Math.cos(azimuthRad);

                        // Calcular posición final del panel
                        const panelCenter = {
                            lat: frameCenter.lat + (rotatedY / 111319.5),
                            lng: frameCenter.lng + (rotatedX / (111319.5 * Math.cos(frameCenter.lat * Math.PI / 180)))
                        };

                        // Calcular esquinas del panel
                        const corners = calculatePanelCorners(panelCenter, moduleWidth, moduleHeight, azimuthDegrees);

                        const panel: Panel = {
                            id: `panel-${rowIndex}-${f}-${fr}-${fc}`,
                            center: panelCenter,
                            corners: corners,
                            rotation: azimuthDegrees,
                            frameId: frame.id,
                            rowIndex: rowIndex,
                            colIndex: f
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

    console.log(`Layout complete: ${totalPanels} panels in ${frames.length} frames, ${actualCapacityKW} kW`);

    return {
        panels,
        frames,
        totalPanels,
        actualCapacityKW,
        rows: rowIndex
    };
}

// Calcular polígono con setback interno
function calculateInsetPolygon(path: any[], setback: number, google: any): any[] {
    if (path.length < 3 || setback <= 0) return path;

    const polygon = new google.maps.Polygon({ paths: path });
    const centroid = calculatePolygonCentroid(path);

    // Mover cada punto hacia el centroide
    return path.map(point => {
        const latLng = point.lat ? new google.maps.LatLng(point.lat(), point.lng()) : point;
        const heading = google.maps.geometry.spherical.computeHeading(latLng, centroid);
        return google.maps.geometry.spherical.computeOffset(latLng, setback, heading);
    });
}

// Calcular centroide del polígono
function calculatePolygonCentroid(path: any[]): any {
    let latSum = 0;
    let lngSum = 0;

    path.forEach(point => {
        if (point.lat && point.lng) {
            latSum += point.lat();
            lngSum += point.lng();
        } else {
            latSum += point.lat;
            lngSum += point.lng;
        }
    });

    return new google.maps.LatLng(latSum / path.length, lngSum / path.length);
}

// Encontrar segmentos de una fila que están dentro del polígono
function findRowSegments(
    center: any,
    rowOffset: number,
    rowDirection: any,
    colDirection: any,
    polygon: any[],
    minOffset: number,
    maxOffset: number,
    google: any
): { startOffset: number; endOffset: number }[] {
    const segments: { startOffset: number; endOffset: number }[] = [];
    const step = 0.5; // metros
    const steps = Math.ceil((maxOffset - minOffset) / step);

    let inside = false;
    let segmentStart = 0;

    // Crear un polígono temporal para las pruebas
    const testPolygon = new google.maps.Polygon({ paths: polygon });

    for (let i = 0; i <= steps; i++) {
        const offset = minOffset + i * step;
        const point = calculatePointAtOffset(center, rowOffset, offset, rowDirection, colDirection);
        const latLng = new google.maps.LatLng(point.lat, point.lng);
        const isInside = google.maps.geometry.poly.containsLocation(latLng, testPolygon);

        if (isInside && !inside) {
            segmentStart = offset;
            inside = true;
        } else if (!isInside && inside) {
            segments.push({
                startOffset: segmentStart,
                endOffset: offset - step
            });
            inside = false;
        }
    }

    if (inside) {
        segments.push({
            startOffset: segmentStart,
            endOffset: maxOffset
        });
    }

    return segments;
}

// Calcular punto a una distancia específica
function calculatePointAtOffset(
    center: any,
    rowOffset: number,
    colOffset: number,
    rowDirection: any,
    colDirection: any
): { lat: number; lng: number } {
    // Convertir offsets a cambios en lat/lng
    const dLat = (colDirection.north * rowOffset + rowDirection.north * colOffset) / 111319.5;
    const dLng = (colDirection.east * rowOffset + rowDirection.east * colOffset) /
        (111319.5 * Math.cos(center.lat() * Math.PI / 180));

    return {
        lat: center.lat() + dLat,
        lng: center.lng() + dLng
    };
}

// Calcular esquinas del panel
function calculatePanelCorners(
    center: { lat: number; lng: number },
    width: number,
    height: number,
    azimuthDegrees: number
): { lat: number; lng: number }[] {
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
    const corners: { lat: number; lng: number }[] = [];

    // Definir esquinas relativas al centro
    const relativeCorners = [
        { x: -width / 2, y: -height / 2 },
        { x: width / 2, y: -height / 2 },
        { x: width / 2, y: height / 2 },
        { x: -width / 2, y: height / 2 }
    ];

    relativeCorners.forEach(corner => {
        // Rotar según azimut
        const rotatedX = corner.x * Math.cos(azimuthRad) - corner.y * Math.sin(azimuthRad);
        const rotatedY = corner.x * Math.sin(azimuthRad) + corner.y * Math.cos(azimuthRad);

        // Convertir a coordenadas geográficas
        corners.push({
            lat: center.lat + (rotatedY / 111319.5),
            lng: center.lng + (rotatedX / (111319.5 * Math.cos(center.lat * Math.PI / 180)))
        });
    });

    return corners;
}