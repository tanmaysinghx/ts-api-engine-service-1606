import ServiceRegistry, { IServiceRegistry } from "../models/ServiceRegistrySchema.js";
import Workflow, { IWorkflowDocument } from "../models/WorkflowSchema.js";

/**
 * Onboard or update a microservice/application
 */
export const onboardApplication = async (microserviceId: string, data: Partial<IServiceRegistry>): Promise<IServiceRegistry> => {
    let service = await ServiceRegistry.findOne({ microserviceId });

    if (service) {
        service.name = data.name || service.name;
        service.baseUrls = data.baseUrls || service.baseUrls;
        service.apiVersions = data.apiVersions || service.apiVersions;
        service.description = data.description || service.description;
        service.healthCheckUrl = data.healthCheckUrl || service.healthCheckUrl;
        await service.save();
    } else {
        service = new ServiceRegistry({ microserviceId, ...data });
        await service.save();
    }

    return service;
};

/**
 * Get microservice/application by ID
 */
export const getApplicationById = async (microserviceId: string): Promise<IServiceRegistry | null> => {
    return ServiceRegistry.findOne({ microserviceId });
};

/**
 * Onboard or update a workflow/service endpoint under a microservice
 */
export const onboardWorkflow = async (microserviceId: string, workflowData: Partial<IWorkflowDocument>
): Promise<IWorkflowDocument> => {
    // Ensure microservice exists
    const svc = await ServiceRegistry.findOne({ microserviceId });
    if (!svc) throw new Error("Microservice not registered. Please onboard it first.");

    workflowData.microserviceId = svc.microserviceId;
    workflowData.microserviceName = svc.name;

    let workflow = await Workflow.findOne({ workflowId: workflowData.workflowId });

    if (workflow) {
        workflow.set(workflowData);
        await workflow.save();
    } else {
        workflow = new Workflow(workflowData);
        await workflow.save();
    }

    return workflow;
};

/**
 * List all workflows for a microservice
 */
export const listWorkflowsForMicroservice = async (microserviceId: string): Promise<IWorkflowDocument[]> => {
    return Workflow.find({ microserviceId });
};
