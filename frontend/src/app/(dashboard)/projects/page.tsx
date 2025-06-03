// src/app/(dashboard)/projects/page.tsx

'use client';

const React = require('react');
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import { useProjects } from '@/lib/hooks/useProjects';
import { Project } from '@/lib/api/projects';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');


    const {
        projects,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        isCreating,
        isUpdating,
        isDeleting,
    } = useProjects();

    // Filtrar proyectos por término de búsqueda
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateOrUpdate = (data: any) => {
        if (selectedProject) {
            updateProject(
                { id: selectedProject.id, data },
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                        setSelectedProject(null);
                    },
                }
            );
        } else {
            createProject(data, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = (project: Project) => {
        setProjectToDelete(project);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            deleteProject(projectToDelete.id, {
                onSuccess: () => {
                    setProjectToDelete(null);
                },
            });
        }
    };

    return (
        <div className= "space-y-6" >
        {/* Header */ }
        < div className = "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" >
            <div>
            <h1 className="text-3xl font-bold tracking-tight" > Proyectos </h1>
                < p className = "text-muted-foreground" >
                    Gestiona todos tus proyectos de energía solar
                        </p>
                        </div>
                        < Button onClick = {() => setIsModalOpen(true)
}>
    <Plus className="mr-2 h-4 w-4" />
        Nuevo Proyecto
            </Button>
            </div>

{/* Search and Filters */ }
<Card>
    <CardContent className="p-4" >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center" >
            <div className="relative flex-1" >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                placeholder="Buscar proyectos..."
value = { searchTerm }
onChange = {(e) => setSearchTerm(e.target.value)}
className = "pl-10"
    />
    </div>
    < Button variant = "outline" size = "icon" >
        <Filter className="h-4 w-4" />
            </Button>
            </div>
            </CardContent>
            </Card>

{/* Projects Grid */ }
{
    isLoading ? (
        <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-3" >
        {
            [...Array(6)].map((_, i) => (
                <Card key= { i } >
                <CardContent className="p-6" >
            <div className="space-y-3" >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            </div>
            </CardContent>
            </Card>
            ))
        }
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
        <CardContent className= "flex flex-col items-center justify-center py-16" >
        <div className="text-center space-y-3" >
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center" >
                <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    < h3 className = "text-lg font-semibold" > No hay proyectos </h3>
                        < p className = "text-sm text-muted-foreground max-w-sm" >
                        {
                            searchTerm
                            ? 'No se encontraron proyectos que coincidan con tu búsqueda.'
                                : 'Comienza creando tu primer proyecto solar.'
                        }
                            </p>
    {
        !searchTerm && (
            <Button onClick={ () => setIsModalOpen(true) } className = "mt-4" >
                <Plus className="mr-2 h-4 w-4" />
                    Crear primer proyecto
                        </Button>
              )
    }
    </div>
        </CardContent>
        </Card>
      ) : (
        <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-3" >
        {
            filteredProjects.map((project) => (
                <ProjectCard
              key= { project.id }
              project = { project }
              onEdit = { handleEdit }
              onDelete = { handleDelete }
                />
          ))
        }
        </div>
      )
}

{/* Create/Edit Modal */ }
<ProjectFormModal
        isOpen={ isModalOpen }
onClose = {() => {
    setIsModalOpen(false);
    setSelectedProject(null);
}}
onSubmit = { handleCreateOrUpdate }
project = { selectedProject }
isLoading = { isCreating || isUpdating}
      />

{/* Delete Confirmation Dialog */ }
<AlertDialog open={ !!projectToDelete } onOpenChange = {() => setProjectToDelete(null)}>
    <AlertDialogContent>
    <AlertDialogHeader>
    <AlertDialogTitle>¿Estás seguro ? </AlertDialogTitle>
        <AlertDialogDescription>
              Esta acción no se puede deshacer.Se eliminará permanentemente el proyecto
"{projectToDelete?.name}" y todos sus diseños asociados.
            </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel>Cancelar </AlertDialogCancel>
    < AlertDialogAction
onClick = { confirmDelete }
className = "bg-red-600 hover:bg-red-700"
disabled = { isDeleting }
    >
    { isDeleting? 'Eliminando...': 'Eliminar' }
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}