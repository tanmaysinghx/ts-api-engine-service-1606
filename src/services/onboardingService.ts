import { ConfigLoader } from "../config/ConfigLoader.js";
import { IServiceConfig, IWorkflowConfig } from "../types/config.types.js";

/**
 * Get microservice/application by ID
 * Returns a shape compatible with the old database model for UI compatibility
 */
export const getApplicationById = async (microserviceId: string): Promise<any | null> => {
    const service = ConfigLoader.getInstance().getService(microserviceId);
    if (!service) return null;
    return mapServiceToLegacyFormat(service);
};

/**
 * List all workflows for a microservice
 * Returns a shape compatible with the old database model for UI compatibility
 */
export const listWorkflowsForMicroservice = async (microserviceId: string): Promise<any[]> => {
    const service = ConfigLoader.getInstance().getService(microserviceId);
    if (!service || !service.workflows) return [];
    return service.workflows.map(wf => mapWorkflowToLegacyFormat(wf, service));
};

// -- Helpers to map YAML types to Legacy DB types for UI compatibility --

function mapServiceToLegacyFormat(service: IServiceConfig) {
    return {
        microserviceId: service.id,
        name: service.name,
        baseUrls: service.baseUrls,
        description: service.description,
        healthCheckUrl: service.healthCheckUrl,
        apiVersions: [], // Not present in new config, defaulting to empty
        createdAt: new Date().toISOString(), // Mock
        updatedAt: new Date().toISOString()  // Mock
    };
}

function mapWorkflowToLegacyFormat(workflow: IWorkflowConfig, service: IServiceConfig) {
    return {
        workflowId: workflow.id,
        name: workflow.name,
        microserviceId: service.id,
        microserviceName: service.name,
        environment: workflow.environment || "local",
        apiVersion: "v1",
        downstreamEndpoint: workflow.path,
        method: workflow.method,
        tokenCheck: workflow.steps.tokenCheck || false,
        otpFlow: workflow.steps.otpFlow || false,
        notification: (workflow.steps.notifications && workflow.steps.notifications.length > 0) || false,
        notificationSteps: workflow.steps.notifications || [],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
