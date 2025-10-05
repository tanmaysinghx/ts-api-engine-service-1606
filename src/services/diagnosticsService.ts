// import WorkflowInstance from "../models/WorkflowInstance";

// export class DiagnosticsService {
//     async getDiagnostics(transactionId: string) {
//         const instance = await WorkflowInstance.findOne({ transactionId });
//         if (!instance)
//             return { status: 404, body: { message: "Transaction not found", transactionId } };

//         return {
//             status: 200,
//             body: {
//                 transactionId,
//                 status: instance.status,
//                 stepsExecuted: instance.stepsExecuted,
//                 createdAt: instance.createdAt,
//                 updatedAt: instance.updatedAt,
//                 analytics: instance.analytics || {},
//             },
//         };
//     }
// }