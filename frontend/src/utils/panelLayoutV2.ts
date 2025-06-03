// src/utils/panelLayoutV2.ts

interface Panel {
    id: string;
    center: { lat: number; lng: number };
    corners: { lat: number; lng: number }[];
    rotation: number;
}

interface LayoutResult {
    panels: Panel[];
    totalPanels: number;
    actualCapacityKW: number;
    rows: number;
}

export function calculatePanelLayoutV2(
    polygon: any,
    polygonPath: any[],
    module: any,
    config: any,
    google: any
): LayoutResult {
    console.log('Panel layout V2 - Starting calculation');

    if (!polygon || !module || !google || !polygonPath || polygonPath.length < 3) {
        return { panels: [], totalPanels: 0, actualCapacityKW: 0, rows: 0 };
    }

    const panels: Panel[] = [];

    // Configuración
    const setbackMeters = (config.setback || 40) * 0.3048; // ft a metros
    const rowSpacingMeters = (config.rowSpacing || 15) * 0.3048;
    const moduleSpacingMeters = (config.moduleSpacing || 0.041) * 0.3048;
    const frameSpacingMeters = (config.frameSpacing || 0) * 0.3048;
    const azimuthDegrees = config.azimuth || 0; // Default norte para Argentina
    const orientation = config.orientation || 'Landscape';
    const maxCapacityKW = config.maxSize || Infinity;

    // Frame configuration
    const frameRows = config.frameSize || 4;
    const frameCols = config.frameWidth || 1;

    // Dimensiones del módulo según orientación
    const moduleWidth = orientation === 'Landscape' ? module.width : module.height;
    const moduleHeight = orientation === 'Landscape' ? module.height : module.width;

    // Dimensiones del frame completo
    const frameWidth = frameCols * moduleWidth + (frameCols - 1) * moduleSpacingMeters;
    const frameHeight = frameRows * moduleHeight + (frameRows - 1) * moduleSpacingMeters;

    // Espaciado total entre centros de frames
    const frameSpacingX = frameWidth + frameSpacingMeters;
    const frameSpacingY = frameHeight + rowSpacingMeters;

    // Crear polígono de Google Maps para pruebas de contención
    const googlePolygon = new google.maps.Polygon({ paths: polygonPath });

    // Calcular el polígono con setback
    const insetPath = applySetback(polygonPath, setbackMeters, google);
    if (insetPath.length < 3) {
        console.log('Area too small after setback');
        return { panels: [], totalPanels: 0, actualCapacityKW: 0, rows: 0 };
    }

    const insetPolygon = new google.maps.Polygon({ paths: insetPath });

    // Calcular bounding box del polígono con setback
    const bounds = new google.maps.LatLngBounds();
    insetPath.forEach(point => bounds.extend(point));

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const center = bounds.getCenter();

    // Calcular dimensiones aproximadas
    const eastWest = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(center.lat(), sw.lng()),
        new google.maps.LatLng(center.lat(), ne.lng())
    );
    const northSouth = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(sw.lat(), center.lng()),
        new google.maps.LatLng(ne.lat(), center.lng())
    );

    console.log(`Area dimensions: ${eastWest.toFixed(1)}m x ${northSouth.toFixed(1)}m`);

    // Convertir azimut a radianes
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;

    // Calcular número aproximado de filas y columnas
    const maxFramesX = Math.floor(eastWest / frameSpacingX) + 1;
    const maxFramesY = Math.floor(northSouth / frameSpacingY) + 1;

    // Punto de inicio (suroeste con setback)
    const startLat = sw.lat() + (setbackMeters / 111319.5);
    const startLng = sw.lng() + (setbackMeters / (111319.5 * Math.cos(sw.lat() * Math.PI / 180)));

    let totalPanels = 0;
    let rowCount = 0;

    // Iterar sobre posiciones posibles de frames
    for (let frameRow = 0; frameRow < maxFramesY; frameRow++) {
        let framesInRow = 0;

        for (let frameCol = 0; frameCol < maxFramesX; frameCol++) {
            // Verificar límite de capacidad
            const potentialPanels = totalPanels + (frameRows * frameCols);
            const potentialCapacity = (potentialPanels * module.power) / 1000;
            if (potentialCapacity > maxCapacityKW) {
                console.log('Capacity limit reached');
                return { panels, totalPanels, actualCapacityKW: (totalPanels * module.power) / 1000, rows: rowCount };
            }

            // Calcular posición del centro del frame sin rotación
            const frameOffsetX = frameCol * frameSpacingX + frameWidth / 2;
            const frameOffsetY = frameRow * frameSpacingY + frameHeight / 2;

            // Aplicar rotación según azimut
            const rotatedX = frameOffsetX * Math.cos(azimuthRad) - frameOffsetY * Math.sin(azimuthRad);
            const rotatedY = frameOffsetX * Math.sin(azimuthRad) + frameOffsetY * Math.cos(azimuthRad);

            // Calcular posición geográfica del centro del frame
            const frameCenterLat = startLat + (rotatedY / 111319.5);
            const frameCenterLng = startLng + (rotatedX / (111319.5 * Math.cos(startLat * Math.PI / 180)));
            const frameCenter = new google.maps.LatLng(frameCenterLat, frameCenterLng);

            // Verificar si el frame completo está dentro del polígono
            // Para esto, verificamos las 4 esquinas del frame
            const frameCorners = calculateFrameCorners(
                { lat: frameCenterLat, lng: frameCenterLng },
                frameWidth,
                frameHeight,
                azimuthDegrees
            );

            let frameInsidePolygon = true;
            for (const corner of frameCorners) {
                const cornerLatLng = new google.maps.LatLng(corner.lat, corner.lng);
                if (!google.maps.geometry.poly.containsLocation(cornerLatLng, insetPolygon)) {
                    frameInsidePolygon = false;
                    break;
                }
            }

            if (!frameInsidePolygon) continue;

            // Si el frame está dentro, generar todos los paneles del frame
            let framePanelCount = 0;
            for (let panelRow = 0; panelRow < frameRows; panelRow++) {
                for (let panelCol = 0; panelCol < frameCols; panelCol++) {
                    // Posición relativa del panel dentro del frame
                    const panelRelX = (panelCol - (frameCols - 1) / 2) * (moduleWidth + moduleSpacingMeters);
                    const panelRelY = (panelRow - (frameRows - 1) / 2) * (moduleHeight + moduleSpacingMeters);

                    // Aplicar rotación según azimut
                    const panelRotatedX = panelRelX * Math.cos(azimuthRad) - panelRelY * Math.sin(azimuthRad);
                    const panelRotatedY = panelRelX * Math.sin(azimuthRad) + panelRelY * Math.cos(azimuthRad);

                    // Posición final del panel
                    const panelLat = frameCenterLat + (panelRotatedY / 111319.5);
                    const panelLng = frameCenterLng + (panelRotatedX / (111319.5 * Math.cos(frameCenterLat * Math.PI / 180)));

                    // Calcular esquinas del panel
                    const corners = calculatePanelCorners(
                        { lat: panelLat, lng: panelLng },
                        moduleWidth,
                        moduleHeight,
                        azimuthDegrees
                    );

                    const panel: Panel = {
                        id: `panel-${frameRow}-${frameCol}-${panelRow}-${panelCol}`,
                        center: { lat: panelLat, lng: panelLng },
                        corners: corners,
                        rotation: azimuthDegrees
                    };

                    panels.push(panel);
                    framePanelCount++;
                    totalPanels++;
                }
            }

            if (framePanelCount > 0) {
                framesInRow++;
            }
        }

        if (framesInRow > 0) {
            rowCount++;
        }
    }

    const actualCapacityKW = (totalPanels * module.power) / 1000;
    console.log(`Layout complete: ${totalPanels} panels, ${actualCapacityKW.toFixed(1)} kW, ${rowCount} rows`);

    return {
        panels,
        totalPanels,
        actualCapacityKW,
        rows: rowCount
    };
}

// Aplicar setback al polígono
function applySetback(path: any[], setback: number, google: any): any[] {
    if (setback <= 0) return path;

    // Calcular el centroide
    let latSum = 0;
    let lngSum = 0;
    const points = path.map(p => {
        const point = p.lat ? { lat: p.lat(), lng: p.lng() } : p;
        latSum += point.lat;
        lngSum += point.lng;
        return point;
    });

    const centroid = new google.maps.LatLng(latSum / points.length, lngSum / points.length);

    // Mover cada punto hacia el centroide
    return path.map(p => {
        const point = p.lat ? new google.maps.LatLng(p.lat(), p.lng()) : new google.maps.LatLng(p.lat, p.lng);
        const heading = google.maps.geometry.spherical.computeHeading(point, centroid);
        return google.maps.geometry.spherical.computeOffset(point, setback, heading);
    });
}

// Calcular esquinas del frame
function calculateFrameCorners(
    center: { lat: number; lng: number },
    width: number,
    height: number,
    azimuthDegrees: number
): { lat: number; lng: number }[] {
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
    const corners: { lat: number; lng: number }[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Esquinas relativas
    const relativeCorners = [
        { x: -halfWidth, y: -halfHeight },
        { x: halfWidth, y: -halfHeight },
        { x: halfWidth, y: halfHeight },
        { x: -halfWidth, y: halfHeight }
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

// Calcular esquinas del panel
function calculatePanelCorners(
    center: { lat: number; lng: number },
    width: number,
    height: number,
    azimuthDegrees: number
): { lat: number; lng: number }[] {
    const azimuthRad = (azimuthDegrees * Math.PI) / 180;
    const corners: { lat: number; lng: number }[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Esquinas relativas al centro
    const relativeCorners = [
        { x: -halfWidth, y: -halfHeight },
        { x: halfWidth, y: -halfHeight },
        { x: halfWidth, y: halfHeight },
        { x: -halfWidth, y: halfHeight }
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