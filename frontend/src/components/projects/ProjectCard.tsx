// src/components/projects/ProjectCard.tsx

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Calendar,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Sun
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Project } from '@/lib/api/projects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    return (
        <Card className= "hover:shadow-lg transition-shadow" >
        <CardHeader>
        <div className="flex items-start justify-between" >
            <div className="flex items-center gap-2" >
                <div className="p-2 rounded-lg bg-amber-100" >
                    <Sun className="h-5 w-5 text-amber-600" />
                        </div>
                        < div >
                        <CardTitle className="text-lg" > { project.name } </CardTitle>
                            < CardDescription className = "text-sm" >
                                { project.description || 'Sin descripción' }
                                </CardDescription>
                                </div>
                                </div>
                                < DropdownMenu >
                                <DropdownMenuTrigger asChild >
                                <Button variant="ghost" size = "icon" >
                                    <MoreVertical className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        < DropdownMenuContent align = "end" >
                                            <Link href={ `/projects/${project.id}` }>
                                                <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" />
                                                    Ver detalles
                                                        </DropdownMenuItem>
                                                        </Link>
                                                        < DropdownMenuItem onClick = {() => onEdit(project)
}>
    <Edit className="mr-2 h-4 w-4" />
        Editar
        </DropdownMenuItem>
        < DropdownMenuSeparator />
        <DropdownMenuItem 
                onClick={ () => onDelete(project) }
className = "text-red-600"
    >
    <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
        </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        </div>
        </CardHeader>
        < CardContent className = "space-y-2" >
            {(project.latitude && project.longitude) && (
                <div className="flex items-center text-sm text-muted-foreground" >
                    <MapPin className="mr-2 h-4 w-4" />
                        <span>{ project.latitude.toFixed(4) }, { project.longitude.toFixed(4) } </span>
                        </div>
        )}
<div className="flex items-center text-sm text-muted-foreground" >
    <Calendar className="mr-2 h-4 w-4" />
        <span>
        Creado { format(new Date(project.created_at), "d 'de' MMMM, yyyy", { locale: es }) }
</span>
    </div>
    </CardContent>
    < CardFooter >
    <Link href={ `/projects/${project.id}` } className = "w-full" >
        <Button className="w-full" >
            Ver proyecto
                </Button>
                </Link>
                </CardFooter>
                </Card>
  );
}