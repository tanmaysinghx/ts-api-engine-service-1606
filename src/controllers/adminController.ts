import { Request, Response } from "express";
import { ConfigLoader } from "../config/ConfigLoader.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
// Controller is in src/controllers, we want project root.
// If running from dist/controllers, project root is one level up.
// Log file is 'combined.log' in project root.
const PROJECT_ROOT = path.resolve(path.dirname(__filename), '../../');

export const getConfig = async (req: Request, res: Response) => {
    try {
        const config = ConfigLoader.getInstance().getServices();
        return res.status(200).json({ success: true, data: config });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getLogs = async (req: Request, res: Response) => {
    try {
        const linesToRead = Number(req.query.lines) || 100;
        const logPath = path.join(PROJECT_ROOT, 'combined.log');

        if (!fs.existsSync(logPath)) {
            return res.status(404).json({ success: false, message: "Log file not found" });
        }

        // Simple tail implementation
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.trim().split('\n');
        const lastNLines = lines.slice(-linesToRead);

        return res.status(200).json({
            success: true,
            meta: { totalLines: lines.length, returnedLines: lastNLines.length },
            data: lastNLines
        });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
