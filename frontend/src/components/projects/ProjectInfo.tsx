// src/components/projects/ProjectInfo.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    User,
    MapPin,
    FileText,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Project } from '@/lib/api/projects';

interface ProjectInfoProps {
    project: Project;
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
    return (
        <Card>
        <CardHeader>
        <div className= "flex items-start justify-between" >
        <div>
        <CardTitle>{ project.name } </CardTitle>
        <CardDescription>
    { project.description || 'Sin descripción' }
    </CardDescription>
        </div>
        < Badge variant = "outline" className = "ml-2" >
            Activo
            </Badge>
            </div>
            </CardHeader>
            < CardContent className = "space-y-4" >
                <div className="grid gap-4 text-sm" >
                    <div className="flex items-center gap-2" >
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground" > Creado: </span>
                                < span className = "font-medium" >
                                    { format(new Date(project.created_at), "d 'de' MMMM, yyyy", { locale: es })
}
</span>
    </div>

{
    project.updated_at && (
        <div className="flex items-center gap-2" >
            <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground" > Actualizado: </span>
                    < span className = "font-medium" >
                        { format(new Date(project.updated_at), "d 'de' MMMM, yyyy", { locale: es })
}
</span>
    </div>
          )}

{
    (project.latitude && project.longitude) && (
        <div className="flex items-center gap-2" >
            <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground" > Ubicación: </span>
                    < span className = "font-medium" >
                        { project.latitude.toFixed(4) }, { project.longitude.toFixed(4) }
                        </span>
                        </div>
          )
}

<div className="flex items-center gap-2" >
    <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground" > Propietario: </span>
            < span className = "font-medium" > Usuario Actual </span>
                </div>

                < div className = "flex items-center gap-2" >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground" > ID del proyecto: </span>
                            < span className = "font-mono text-xs" > { project.id } </span>
                                </div>
                                </div>

                                < div className = "pt-4 border-t" >
                                    <h4 className="text-sm font-medium mb-2" > Descripción completa </h4>
                                        < p className = "text-sm text-muted-foreground" >
                                            { project.description || 'No se ha proporcionado una descripción para este proyecto.' }
                                            </p>
                                            </div>
                                            </CardContent>
                                            </Card>
  );
}