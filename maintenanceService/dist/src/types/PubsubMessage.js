"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPubsubMessage = exports.isTaskType = exports.isTaskStatus = exports.isPubsubChannelName = void 0;
const kacheryTypes_1 = require("../commonInterface/kacheryTypes");
const isPubsubChannelName = (x) => (['requestTasks', 'provideTasks', 'feedUpdates'].includes(x));
exports.isPubsubChannelName = isPubsubChannelName;
const isTaskStatus = (x) => (['started', 'error', 'finished'].includes(x));
exports.isTaskStatus = isTaskStatus;
const isTaskType = (x) => (['calculation', 'action'].includes(x));
exports.isTaskType = isTaskType;
const isPubsubMessage = (x) => ((0, kacheryTypes_1._validateObject)(x, {
    type: (0, kacheryTypes_1.isEqualTo)('setTaskStatus'),
    taskName: kacheryTypes_1.isString,
    taskJobId: kacheryTypes_1.isSha1Hash,
    status: exports.isTaskStatus,
    errorMessage: (0, kacheryTypes_1.optional)(kacheryTypes_1.isString)
}) ||
    (0, kacheryTypes_1._validateObject)(x, {
        type: (0, kacheryTypes_1.isEqualTo)('requestTask'),
        taskType: exports.isTaskType,
        taskName: kacheryTypes_1.isString,
        taskInput: () => (true),
        taskJobId: kacheryTypes_1.isSha1Hash
    }) ||
    (0, kacheryTypes_1._validateObject)(x, {
        type: (0, kacheryTypes_1.isEqualTo)('feedMessagesAppended'),
        projectId: kacheryTypes_1.isString,
        feedId: kacheryTypes_1.isString,
        startMessageNumber: kacheryTypes_1.isNumber,
        numMessagesAppended: kacheryTypes_1.isNumber
    }));
exports.isPubsubMessage = isPubsubMessage;
//# sourceMappingURL=PubsubMessage.js.map