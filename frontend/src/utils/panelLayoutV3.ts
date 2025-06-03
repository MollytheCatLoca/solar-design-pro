// src/utils/panelLayoutV3.ts

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
    center: { lat: number; lng: number };
    rowIndex: number;
    colIndex: number;
}

interface LayoutResult {
    panels: Panel[];
    totalPanels: number;
    actualCapacityKW: number;
    rows: number;
    frames: Frame[];
}

export function calculatePanelLayoutV3(
    polygon: any,
    polygonPath: any[],
    module: any,
    config: any,
    google: any
): LayoutResult {
    console.log('=== Panel Layout V3 - Sistema de Mesas Solares ===');

    if (!polygon || !module || !google || !polygonPath || polygonPath.length < 3) {
        return { panels: [], totalPanels: 0, actualCapacityKW: 0, rows: 0, frames: [] };
    }

    const panels: Panel[] = [];
    const frames: Frame[] = [];

    // Configuración - TODO EN METROS
    const setbackMeters = config.setback || 10; // metros desde el borde
    const rowSpacingMeters = config.rowSpacing || 5; // metros entre filas de mesas
    const frameSpacingMeters = config.frameSpacing || 2; // metros entre mesas en la misma fila
    const moduleSpacingMeters = 0.02; // 2cm entre paneles dentro de la mesa
    const azimuthDegrees = config.azimuth || 0; // 0 = Norte
    const tiltDegrees = config.tilt || 25;
    const orientation = config.orientation || 'Landscape';
    const maxCapacityKW = parseFloat(config.maxSize) || 999999;

    // Configuración de la mesa (frame)
    const frameRows = config.frameSize || 4; // filas de paneles por mesa
    const frameCols = config.frameWidth || 2; // columnas de paneles por mesa
    const panelsPerFrame = frameRows * frameCols;

    // Dimensiones del módulo según orientación
    const panelWidth = orientation === 'Landscape' ? module.width : module.height;
    const panelHeight = orientation === 'Landscape' ? module.height : module.width;

    // Dimensiones de la mesa completa
    const frameWidth = frameCols * panelWidth + (frameCols - 1) * moduleSpacingMeters;
    const frameHeight = frameRows * panelHeight + (frameRows - 1) * moduleSpacingMeters;

    console.log(`Panel: ${panelWidth.toFixed(2)}m x ${panelHeight.toFixed(2)}m (${module.power}W)`);
    console.log(`Mesa: ${frameWidth.toFixed(2)}m x ${frameHeight.toFixed(2)}m (${panelsPerFrame} paneles)`);
    console.log(`Configuración: Azimut=${azimuthDegrees}°, Inclinación=${tiltDegrees}°`);
    console.log(`Espaciados: Setback=${setbackMeters}m, Entre filas=${rowSpacingMeters}m, Entre mesas=${frameSpacingMeters}m`);

    // Aplicar setback al polígono
    const insetPath = applySetback(polygonPath, setbackMeters, google);
    if (insetPath.length < 3) {
        console.log('Área muy pequeña después del setback');
        return { panels: [], totalPanels: 0, actualCapacityKW: 0, rows: 0, frames: [] };
    }

    // Crear polígono con setback
    const testPolygon = new google.maps.Polygon({ paths: insetPath });

    // Obtener bounds del área
    const bounds = new google.maps.LatLngBounds();
    insetPath.forEach(point => bounds.extend(point));

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Calcular dimensiones aproximadas del área
    const areaWidth = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(sw.lat(), sw.lng()),
        new google.maps.LatLng(sw.lat(), ne.lng())
    );
    const areaHeight = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(sw.lat(), sw.lng()),
        new google.maps.LatLng(ne.lat(), sw.lng())
    );

    console.log(`Área útil: ${areaWidth.toFixed(0)}m x ${areaHeight.toFixed(0)}m`);

    // Calcular el espaciado real entre filas considerando la inclinación
    const tiltRad = (tiltDegrees * Math.PI) / 180;
    const rowPitch = frameHeight * Math.cos(tiltRad) + rowSpacingMeters;

    console.log(`Espaciado real entre filas de mesas: ${rowPitch.toFixed(2)}m`);

    // Calcular número aproximado de filas y mesas por fila
    const estimatedRows = Math.floor(areaHeight / rowPitch);
    const estimatedFramesPerRow = Math.floor(areaWidth / (frameWidth + frameSpacingMeters));

    console.log(`Estimación: ${estimatedRows} filas x ${estimatedFramesPerRow} mesas/fila = ${estimatedRows * estimatedFramesPerRow} mesas`);

    let totalPanels = 0;
    let rowCount = 0;

    // Punto de inicio (esquina suroeste + setback)
    const startLat = sw.lat() + (setbackMeters / 111319.5);
    const startLng = sw.lng() + (setbackMeters / (111319.5 * Math.cos(sw.lat() * Math.PI / 180)));

    // ALGORITMO PRINCIPAL: Colocar mesas fila por fila
    for (let row = 0; row <= estimatedRows + 5; row++) { // +5 para asegurar cobertura
        // Calcular latitud de esta fila de mesas
        const rowOffsetNorth = row * rowPitch;
        const rowLat = startLat + (rowOffsetNorth / 111319.5);

        // Si nos salimos del bounds norte, parar
        if (rowLat > ne.lat() - (setbackMeters / 111319.5)) break;

        let framesInRow = 0;

        // Colocar mesas de oeste a este en esta fila
        for (let col = 0; col <= estimatedFramesPerRow + 5; col++) { // +5 para asegurar cobertura
            // Verificar límite de capacidad
            if ((totalPanels * module.power) / 1000 >= maxCapacityKW) {
                console.log(`Límite de capacidad alcanzado: ${maxCapacityKW} kW`);
                return {
                    panels,
                    totalPanels,
                    actualCapacityKW: (totalPanels * module.power) / 1000,
                    rows: rowCount,
                    frames
                };
            }

            // Calcular longitud del centro de esta mesa
            const frameOffsetEast = col * (frameWidth + frameSpacingMeters) + frameWidth / 2;
            const frameLng = startLng + (frameOffsetEast / (111319.5 * Math.cos(rowLat * Math.PI / 180)));

            // Si nos salimos del bounds este, pasar a siguiente fila
            if (frameLng > ne.lng() - (setbackMeters / (111319.5 * Math.cos(rowLat * Math.PI / 180)))) break;

            // Centro de la mesa
            const frameCenter = new google.maps.LatLng(rowLat, frameLng);

            // Verificar si el centro está dentro del polígono
            if (!google.maps.geometry.poly.containsLocation(frameCenter, testPolygon)) {
                continue;
            }

            // Verificar las 4 esquinas de la mesa
            const frameCorners = calculateFrameCorners(
                { lat: rowLat, lng: frameLng },
                frameWidth,
                frameHeight,
                azimuthDegrees
            );

            let allCornersInside = true;
            for (const corner of frameCorners) {
                const cornerLatLng = new google.maps.LatLng(corner.lat, corner.lng);
                if (!google.maps.geometry.poly.containsLocation(cornerLatLng, testPolygon)) {
                    allCornersInside = false;
                    break;
                }
            }

            if (!allCornersInside) continue;

            // Mesa válida! Crear frame y sus paneles
            const frameId = `frame-${row}-${col}`;
            const framePanels: Panel[] = [];

            // Crear paneles dentro de la mesa
            for (let panelRow = 0; panelRow < frameRows; panelRow++) {
                for (let panelCol = 0; panelCol < frameCols; panelCol++) {
                    // Posición relativa del panel dentro de la mesa
                    const panelRelX = (panelCol - (frameCols - 1) / 2) * (panelWidth + moduleSpacingMeters);
                    const panelRelY = (panelRow - (frameRows - 1) / 2) * (panelHeight + moduleSpacingMeters);

                    // Aplicar rotación según azimut
                    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
                    const rotatedX = panelRelX * Math.cos(azimuthRad) - panelRelY * Math.sin(azimuthRad);
                    const rotatedY = panelRelX * Math.sin(azimuthRad) + panelRelY * Math.cos(azimuthRad);

                    // Posición final del panel
                    const panelLat = rowLat + (rotatedY / 111319.5);
                    const panelLng = frameLng + (rotatedX / (111319.5 * Math.cos(rowLat * Math.PI / 180)));

                    // Calcular esquinas del panel
                    const corners = calculatePanelCorners(
                        { lat: panelLat, lng: panelLng },
                        panelWidth,
                        panelHeight,
                        azimuthDegrees
                    );

                    const panel: Panel = {
                        id: `panel-${row}-${col}-${panelRow}-${panelCol}`,
                        center: { lat: panelLat, lng: panelLng },
                        corners: corners,
                        rotation: azimuthDegrees,
                        frameId: frameId,
                        rowIndex: row,
                        colIndex: col
                    };

                    panels.push(panel);
                    framePanels.push(panel);
                    totalPanels++;
                }
            }

            // Agregar frame
            frames.push({
                id: frameId,
                panels: framePanels,
                center: { lat: rowLat, lng: frameLng },
                rowIndex: row,
                colIndex: col
            });

            framesInRow++;
        }

        if (framesInRow > 0) {
            rowCount++;
        }
    }

    const actualCapacityKW = (totalPanels * module.power) / 1000;
    console.log(`=== RESULTADO: ${frames.length} mesas, ${totalPanels} paneles, ${actualCapacityKW.toFixed(1)} kW, ${rowCount} filas ===`);

    return {
        panels,
        totalPanels,
        actualCapacityKW,
        rows: rowCount,
        frames
    };
}

// Aplicar setback al polígono (reducir el tamaño)
function applySetback(path: any[], setback: number, google: any): any[] {
    if (setback <= 0) return path;

    // Calcular el centroide
    let latSum = 0;
    let lngSum = 0;

    // Normalizar todos los puntos a formato {lat, lng}
    const normalizedPath = path.map(p => {
        if (typeof p.lat === 'function') {
            // Es un google.maps.LatLng
            return { lat: p.lat(), lng: p.lng() };
        } else if (p.lat !== undefined && p.lng !== undefined) {
            // Ya es {lat, lng}
            return { lat: p.lat, lng: p.lng };
        } else {
            console.error('Formato de punto no reconocido:', p);
            return { lat: 0, lng: 0 };
        }
    });

    normalizedPath.forEach(point => {
        latSum += point.lat;
        lngSum += point.lng;
    });

    const centroid = new google.maps.LatLng(
        latSum / normalizedPath.length,
        lngSum / normalizedPath.length
    );

    // Mover cada punto hacia el centroide
    return path.map(p => {
        let point;
        if (typeof p.lat === 'function') {
            point = p;
        } else {
            point = new google.maps.LatLng(p.lat, p.lng);
        }

        const heading = google.maps.geometry.spherical.computeHeading(point, centroid);
        return google.maps.geometry.spherical.computeOffset(point, setback, heading);
    });
}

// Calcular las 4 esquinas de una mesa
function calculateFrameCorners(
    center: { lat: number; lng: number },
    width: number,
    height: number,
    azimuthDegrees: number
): { lat: number; lng: number }[] {
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const relativeCorners = [
        { x: -halfWidth, y: halfHeight },   // Superior izquierda
        { x: halfWidth, y: halfHeight },    // Superior derecha
        { x: halfWidth, y: -halfHeight },   // Inferior derecha
        { x: -halfWidth, y: -halfHeight }   // Inferior izquierda
    ];

    return relativeCorners.map(corner => {
        const rotatedX = corner.x * Math.cos(azimuthRad) - corner.y * Math.sin(azimuthRad);
        const rotatedY = corner.x * Math.sin(azimuthRad) + corner.y * Math.cos(azimuthRad);

        const dLat = rotatedY / 111319.5;
        const dLng = rotatedX / (111319.5 * Math.cos(center.lat * Math.PI / 180));

        return {
            lat: center.lat + dLat,
            lng: center.lng + dLng
        };
    });
}

// Calcular las 4 esquinas de un panel
function calculatePanelCorners(
    center: { lat: number; lng: number },
    width: number,
    height: number,
    azimuthDegrees: number
): { lat: number; lng: number }[] {
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const relativeCorners = [
        { x: -halfWidth, y: halfHeight },   // Superior izquierda
        { x: halfWidth, y: halfHeight },    // Superior derecha
        { x: halfWidth, y: -halfHeight },   // Inferior derecha
        { x: -halfWidth, y: -halfHeight }   // Inferior izquierda
    ];

    return relativeCorners.map(corner => {
        const rotatedX = corner.x * Math.cos(azimuthRad) - corner.y * Math.sin(azimuthRad);
        const rotatedY = corner.x * Math.sin(azimuthRad) + corner.y * Math.cos(azimuthRad);

        const dLat = rotatedY / 111319.5;
        const dLng = rotatedX / (111319.5 * Math.cos(center.lat * Math.PI / 180));

        return {
            lat: center.lat + dLat,
            lng: center.lng + dLng
        };
    });
}