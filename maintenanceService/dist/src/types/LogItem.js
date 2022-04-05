"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogItem = exports.isfindIpfsFileLogItem = exports.isFinalizeIpfsUploadLogItem = exports.isInitiateIpfsUploadLogItem = void 0;
const kacheryTypes_1 = require("../commonInterface/kacheryTypes");
const isInitiateIpfsUploadLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('initiateIpfsUpload'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    size: kacheryTypes_1.isNumber,
    objectKey: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isInitiateIpfsUploadLogItem = isInitiateIpfsUploadLogItem;
const isFinalizeIpfsUploadLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('finalizeIpfsUpload'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    size: kacheryTypes_1.isNumber,
    objectKey: kacheryTypes_1.isString,
    url: kacheryTypes_1.isString,
    alreadyExisted: kacheryTypes_1.isBoolean,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isFinalizeIpfsUploadLogItem = isFinalizeIpfsUploadLogItem;
const isfindIpfsFileLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('finalizeIpfsUpload'),
    clientId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNodeId),
    projectId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isString),
    userId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isUserId),
    size: kacheryTypes_1.isNumber,
    url: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isfindIpfsFileLogItem = isfindIpfsFileLogItem;
const isLogItem = (x) => ((0, kacheryTypes_1.isOneOf)([
    exports.isInitiateIpfsUploadLogItem,
    exports.isFinalizeIpfsUploadLogItem,
    exports.isfindIpfsFileLogItem
])(x));
exports.isLogItem = isLogItem;
//# sourceMappingURL=LogItem.js.map