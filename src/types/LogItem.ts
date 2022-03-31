import { isBoolean, isEqualTo, isNodeId, isNumber, isOneOf, isString, isUserId, NodeId, optional, UserId, _validateObject } from "../commonInterface/kacheryTypes";

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

export type FinalizeIpfsdUploadLogItem = {
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

export const isFinalizeIpfsUploadLogItem = (x: any): x is FinalizeIpfsdUploadLogItem => (
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
    clientId?: NodeId
    projectId?: string
    userId?: UserId
    size: number
    url: string
    timestamp: number
}

export const isfindIpfsFileLogItem = (x: any): x is FindIpfsFileLogItem => (
    _validateObject(x, {
        type: isEqualTo('finalizeIpfsUpload'),
        clientId: optional(isNodeId),
        projectId: optional(isString),
        userId: optional(isUserId),
        size: isNumber,
        url: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type LogItem =
    InitiateIpfsUploadLogItem
    | FinalizeIpfsdUploadLogItem
    | FindIpfsFileLogItem

export const isLogItem = (x: any) => (
    isOneOf([
        isInitiateIpfsUploadLogItem,
        isFinalizeIpfsUploadLogItem,
        isfindIpfsFileLogItem
    ])
)