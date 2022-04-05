"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChannelName = exports.subfeedHash = exports.isSubfeedHash = exports.isFeedId = exports.isNodeId = exports.isSignature = exports.isTaskFunctionType = exports.isTaskStatus = exports.toTaskId = exports.isTaskId = exports.isSha1Hash = exports.isPrivateKeyHex = exports.isPublicKeyHex = exports.isHexadecimal = exports.isKeyPair = exports.isPrivateKey = exports.isPublicKey = exports.elapsedSince = exports.zeroTimestamp = exports.nowTimestamp = exports.isTimestamp = exports.isAddress = exports.nodeLabel = exports.isNodeLabel = exports.urlString = exports.isUrlString = exports.hostName = exports.isHostName = exports.toPort = exports.portToNumber = exports.isPort = exports.isDaemonVersion = exports.mapToObject = exports.objectToMap = exports._validateObject = exports.isObjectOf = exports.isArrayOf = exports.isEqualTo = exports.optional = exports.isOneOf = exports.isBoolean = exports.isNull = exports.isNumber = exports.isFunction = exports.isString = exports.isObject = exports.isJSONSerializable = exports.tryParseJsonObject = exports.isJSONValue = exports.isJSONObject = void 0;
exports.exampleDurationMsec = exports.durationGreaterThan = exports.scaleDurationBy = exports.maxDuration = exports.minDuration = exports.addDurations = exports.unscaledDurationMsec = exports.scaledDurationMsec = exports.durationMsecToNumber = exports.isDurationMsec = exports.isBuffer = exports.urlPath = exports.toSubfeedWatches = exports.toSubfeedWatchesRAM = exports.isSubfeedWatches = exports.isSubfeedWatch = exports.messageCount = exports.messageCountToNumber = exports.isMessageCount = exports.subfeedPosition = exports.subfeedPositionToNumber = exports.isSubfeedPosition = exports.isSubfeedWatchName = exports.submittedSubfeedMessageToSubfeedMessage = exports.isSubmittedSubfeedMessage = exports.isSignedSubfeedMessage = exports.isSubfeedMessageMetaData = exports.isSubfeedMessage = exports.isFeedSubfeedId = exports.feedSubfeedId = exports.feedName = exports.isFeedName = exports.channelLabel = exports.isChannelLabel = exports.isRequestId = exports.isFindFileResult = exports.isFindLiveFeedResult = exports.fileKeyHash = exports.isFileKeyHash = exports.isFileKey = exports.errorMessage = exports.isErrorMessage = exports.taskKwargs = exports.isTaskKwargs = exports.userId = exports.isUserId = exports.pubsubChannelName = exports.isPubsubChannelName = exports.isTaskFunctionId = exports.channelName = void 0;
exports.isUserConfig = exports.publicKeyHexToNodeId = exports.feedIdToPublicKeyHex = exports.nodeIdToPublicKeyHex = exports.publicKeyHexToFeedId = exports.JSONStringifyDeterministic = exports.sha1OfString = exports.sha1OfObject = exports.pathifyHash = exports.channelUrl = exports.isChannelUrl = exports.isFileManifest = exports.isFileManifestChunk = exports.localFilePath = exports.exampleByteCount = exports.addByteCount = exports.byteCount = exports.byteCountToNumber = exports.isByteCount = void 0;
const assert_1 = __importDefault(require("assert"));
const crypto_1 = __importDefault(require("crypto"));
const isJSONObject = (x) => {
    if (!(0, exports.isObject)(x))
        return false;
    return (0, exports.isJSONSerializable)(x);
};
exports.isJSONObject = isJSONObject;
const isJSONValue = (x) => {
    return (0, exports.isJSONSerializable)(x);
};
exports.isJSONValue = isJSONValue;
const tryParseJsonObject = (x) => {
    let a;
    try {
        a = JSON.parse(x);
    }
    catch {
        return null;
    }
    if (!(0, exports.isJSONObject)(a))
        return null;
    return a;
};
exports.tryParseJsonObject = tryParseJsonObject;
const isJSONSerializable = (obj) => {
    if (typeof (obj) === 'string')
        return true;
    if (typeof (obj) === 'number')
        return true;
    if (!(0, exports.isObject)(obj))
        return false;
    const isPlainObject = (a) => {
        return Object.prototype.toString.call(a) === '[object Object]';
    };
    const isPlain = (a) => {
        return (a === null) || (typeof a === 'undefined' || typeof a === 'string' || typeof a === 'boolean' || typeof a === 'number' || Array.isArray(a) || isPlainObject(a));
    };
    if (!isPlain(obj)) {
        return false;
    }
    for (let property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (!isPlain(obj[property])) {
                return false;
            }
            if (obj[property] !== null) {
                if (typeof obj[property] === "object") {
                    if (!(0, exports.isJSONSerializable)(obj[property])) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};
exports.isJSONSerializable = isJSONSerializable;
// object
const isObject = (x) => {
    return ((x !== null) && (typeof x === 'object'));
};
exports.isObject = isObject;
// string
const isString = (x) => {
    return ((x !== null) && (typeof x === 'string'));
};
exports.isString = isString;
// function
const isFunction = (x) => {
    return ((x !== null) && (typeof x === 'function'));
};
exports.isFunction = isFunction;
// number
const isNumber = (x) => {
    return ((x !== null) && (typeof x === 'number'));
};
exports.isNumber = isNumber;
// null
const isNull = (x) => {
    return x === null;
};
exports.isNull = isNull;
// boolean
const isBoolean = (x) => {
    return ((x !== null) && (typeof x === 'boolean'));
};
exports.isBoolean = isBoolean;
// isOneOf
const isOneOf = (testFunctions) => {
    return (x) => {
        for (let tf of testFunctions) {
            if (tf(x))
                return true;
        }
        return false;
    };
};
exports.isOneOf = isOneOf;
const optional = (testFunctionOrSpec) => {
    if ((0, exports.isFunction)(testFunctionOrSpec)) {
        const testFunction = testFunctionOrSpec;
        return (x) => {
            return ((x === undefined) || (testFunction(x)));
        };
    }
    else {
        return (x) => {
            const obj = testFunctionOrSpec;
            return ((x === undefined) || ((0, exports._validateObject)(x, obj)));
        };
    }
};
exports.optional = optional;
// isEqualTo
const isEqualTo = (value) => {
    return (x) => {
        return x === value;
    };
};
exports.isEqualTo = isEqualTo;
// isArrayOf
const isArrayOf = (testFunction) => {
    return (x) => {
        if ((x !== null) && (Array.isArray(x))) {
            for (let a of x) {
                if (!testFunction(a))
                    return false;
            }
            return true;
        }
        else
            return false;
    };
};
exports.isArrayOf = isArrayOf;
// isObjectOf
const isObjectOf = (keyTestFunction, valueTestFunction) => {
    return (x) => {
        if ((0, exports.isObject)(x)) {
            for (let k in x) {
                if (!keyTestFunction(k))
                    return false;
                if (!valueTestFunction(x[k]))
                    return false;
            }
            return true;
        }
        else
            return false;
    };
};
exports.isObjectOf = isObjectOf;
const _validateObject = (x, spec, opts) => {
    const o = opts || {};
    if (!x) {
        o.callback && o.callback('x is undefined/null.');
        return false;
    }
    if (typeof (x) !== 'object') {
        o.callback && o.callback('x is not an Object.');
        return false;
    }
    for (let k in x) {
        if (!(k in spec)) {
            if (!o.allowAdditionalFields) {
                o.callback && o.callback(`Key not in spec: ${k}`);
                return false;
            }
        }
    }
    for (let k in spec) {
        const specK = spec[k];
        if ((0, exports.isFunction)(specK)) {
            if (!specK(x[k])) {
                o.callback && o.callback(`Problem validating: ${k}`);
                return false;
            }
        }
        else {
            if (!(k in x)) {
                o.callback && o.callback(`Key not in x: ${k}`);
                return false;
            }
            if (!(0, exports._validateObject)(x[k], specK, { callback: o.callback })) {
                o.callback && o.callback(`Value of key > ${k} < itself failed validation.`);
                return false;
            }
        }
    }
    return true;
};
exports._validateObject = _validateObject;
// objectToMap and mapToObject
const objectToMap = (obj) => {
    return new Map(Object.keys(obj).map(k => {
        return [k, obj[k]];
    }));
};
exports.objectToMap = objectToMap;
const mapToObject = (m) => {
    const ret = {};
    m.forEach((v, k) => {
        ret[k.toString()] = v;
    });
    return ret;
};
exports.mapToObject = mapToObject;
const isDaemonVersion = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (/^[0-9a-zA-z. -]{4,40}?$/.test(x));
};
exports.isDaemonVersion = isDaemonVersion;
const isPort = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    return x > 0 && x < 65536; // port numbers must be in 16-bit positive range
};
exports.isPort = isPort;
const portToNumber = (x) => {
    return x;
};
exports.portToNumber = portToNumber;
const toPort = (x) => {
    if (!(0, exports.isPort)(x))
        throw Error(`Not a valid port: ${x}`);
    return x;
};
exports.toPort = toPort;
const isHostName = (x) => {
    // can we be even more precise here? e.g. restrict number of elements?
    if (!(0, exports.isString)(x))
        return false;
    let result = true;
    x.split(".").forEach((element) => {
        if (element.length === 0)
            result = false;
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(element))
            result = false;
    });
    // we cannot short-circuit by returning false from the anonymous function in the forEach loop.
    // Doing so returns false *from that function*, then ignores the result (since nothing is checking
    // the result of the anonymous function) and moves on to check the next chunk.
    return result;
};
exports.isHostName = isHostName;
const hostName = (x) => {
    if (!(0, exports.isHostName)(x))
        throw Error(`Not a valid host name: ${x}`);
    return x;
};
exports.hostName = hostName;
const isUrlString = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if ((x.startsWith('http://') || (x.startsWith('https://')))) {
        if (x.length > 10000)
            return false;
        return true;
    }
    else {
        return false;
    }
};
exports.isUrlString = isUrlString;
const urlString = (x) => {
    if (!(0, exports.isUrlString)(x))
        throw Error(`Not a valid url string: ${x}`);
    return x;
};
exports.urlString = urlString;
const isNodeLabel = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 20)
        return false;
    let result = true;
    x.split(".").forEach((element) => {
        if (element.length === 0)
            result = false;
        if (!/^[a-zA-Z0-9@]([a-zA-Z0-9@-]*[a-zA-Z0-9@])?$/.test(element))
            result = false;
    });
    return result;
};
exports.isNodeLabel = isNodeLabel;
const nodeLabel = (x) => {
    if (!(0, exports.isNodeLabel)(x))
        throw Error(`Not a valid node label: ${x}`);
    return x;
};
exports.nodeLabel = nodeLabel;
const isAddress = (x) => {
    if (!(0, exports._validateObject)(x, {
        hostName: (0, exports.optional)(exports.isHostName),
        port: (0, exports.optional)(exports.isPort),
        url: (0, exports.optional)(exports.isUrlString)
    })) {
        return false;
    }
    if ((x.hostName) && (x.port)) {
        return x.url ? false : true;
    }
    else if (x.url) {
        return ((x.hostName) || (x.port)) ? false : true;
    }
    else {
        return false;
    }
};
exports.isAddress = isAddress;
const isTimestamp = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    if (x < 0)
        return false; // For our purposes, timestamps should never be negative
    if (!Number.isInteger(x))
        return false; // our timestamps should be whole numbers
    return true;
};
exports.isTimestamp = isTimestamp;
const nowTimestamp = () => {
    const ret = Number(new Date()) - 0;
    return ret;
};
exports.nowTimestamp = nowTimestamp;
const zeroTimestamp = () => {
    return 0;
};
exports.zeroTimestamp = zeroTimestamp;
const elapsedSince = (timestamp) => {
    return (0, exports.nowTimestamp)() - timestamp;
};
exports.elapsedSince = elapsedSince;
const isPublicKey = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return checkKeyblockHeader(x, 'PUBLIC');
};
exports.isPublicKey = isPublicKey;
const isPrivateKey = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return checkKeyblockHeader(x, 'PRIVATE');
};
exports.isPrivateKey = isPrivateKey;
const checkKeyblockHeader = (key, type) => {
    // note we need to double-escape the backslashes here.
    const pattern = new RegExp(`-----BEGIN ${type} KEY-----[\\s\\S]*-----END ${type} KEY-----\n*$`);
    return (pattern.test(key));
};
const isKeyPair = (x) => {
    return (0, exports._validateObject)(x, {
        publicKey: exports.isPublicKey,
        privateKey: exports.isPrivateKey
    });
};
exports.isKeyPair = isKeyPair;
const isHexadecimal = (x, length) => {
    const basePattern = '[0-9a-fA-F]';
    let pattern = `^${basePattern}*$`;
    if (length !== undefined) {
        (0, assert_1.default)(Number.isInteger(length));
        (0, assert_1.default)(length > 0);
        pattern = `^${basePattern}{${length}}$`;
    }
    const regex = new RegExp(pattern);
    return (regex.test(x));
};
exports.isHexadecimal = isHexadecimal;
const isPublicKeyHex = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 64);
};
exports.isPublicKeyHex = isPublicKeyHex;
const isPrivateKeyHex = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 64);
};
exports.isPrivateKeyHex = isPrivateKeyHex;
const isSha1Hash = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 40); // Sha1 should be 40 hex characters
};
exports.isSha1Hash = isSha1Hash;
const isTaskId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 40)
        return false;
    return true;
};
exports.isTaskId = isTaskId;
const toTaskId = (x) => {
    if (!(0, exports.isTaskId)(x)) {
        throw Error(`Not a valid task ID: ${x}`);
    }
    return x;
};
exports.toTaskId = toTaskId;
const isTaskStatus = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return ['waiting', 'pending', 'queued', 'running', 'finished', 'error'].includes(x);
};
exports.isTaskStatus = isTaskStatus;
const isTaskFunctionType = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return ['pure-calculation', 'query', 'action'].includes(x);
};
exports.isTaskFunctionType = isTaskFunctionType;
const isSignature = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 128);
};
exports.isSignature = isSignature;
const isNodeId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 64);
};
exports.isNodeId = isNodeId;
const isFeedId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (0, exports.isHexadecimal)(x, 64);
};
exports.isFeedId = isFeedId;
const isSubfeedHash = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (/^[0-9a-fA-F]{40}?$/.test(x));
};
exports.isSubfeedHash = isSubfeedHash;
const subfeedHash = (x) => {
    if ((0, exports.isSubfeedHash)(x))
        return x;
    else
        throw Error(`Invalid subfeed hash: ${x}`);
};
exports.subfeedHash = subfeedHash;
const isChannelName = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 40)
        return false;
    if (x.length < 3)
        return false;
    let result = true;
    x.split(".").forEach((element) => {
        if (element.length === 0)
            result = false;
        if (!/^[a-zA-Z0-9_-]([a-zA-Z0-9_-]*[a-zA-Z0-9_-])?$/.test(element))
            result = false;
    });
    return result;
};
exports.isChannelName = isChannelName;
const channelName = (x) => {
    if (!(0, exports.isChannelName)(x))
        throw Error(`Invalid channel name: ${x}`);
    return x;
};
exports.channelName = channelName;
const isTaskFunctionId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 400)
        return false;
    let result = true;
    x.split(".").forEach((element) => {
        if (element.length === 0)
            result = false;
        if (!/^[a-zA-Z0-9@_-]([a-zA-Z0-9@_-]*[a-zA-Z0-9@_-])?$/.test(element))
            result = false;
    });
    return result;
};
exports.isTaskFunctionId = isTaskFunctionId;
const isPubsubChannelName = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 40)
        return false;
    return true;
};
exports.isPubsubChannelName = isPubsubChannelName;
const pubsubChannelName = (x) => {
    if (!(0, exports.isPubsubChannelName)(x))
        throw Error(`Invalid pubsub channel name: ${x}`);
    return x;
};
exports.pubsubChannelName = pubsubChannelName;
const isUserId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if (x.length > 80)
        return false;
    return true;
};
exports.isUserId = isUserId;
const userId = (x) => {
    if (!(0, exports.isUserId)(x))
        throw Error(`Invalid user ID: ${x}`);
    return x;
};
exports.userId = userId;
const isTaskKwargs = (x) => {
    if (!(0, exports.isJSONObject)(x))
        return false;
    return true;
};
exports.isTaskKwargs = isTaskKwargs;
const taskKwargs = (x) => {
    if (!(0, exports.isTaskKwargs)(x))
        throw Error('Invalid task kwargs');
    return x;
};
exports.taskKwargs = taskKwargs;
const isErrorMessage = (x) => {
    return ((0, exports.isString)(x)) && (x.length < 1000);
};
exports.isErrorMessage = isErrorMessage;
const errorMessage = (x) => {
    if ((0, exports.isErrorMessage)(x))
        return x;
    else {
        throw Error('Invalid error message: messages cannot exceed 1000 characters.');
    }
};
exports.errorMessage = errorMessage;
const isFileKey = (x) => {
    return (0, exports._validateObject)(x, {
        sha1: exports.isSha1Hash,
        manifestSha1: (0, exports.optional)(exports.isSha1Hash),
        chunkOf: (0, exports.optional)({
            fileKey: exports.isFileKey,
            startByte: exports.isByteCount,
            endByte: exports.isByteCount
        })
    });
};
exports.isFileKey = isFileKey;
const isFileKeyHash = (x) => {
    return (0, exports.isSha1Hash)(x) ? true : false;
};
exports.isFileKeyHash = isFileKeyHash;
const fileKeyHash = (fileKey) => {
    return (0, exports.sha1OfObject)(fileKey);
};
exports.fileKeyHash = fileKeyHash;
const isFindLiveFeedResult = (x) => {
    return (0, exports._validateObject)(x, {
        nodeId: exports.isNodeId
    });
};
exports.isFindLiveFeedResult = isFindLiveFeedResult;
const isFindFileResult = (x) => {
    if (!(0, exports._validateObject)(x, {
        nodeId: exports.isNodeId,
        fileKey: exports.isFileKey,
        fileSize: exports.isByteCount
    }))
        return false;
    return (x.fileSize >= 0);
};
exports.isFindFileResult = isFindFileResult;
const isRequestId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (/^[A-Za-z]{10}$/.test(x));
};
exports.isRequestId = isRequestId;
const isChannelLabel = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return (/^[0-9a-zA-Z_\-.]{4,160}?$/.test(x));
};
exports.isChannelLabel = isChannelLabel;
const channelLabel = (x) => {
    if (!(0, exports.isChannelLabel)(x)) {
        throw Error(`Invalid channel label: ${x}`);
    }
    return x;
};
exports.channelLabel = channelLabel;
const isFeedName = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return ((x.length > 0) && (x.length <= 100));
};
exports.isFeedName = isFeedName;
const feedName = (x) => {
    if ((0, exports.isFeedName)(x))
        return x;
    else
        throw Error(`Invalid feed name: ${x}`);
};
exports.feedName = feedName;
const feedSubfeedId = (feedId, subfeedHash, channelName) => {
    return (feedId.toString() + ':' + subfeedHash.toString() + ':' + channelName.toString());
};
exports.feedSubfeedId = feedSubfeedId;
const isFeedSubfeedId = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    const parts = x.split(':');
    return (parts.length === 2) &&
        ((0, exports.isFeedId)(parts[0])) &&
        ((0, exports.isSubfeedHash)(parts[1]));
};
exports.isFeedSubfeedId = isFeedSubfeedId;
;
const isSubfeedMessage = (x) => {
    return (0, exports.isObject)(x);
};
exports.isSubfeedMessage = isSubfeedMessage;
const isSubfeedMessageMetaData = (x) => {
    return (0, exports.isObject)(x);
};
exports.isSubfeedMessageMetaData = isSubfeedMessageMetaData;
const isSignedSubfeedMessage = (x) => {
    if (!(0, exports._validateObject)(x, {
        body: {
            previousSignature: (0, exports.optional)(exports.isSignature),
            messageNumber: exports.isNumber,
            message: exports.isObject,
            timestamp: exports.isTimestamp,
            metaData: (0, exports.optional)(exports.isSubfeedMessageMetaData)
        },
        signature: exports.isSignature
    }))
        return false;
    return true;
};
exports.isSignedSubfeedMessage = isSignedSubfeedMessage;
;
const isSubmittedSubfeedMessage = (x) => {
    return (((0, exports.isJSONObject)(x)) && (JSON.stringify(x).length < 10000));
};
exports.isSubmittedSubfeedMessage = isSubmittedSubfeedMessage;
const submittedSubfeedMessageToSubfeedMessage = (x) => {
    return x;
};
exports.submittedSubfeedMessageToSubfeedMessage = submittedSubfeedMessageToSubfeedMessage;
const isSubfeedWatchName = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    return x.length > 0;
};
exports.isSubfeedWatchName = isSubfeedWatchName;
const isSubfeedPosition = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    return (x >= 0);
};
exports.isSubfeedPosition = isSubfeedPosition;
const subfeedPositionToNumber = (x) => {
    return x;
};
exports.subfeedPositionToNumber = subfeedPositionToNumber;
const subfeedPosition = (x) => {
    return x;
};
exports.subfeedPosition = subfeedPosition;
const isMessageCount = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    return (x >= 0);
};
exports.isMessageCount = isMessageCount;
const messageCountToNumber = (x) => {
    return x;
};
exports.messageCountToNumber = messageCountToNumber;
const messageCount = (x) => {
    return x;
};
exports.messageCount = messageCount;
const isSubfeedWatch = (x) => {
    return (0, exports._validateObject)(x, {
        feedId: exports.isFeedId,
        subfeedHash: exports.isSubfeedHash,
        position: exports.isSubfeedPosition,
        channelName: exports.isString
    });
};
exports.isSubfeedWatch = isSubfeedWatch;
const isSubfeedWatches = (x) => {
    return (0, exports.isObjectOf)(exports.isSubfeedWatchName, exports.isSubfeedWatch)(x);
};
exports.isSubfeedWatches = isSubfeedWatches;
const toSubfeedWatchesRAM = (x) => {
    return (0, exports.objectToMap)(x);
};
exports.toSubfeedWatchesRAM = toSubfeedWatchesRAM;
const toSubfeedWatches = (x) => {
    return (0, exports.mapToObject)(x);
};
exports.toSubfeedWatches = toSubfeedWatches;
const urlPath = (x) => {
    return x;
};
exports.urlPath = urlPath;
const isBuffer = (x) => {
    return ((x !== null) && (x instanceof Buffer));
};
exports.isBuffer = isBuffer;
const isDurationMsec = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    if (x < 0)
        return false;
    return true;
};
exports.isDurationMsec = isDurationMsec;
const durationMsecToNumber = (x) => {
    return x;
};
exports.durationMsecToNumber = durationMsecToNumber;
const scaledDurationMsec = (n) => {
    if (process.env.KACHERY_TEST_SPEEDUP_FACTOR) {
        n /= Number(process.env.KACHERY_TEST_SPEEDUP_FACTOR);
    }
    return n;
};
exports.scaledDurationMsec = scaledDurationMsec;
const unscaledDurationMsec = (n) => {
    return n;
};
exports.unscaledDurationMsec = unscaledDurationMsec;
const addDurations = (a, b) => {
    return (a + b);
};
exports.addDurations = addDurations;
const minDuration = (a, b) => {
    return Math.min(a, b);
};
exports.minDuration = minDuration;
const maxDuration = (a, b) => {
    return Math.max(a, b);
};
exports.maxDuration = maxDuration;
const scaleDurationBy = (a, factor) => {
    return a * factor;
};
exports.scaleDurationBy = scaleDurationBy;
const durationGreaterThan = (a, b) => {
    return a > b;
};
exports.durationGreaterThan = durationGreaterThan;
exports.exampleDurationMsec = (0, exports.scaledDurationMsec)(3000);
const isByteCount = (x) => {
    if (!(0, exports.isNumber)(x))
        return false;
    if (x < 0)
        return false;
    return true;
};
exports.isByteCount = isByteCount;
const byteCountToNumber = (x) => {
    return x;
};
exports.byteCountToNumber = byteCountToNumber;
const byteCount = (n) => {
    return n;
};
exports.byteCount = byteCount;
const addByteCount = (n1, n2) => {
    return (0, exports.byteCount)((0, exports.byteCountToNumber)(n1) + (0, exports.byteCountToNumber)(n2));
};
exports.addByteCount = addByteCount;
exports.exampleByteCount = (0, exports.byteCount)(4000);
const localFilePath = (p) => {
    return p;
};
exports.localFilePath = localFilePath;
const isFileManifestChunk = (x) => {
    return (0, exports._validateObject)(x, {
        start: exports.isByteCount,
        end: exports.isByteCount,
        sha1: exports.isSha1Hash
    });
};
exports.isFileManifestChunk = isFileManifestChunk;
const isFileManifest = (x) => {
    return (0, exports._validateObject)(x, {
        size: exports.isByteCount,
        sha1: exports.isSha1Hash,
        chunks: (0, exports.isArrayOf)(exports.isFileManifestChunk)
    });
};
exports.isFileManifest = isFileManifest;
const isChannelUrl = (x) => {
    if (!(0, exports.isString)(x))
        return false;
    if ((x.startsWith('http://') || (x.startsWith('https://')))) {
        if (x.length > 500)
            return false;
        return true;
    }
    else {
        return false;
    }
};
exports.isChannelUrl = isChannelUrl;
const channelUrl = (x) => {
    if (!(0, exports.isChannelUrl)(x))
        throw Error(`Not a valid channel config url string: ${x}`);
    return x;
};
exports.channelUrl = channelUrl;
const pathifyHash = (x) => {
    return `${x[0]}${x[1]}/${x[2]}${x[3]}/${x[4]}${x[5]}/${x}`;
};
exports.pathifyHash = pathifyHash;
const sha1OfObject = (x) => {
    return (0, exports.sha1OfString)((0, exports.JSONStringifyDeterministic)(x));
};
exports.sha1OfObject = sha1OfObject;
const sha1OfString = (x) => {
    const sha1sum = crypto_1.default.createHash('sha1');
    sha1sum.update(x);
    return sha1sum.digest('hex');
};
exports.sha1OfString = sha1OfString;
// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
const JSONStringifyDeterministic = (obj, space = undefined) => {
    var allKeys = [];
    JSON.stringify(obj, function (key, value) { allKeys.push(key); return value; });
    allKeys.sort();
    return JSON.stringify(obj, allKeys, space);
};
exports.JSONStringifyDeterministic = JSONStringifyDeterministic;
const publicKeyHexToFeedId = (publicKeyHex) => {
    return publicKeyHex;
};
exports.publicKeyHexToFeedId = publicKeyHexToFeedId;
const nodeIdToPublicKeyHex = (nodeId) => {
    return nodeId.toString();
};
exports.nodeIdToPublicKeyHex = nodeIdToPublicKeyHex;
const feedIdToPublicKeyHex = (feedId) => {
    return feedId;
};
exports.feedIdToPublicKeyHex = feedIdToPublicKeyHex;
const publicKeyHexToNodeId = (x) => {
    return x;
};
exports.publicKeyHexToNodeId = publicKeyHexToNodeId;
const isUserConfig = (x) => {
    return (0, exports._validateObject)(x, {
        admin: (0, exports.optional)(exports.isBoolean)
    }, {
        allowAdditionalFields: true
    });
};
exports.isUserConfig = isUserConfig;
//# sourceMappingURL=kacheryTypes.js.map