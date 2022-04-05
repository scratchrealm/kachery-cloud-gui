"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sleepMsec_1 = __importDefault(require("./sleepMsec"));
const firestoreDatabase_1 = __importDefault(require("../../apiHelpers/common/firestoreDatabase"));
const LogItem_1 = require("../../src/types/LogItem");
const main = async () => {
    const db = (0, firestoreDatabase_1.default)();
    const usageLogColletion = db.collection('kacheryhub.usageLog');
    const result = await usageLogColletion.limit(20).get();
    for (let usageDoc of result.docs) {
        const logItem = usageDoc.data();
        if (!(0, LogItem_1.isLogItem)(logItem)) {
            console.warn(logItem);
            throw Error('Invalid log item in database');
        }
        console.log(logItem.type);
    }
    for (let i of [1, 2, 3]) {
        console.log(i);
        await (0, sleepMsec_1.default)(1000);
    }
};
main();
//# sourceMappingURL=cli.js.map