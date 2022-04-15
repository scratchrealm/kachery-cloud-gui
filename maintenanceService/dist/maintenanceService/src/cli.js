"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sleepMsec_1 = __importDefault(require("./sleepMsec"));
const firestoreDatabase_1 = __importDefault(require("../../apiHelpers/common/firestoreDatabase"));
const LogItem_1 = require("../../src/types/LogItem");
const kacheryTypes_1 = require("../../src/commonInterface/kacheryTypes");
const isProjectUsage = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    projectId: kacheryTypes_1.isString,
    numInitializedIpfsUploads: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNumber),
    numFinalizedIpfsUploads: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNumber),
    numIpfsBytesUploaded: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNumber)
}));
const main = async () => {
    const db = (0, firestoreDatabase_1.default)();
    const usageLogColletion = db.collection('kacherycloud.usageLog');
    const projectUsagesCollection = db.collection('kacherycloud.projectUsages');
    while (true) {
        const usageByProject = {};
        const processLogItem = async (logItem) => {
            const projectId = logItem.projectId;
            if ((projectId) && (!usageByProject[projectId])) {
                const snapshot = await projectUsagesCollection.doc(projectId).get();
                const projectUsage0 = snapshot.exists ? snapshot.data() : { projectId };
                if (!isProjectUsage(projectUsage0)) {
                    console.warn(projectUsage0);
                    throw Error('Invalid project usage in database');
                }
                usageByProject[projectId] = projectUsage0;
            }
            const projectUsage = projectId ? usageByProject[projectId] : { projectId };
            if (logItem.type === 'initiateIpfsUpload') {
                projectUsage.numInitializedIpfsUploads = (projectUsage.numInitializedIpfsUploads || 0) + 1;
            }
        };
        const result = await usageLogColletion.limit(20).get();
        if (result.docs.length > 0) {
            console.log(`Processing ${result.docs.length} log items`);
            for (let usageDoc of result.docs) {
                const logItem = usageDoc.data();
                if (!(0, LogItem_1.isLogItem)(logItem)) {
                    console.warn('Invalid log item:');
                    console.warn(logItem);
                    // await usageDoc.ref.delete(); // only during development
                }
                else {
                    await processLogItem(logItem);
                }
            }
            for (let projectId in usageByProject) {
                await projectUsagesCollection.doc(projectId).set(usageByProject[projectId]);
            }
        }
        const a = await projectUsagesCollection.get();
        for (let doc of a.docs) {
            console.log('=============================');
            console.log(doc.data());
        }
        await (0, sleepMsec_1.default)(5000);
    }
};
main();
//# sourceMappingURL=cli.js.map