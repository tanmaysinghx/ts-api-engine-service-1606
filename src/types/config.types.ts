export interface IRecipient {
    type: "email" | "mobile" | "app";
    to: string;
}

export interface INotificationConfig {
    gearId?: string;
    scenarioId?: string;
    emailOTP?: boolean;
    mobileOTP?: boolean;
    appNotification?: boolean;
    appTitle?: string;
    appMessage?: string;
    expirySeconds?: number;
    recipients?: IRecipient[];
    [key: string]: any;
}

export interface INotificationStep {
    enabled?: boolean;
    type: string;
    config: INotificationConfig;
}

export interface IWorkflowConfig {
    id: string; // "login-flow"
    name: string;
    description?: string;
    path: string; // "/auth/login"
    method: string; // "POST", "GET"
    steps: {
        tokenCheck?: boolean;
        otpFlow?: boolean;
        notifications?: INotificationStep[];
        roles?: string[];
    };
    environment?: string; // "local", "docker", "prod" - override
}

export interface IServiceConfig {
    id: string; // "auth-service"
    name: string;
    description?: string;
    baseUrls: {
        [env: string]: string; // "local": "http://localhost:4000"
    };
    healthCheckUrl?: string;
    workflows: IWorkflowConfig[];
}

export interface IRegistryConfig {
    services: IServiceConfig[];
}
