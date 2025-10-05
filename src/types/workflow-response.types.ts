export interface WorkflowTraceStep {
    step: string;
    status: string;
    timestamp: string;
    details?: string;
}

export interface WorkflowTiming {
    start: string;
    end: string;
    durationMs: number;
}

export interface WorkflowMeta {
    timestamp: string;
    apiVersion: string;
    engineVersion?: string;
}

export interface ConfigSummary {
    microservice?: string;
    url?: string;
    tokenCheck?: boolean;
    otpFlow?: boolean;
    notification?: boolean;
    workflowVersion?: string;
    stepCount?: number;
}

export interface WorkflowSuccessResponse {
    success: true;
    transactionId: string;
    message: string;
    configSummary: ConfigSummary & {
        microservice: string;
        url: string;
        tokenCheck: boolean;
        otpFlow: boolean;
        notification: boolean;
    };
    workflowTrace?: WorkflowTraceStep[];
    timing?: WorkflowTiming;
    diagnosticCodes?: string[];
    data: { downstreamResponse: any };
    errors: null;
    meta: WorkflowMeta;
}

export interface WorkflowErrorResponse {
    success: false;
    transactionId: string;
    message: string;
    otpGenerated?: boolean;
    configSummary?: ConfigSummary;
    workflowTrace?: WorkflowTraceStep[];
    timing?: WorkflowTiming;
    diagnosticCodes?: string[];
    data: null;
    errors: Record<string, any>;
    meta: WorkflowMeta;
}