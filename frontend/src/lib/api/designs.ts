// src/lib/api/designs.ts

import apiClient from './client';

export interface CreateDesignData {
    name: string;
    panel_type_id: number;
    inverter_type_id?: number;
    tilt_angle: number;
    azimuth: number;
    row_spacing: number;
    module_spacing: number;
    mounting_type: string;
    ground_coverage_ratio: number;
    layout_config: any;
    total_panels: number;
    total_capacity_kw: number;
}

export interface Design {
    id: number;
    project_id: number;
    name: string;
    version: number;
    panel_type_id: number;
    inverter_type_id: number | null;
    tilt_angle: number;
    azimuth: number;
    row_spacing: number;
    module_spacing: number;
    mounting_type: string;
    ground_coverage_ratio: number;
    layout_config: any;
    total_panels: number;
    total_capacity_kw: number;
    created_at: string;
    updated_at: string | null;
}

export const designsApi = {
    // Crear nuevo diseño
    create: async (projectId: number, data: CreateDesignData): Promise<Design> => {
        const response = await apiClient.post<Design>(
            `/api/v1/solar/projects/${projectId}/designs`,
            data
        );
        return response.data;
    },

    // Obtener diseños de un proyecto
    getByProject: async (projectId: number): Promise<Design[]> => {
        const response = await apiClient.get<Design[]>(
            `/api/v1/solar/projects/${projectId}/designs`
        );
        return response.data;
    },

    // Obtener un diseño específico
    getById: async (designId: number): Promise<Design> => {
        const response = await apiClient.get<Design>(
            `/api/v1/solar/designs/${designId}`
        );
        return response.data;
    },
};