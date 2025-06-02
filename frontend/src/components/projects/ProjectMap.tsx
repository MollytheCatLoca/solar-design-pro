// src/components/projects/ProjectMap.tsx

'use client';

const React = require('react');
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ProjectMapProps {
    latitude: number;
    longitude: number;
    projectName: string;
}

export default function ProjectMap({ latitude, longitude, projectName }: ProjectMapProps) {
    // Por ahora usaremos un iframe de Google Maps
    // En el futuro podemos integrar Mapbox o Google Maps API
    const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <Card>
        <CardHeader>
        <CardTitle className= "flex items-center gap-2" >
        <MapPin className="h-5 w-5" />
            Ubicación del Proyecto
                </CardTitle>
                </CardHeader>
                < CardContent >
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden" >
                    <iframe
            src={ mapUrl }
    className = "absolute inset-0 w-full h-full"
    style = {{ border: 0 }
}
allowFullScreen
loading = "lazy"
referrerPolicy = "no-referrer-when-downgrade"
title = {`Mapa de ${projectName}`}
          />
    </div>
    < div className = "mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" >
        <p className="text-sm text-muted-foreground" >
            <strong>Coordenadas: </strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                </div>
                </CardContent>
                </Card>
  );
}