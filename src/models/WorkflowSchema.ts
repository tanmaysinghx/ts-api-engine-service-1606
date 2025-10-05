import mongoose, { Schema, Document } from "mongoose";
import { INotificationStep, NotificationStepSchema } from "./NotificationStep.js";

export interface IWorkflowDocument extends Document {
    workflowId: string;
    name: string;
    region: string;
    microserviceId: string;
    microserviceName: string;
    environment: string;
    apiVersion: string;
    downstreamEndpoint: string;
    method: string;
    tokenCheck: boolean;
    otpFlow: boolean;
    notification: boolean;
    notificationSteps: INotificationStep[];
    enabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const WorkflowSchema = new Schema<IWorkflowDocument>(
    {
        workflowId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        region: { type: String, required: true },
        microserviceId: { type: String, required: true },
        microserviceName: { type: String, required: true },
        environment: { type: String, default: "local" },
        apiVersion: { type: String, default: "v1" },
        downstreamEndpoint: { type: String, required: true },
        method: { type: String, required: true, uppercase: true },
        tokenCheck: { type: Boolean, default: false },
        otpFlow: { type: Boolean, default: false },
        notification: { type: Boolean, default: false },
        notificationSteps: { type: [NotificationStepSchema], default: [] },
        enabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IWorkflowDocument>("Workflow", WorkflowSchema);