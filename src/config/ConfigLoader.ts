import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { IRegistryConfig, IServiceConfig, IWorkflowConfig } from '../types/config.types.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConfigLoader {
    private static instance: ConfigLoader;
    private config: IRegistryConfig;
    private configPath: string;

    private constructor() {
        this.configPath = path.resolve(__dirname, 'registry.yaml');
        this.config = this.loadConfig();
    }

    public static getInstance(): ConfigLoader {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }

    private loadConfig(): IRegistryConfig {
        try {
            const fileContents = fs.readFileSync(this.configPath, 'utf8');
            const data = yaml.load(fileContents) as IRegistryConfig;
            console.log(`✅ Loaded configuration from ${this.configPath}`);
            return data;
        } catch (e) {
            console.error(`❌ Failed to load configuration: ${e}`);
            // Return empty config to prevent crash if file is missing/invalid
            return { services: [] };
        }
    }

    public reload(): void {
        this.config = this.loadConfig();
    }

    public getServices(): IServiceConfig[] {
        return this.config.services || [];
    }

    public getService(serviceId: string): IServiceConfig | undefined {
        return this.config.services.find(s => s.id === serviceId);
    }

    public getWorkflow(workflowId: string): { workflow: IWorkflowConfig, service: IServiceConfig } | undefined {
        for (const service of this.config.services) {
            if (service.workflows) {
                const workflow = service.workflows.find(w => w.id === workflowId);
                if (workflow) {
                    return { workflow, service };
                }
            }
        }
        return undefined;
    }
}
