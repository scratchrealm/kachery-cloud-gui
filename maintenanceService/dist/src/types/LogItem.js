"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogItem = exports.isGetFeedInfoLogItem = exports.isGetFeedMessagesLogItem = exports.isAppendFeedMessagesLogItem = exports.isCreateFeedLogItem = exports.isPublishToPubsubChannelLogItem = exports.isSubscribeToPubsubChannelLogItem = exports.isFinalizeTaskResultUploadLogItem = exports.isInitiateTaskResultUploadLogItem = exports.isGetMutableLogItem = exports.isSetMutableLogItem = exports.isfindIpfsFileLogItem = exports.isFinalizeIpfsUploadLogItem = exports.isInitiateIpfsUploadLogItem = void 0;
const kacheryTypes_1 = require("../commonInterface/kacheryTypes");
const PubsubMessage_1 = require("./PubsubMessage");
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
    type: (0, kacheryTypes_1.isEqualTo)('findIpfsFile'),
    found: kacheryTypes_1.isBoolean,
    cid: kacheryTypes_1.isString,
    clientId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNodeId),
    projectId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isString),
    userId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isUserId),
    size: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNumber),
    url: (0, kacheryTypes_1.optional)(kacheryTypes_1.isString),
    timestamp: kacheryTypes_1.isNumber
}));
exports.isfindIpfsFileLogItem = isfindIpfsFileLogItem;
const isSetMutableLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('setMutable'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    mutableKey: kacheryTypes_1.isString,
    value: kacheryTypes_1.isString,
    alreadyExisted: kacheryTypes_1.isBoolean,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isSetMutableLogItem = isSetMutableLogItem;
const isGetMutableLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('getMutable'),
    found: kacheryTypes_1.isBoolean,
    clientId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNodeId),
    projectId: kacheryTypes_1.isString,
    userId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isUserId),
    mutableKey: kacheryTypes_1.isString,
    value: (0, kacheryTypes_1.optional)(kacheryTypes_1.isString),
    timestamp: kacheryTypes_1.isNumber
}));
exports.isGetMutableLogItem = isGetMutableLogItem;
const isInitiateTaskResultUploadLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('initiateTaskResultUpload'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    taskName: kacheryTypes_1.isString,
    taskJobId: kacheryTypes_1.isSha1Hash,
    size: kacheryTypes_1.isNumber,
    objectKey: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isInitiateTaskResultUploadLogItem = isInitiateTaskResultUploadLogItem;
const isFinalizeTaskResultUploadLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('finalizeTaskResultUpload'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    taskName: kacheryTypes_1.isString,
    taskJobId: kacheryTypes_1.isSha1Hash,
    size: kacheryTypes_1.isNumber,
    objectKey: kacheryTypes_1.isString,
    alreadyExisted: kacheryTypes_1.isBoolean,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isFinalizeTaskResultUploadLogItem = isFinalizeTaskResultUploadLogItem;
const isSubscribeToPubsubChannelLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('subscribeToPubsubChannel'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    channelName: PubsubMessage_1.isPubsubChannelName,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isSubscribeToPubsubChannelLogItem = isSubscribeToPubsubChannelLogItem;
const isPublishToPubsubChannelLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('publishToPubsubChannel'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    channelName: PubsubMessage_1.isPubsubChannelName,
    messageType: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isPublishToPubsubChannelLogItem = isPublishToPubsubChannelLogItem;
const isCreateFeedLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('createFeed'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    feedId: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isCreateFeedLogItem = isCreateFeedLogItem;
const isAppendFeedMessagesLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('appendFeedMessages'),
    clientId: kacheryTypes_1.isNodeId,
    projectId: kacheryTypes_1.isString,
    userId: kacheryTypes_1.isUserId,
    feedId: kacheryTypes_1.isString,
    numMessages: kacheryTypes_1.isNumber,
    size: kacheryTypes_1.isNumber,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isAppendFeedMessagesLogItem = isAppendFeedMessagesLogItem;
const isGetFeedMessagesLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('getFeedMessages'),
    clientId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNodeId),
    projectId: kacheryTypes_1.isString,
    userId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isUserId),
    feedId: kacheryTypes_1.isString,
    numMessages: kacheryTypes_1.isNumber,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isGetFeedMessagesLogItem = isGetFeedMessagesLogItem;
const isGetFeedInfoLogItem = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('getFeedInfo'),
    clientId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isNodeId),
    projectId: kacheryTypes_1.isString,
    userId: (0, kacheryTypes_1.optional)(kacheryTypes_1.isUserId),
    feedId: kacheryTypes_1.isString,
    timestamp: kacheryTypes_1.isNumber
}));
exports.isGetFeedInfoLogItem = isGetFeedInfoLogItem;
const isLogItem = (x) => ((0, kacheryTypes_1.isOneOf)([
    exports.isInitiateIpfsUploadLogItem,
    exports.isFinalizeIpfsUploadLogItem,
    exports.isfindIpfsFileLogItem,
    exports.isSetMutableLogItem,
    exports.isGetMutableLogItem,
    exports.isInitiateTaskResultUploadLogItem,
    exports.isFinalizeTaskResultUploadLogItem,
    exports.isSubscribeToPubsubChannelLogItem,
    exports.isPublishToPubsubChannelLogItem,
    exports.isCreateFeedLogItem,
    exports.isGetFeedInfoLogItem,
    exports.isAppendFeedMessagesLogItem,
    exports.isGetFeedMessagesLogItem
])(x));
exports.isLogItem = isLogItem;
//# sourceMappingURL=LogItem.js.map