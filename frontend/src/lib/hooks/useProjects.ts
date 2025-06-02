// src/lib/hooks/useProjects.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi, Project, CreateProjectData, UpdateProjectData } from '@/lib/api/projects';

export const useProjects = () => {
    const queryClient = useQueryClient();

    // Query para obtener todos los proyectos
    const {
        data: projects = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll(),
    });

    // Mutation para crear proyecto
    const createProjectMutation = useMutation({
        mutationFn: projectsApi.create,
        onSuccess: (newProject) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyecto creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al crear el proyecto');
        },
    });

    // Mutation para actualizar proyecto
    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
            projectsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyecto actualizado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al actualizar el proyecto');
        },
    });

    // Mutation para eliminar proyecto
    const deleteProjectMutation = useMutation({
        mutationFn: projectsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyecto eliminado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al eliminar el proyecto');
        },
    });

    return {
        projects,
        isLoading,
        error,
        refetch,
        createProject: createProjectMutation.mutate,
        updateProject: updateProjectMutation.mutate,
        deleteProject: deleteProjectMutation.mutate,
        isCreating: createProjectMutation.isPending,
        isUpdating: updateProjectMutation.isPending,
        isDeleting: deleteProjectMutation.isPending,
    };
};

// Hook para un proyecto específico
export const useProject = (id: number) => {
    const {
        data: project,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsApi.getById(id),
        enabled: !!id,
    });

    return {
        project,
        isLoading,
        error,
    };
};