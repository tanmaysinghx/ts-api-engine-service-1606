import mongoose, { Schema, Document } from "mongoose";

export type RecipientType = "email" | "mobile" | "app";

export interface IRecipient {
    type: RecipientType;
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

export interface INotificationStep extends Document {
    enabled: any;
    type: string;
    config: INotificationConfig;
}

export const RecipientSchema = new Schema<IRecipient>(
    {
        type: { type: String, enum: ["email", "mobile", "app"], required: true },
        to: { type: String, required: true },
    },
    { _id: false }
);

export const NotificationConfigSchema = new Schema<INotificationConfig>(
    {
        gearId: { type: String },
        scenarioId: { type: String },
        emailOTP: { type: Boolean, default: false },
        mobileOTP: { type: Boolean, default: false },
        appNotification: { type: Boolean, default: false },
        appTitle: { type: String },
        appMessage: { type: String },
        expirySeconds: { type: Number },
        recipients: { type: [RecipientSchema], default: [] },
    },
    { strict: false, _id: false }
);

export const NotificationStepSchema = new Schema<INotificationStep>(
    {
        type: { type: String, required: true },
        config: { type: NotificationConfigSchema, required: true },
    },
    { _id: false }
);

export default mongoose.model<INotificationStep>("NotificationStep", NotificationStepSchema);
