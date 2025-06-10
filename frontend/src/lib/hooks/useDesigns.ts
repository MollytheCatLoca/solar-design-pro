// src/lib/hooks/useDesigns.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { designsApi, Design, CreateDesignData } from '@/lib/api/designs';

// Hook para obtener diseños de un proyecto
export const useProjectDesigns = (projectId: number) => {
    const {
        data: designs = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['designs', 'project', projectId],
        queryFn: () => designsApi.getByProject(projectId),
        enabled: !!projectId,
    });

    return {
        designs,
        isLoading,
        error,
        refetch
    };
};

// Hook para un diseño específico
export const useDesign = (designId: number) => {
    const {
        data: design,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['design', designId],
        queryFn: () => designsApi.getById(designId),
        enabled: !!designId,
    });

    return {
        design,
        isLoading,
        error,
    };
};

// Hook para operaciones CRUD de diseños
export const useDesigns = () => {
    const queryClient = useQueryClient();

    // Mutation para crear diseño
    const createDesignMutation = useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: CreateDesignData }) =>
            designsApi.create(projectId, data),
        onSuccess: (newDesign) => {
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            toast.success('Diseño guardado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al guardar el diseño');
        },
    });

    // Mutation para actualizar diseño
    const updateDesignMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Design> }) =>
            designsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            toast.success('Diseño actualizado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al actualizar el diseño');
        },
    });

    // Mutation para eliminar diseño
    const deleteDesignMutation = useMutation({
        mutationFn: designsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            toast.success('Diseño eliminado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al eliminar el diseño');
        },
    });

    // Mutation para clonar diseño
    const cloneDesignMutation = useMutation({
        mutationFn: designsApi.clone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            toast.success('Diseño clonado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al clonar el diseño');
        },
    });

    return {
        createDesign: createDesignMutation.mutate,
        updateDesign: updateDesignMutation.mutate,
        deleteDesign: deleteDesignMutation.mutate,
        cloneDesign: cloneDesignMutation.mutate,
        isCreating: createDesignMutation.isPending,
        isUpdating: updateDesignMutation.isPending,
        isDeleting: deleteDesignMutation.isPending,
        isCloning: cloneDesignMutation.isPending,
    };
};