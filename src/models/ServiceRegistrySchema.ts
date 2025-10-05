import mongoose, { Schema, Document } from "mongoose";

export interface IServiceRegistry extends Document {
    microserviceId: string; // e.g. 1625
    name: string;           // e.g. "auth-service"
    baseUrls: {
        [env: string]: string; // e.g. { local: "http://localhost:1625", docker: "http://ts-auth-service-1625:1625" }
    };
    apiVersions: string[];   // e.g. ["v1", "v2"]
    description?: string;
    healthCheckUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ServiceRegistrySchema = new Schema<IServiceRegistry>(
    {
        microserviceId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        baseUrls: { type: Map, of: String, required: true },
        apiVersions: { type: [String], default: [] },
        description: { type: String },
        healthCheckUrl: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IServiceRegistry>("ServiceRegistry", ServiceRegistrySchema);