import { isBoolean, isEqualTo, isNodeId, isNumber, isOneOf, isSha1Hash, isString, isUserId, NodeId, optional, Sha1Hash, UserId, _validateObject } from "../commonInterface/kacheryTypes";

///////////////////////////////////////////////////////////////////////////

export type InitiateIpfsUploadLogItem = {
    type: 'initiateIpfsUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    size: number
    objectKey: string
    timestamp: number
}

export const isInitiateIpfsUploadLogItem = (x: any): x is InitiateIpfsUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('initiateIpfsUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        size: isNumber,
        objectKey: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FinalizeIpfsUploadLogItem = {
    type: 'finalizeIpfsUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    size: number
    objectKey: string
    url: string
    alreadyExisted: boolean
    timestamp: number
}

export const isFinalizeIpfsUploadLogItem = (x: any): x is FinalizeIpfsUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('finalizeIpfsUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        size: isNumber,
        objectKey: isString,
        url: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FindIpfsFileLogItem = {
    type: 'findIpfsFile'
    found: boolean,
    cid: string,
    clientId?: NodeId
    projectId?: string
    userId?: UserId
    size?: number
    url?: string
    timestamp: number
}

export const isfindIpfsFileLogItem = (x: any): x is FindIpfsFileLogItem => (
    _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        cid: isString,
        clientId: optional(isNodeId),
        projectId: optional(isString),
        userId: optional(isUserId),
        size: optional(isNumber),
        url: optional(isString),
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type SetMutableLogItem = {
    type: 'setMutable'
    clientId: NodeId
    projectId: string
    userId: UserId
    mutableKey: string
    cid: string
    alreadyExisted: boolean
    timestamp: number
}

export const isSetMutableLogItem = (x: any): x is SetMutableLogItem => (
    _validateObject(x, {
        type: isEqualTo('setMutable'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        mutableKey: isString,
        cid: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type GetMutableLogItem = {
    type: 'getMutable'
    found: boolean
    clientId?: NodeId
    projectId: string
    userId?: UserId
    mutableKey: string
    cid?: string
    timestamp: number
}

export const isGetMutableLogItem = (x: any): x is GetMutableLogItem => (
    _validateObject(x, {
        type: isEqualTo('getMutable'),
        found: isBoolean,
        clientId: optional(isNodeId),
        projectId: isString,
        userId: optional(isUserId),
        mutableKey: isString,
        cid: optional(isString),
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type InitiateTaskResultUploadLogItem = {
    type: 'initiateTaskResultUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    taskType: string
    taskInputHash: Sha1Hash
    size: number
    objectKey: string
    timestamp: number
}

export const isInitiateTaskResultUploadLogItem = (x: any): x is InitiateTaskResultUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('initiateTaskResultUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        taskType: isString,
        taskInputHash: isSha1Hash,
        size: isNumber,
        objectKey: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FinalizeTaskResultUploadLogItem = {
    type: 'finalizeTaskResultUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    taskType: string
    taskInputHash: Sha1Hash
    size: number
    objectKey: string
    alreadyExisted: boolean
    timestamp: number
}

export const isFinalizeTaskResultUploadLogItem = (x: any): x is FinalizeTaskResultUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('finalizeTaskResultUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        taskType: isString,
        taskInputHash: isSha1Hash,
        size: isNumber,
        objectKey: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type LogItem =
    InitiateIpfsUploadLogItem
    | FinalizeIpfsUploadLogItem
    | FindIpfsFileLogItem
    | SetMutableLogItem
    | GetMutableLogItem
    | InitiateTaskResultUploadLogItem
    | FinalizeTaskResultUploadLogItem

export const isLogItem = (x: any): x is LogItem => (
    isOneOf([
        isInitiateIpfsUploadLogItem,
        isFinalizeIpfsUploadLogItem,
        isfindIpfsFileLogItem,
        isSetMutableLogItem,
        isGetMutableLogItem,
        isInitiateTaskResultUploadLogItem,
        isFinalizeTaskResultUploadLogItem
    ])(x)
)