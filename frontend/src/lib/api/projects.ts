// src/lib/api/projects.ts

import apiClient from './client';

export interface Project {
    id: number;
    name: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    owner_id: number;
    created_at: string;
    updated_at: string | null;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
}

export const projectsApi = {
    // Obtener todos los proyectos
    getAll: async (skip = 0, limit = 100): Promise<Project[]> => {
        const { data } = await apiClient.get<Project[]>('/api/v1/projects', {
            params: { skip, limit }
        });
        return data;
    },

    // Obtener un proyecto por ID
    getById: async (id: number): Promise<Project> => {
        const { data } = await apiClient.get<Project>(`/api/v1/projects/${id}`);
        return data;
    },

    // Crear nuevo proyecto
    create: async (projectData: CreateProjectData): Promise<Project> => {
        const { data } = await apiClient.post<Project>('/api/v1/projects', projectData);
        return data;
    },

    // Actualizar proyecto
    update: async (id: number, projectData: UpdateProjectData): Promise<Project> => {
        const { data } = await apiClient.put<Project>(`/api/v1/projects/${id}`, projectData);
        return data;
    },

    // Eliminar proyecto
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/v1/projects/${id}`);
    },
};