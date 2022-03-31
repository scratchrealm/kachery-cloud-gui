import { isArrayOf, isBoolean, isEqualTo, isNodeId, isNumber, isOneOf, isSignature, isString, NodeId, optional, Signature, _validateObject } from "../commonInterface/kacheryTypes"
import { Client, isClient } from "./Client"
import { isProject, Project } from "./Project"
import { isProjectMembership, ProjectMembership } from "./ProjectMembership"
import { isUserSettings, UserSettings } from "./User"

//////////////////////////////////////////////////////////////////////////////////
// getClientInfo

export type GetClientInfoRequest = {
    payload: {
        type: 'getClientInfo'
        timestamp: number
        clientId: NodeId
    }
    fromClientId: NodeId
    signature: Signature
}

export const isGetClientInfoRequest = (x: any): x is GetClientInfoRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getClientInfo'),
            timestamp: isNumber,
            clientId: isNodeId
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type GetClientInfoResponse = {
    type: 'getClientInfo'
    found: boolean
    client?: Client
    projects?: Project[]
    projectMemberships?: ProjectMembership[]
    userSettings?: UserSettings
}

export const isGetClientInfoResponse = (x: any): x is GetClientInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getClientInfo'),
        found: isBoolean,
        client: optional(isClient),
        projects: optional(isArrayOf(isProject)),
        projectMemberships: optional(isArrayOf(isProjectMembership)),
        userSettings: optional(isUserSettings)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// initiateIpfsUpload

export type InitiateIpfsUploadRequest = {
    payload: {
        type: 'initiateIpfsUpload'
        timestamp: number
        size: number
    }
    fromClientId: NodeId
    signature: Signature
}

export const isInitiateIpfsUploadRequest = (x: any): x is InitiateIpfsUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('initiateIpfsUpload'),
            timestamp: isNumber,
            size: isNumber
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type InitiateIpfsUploadResponse = {
    type: 'initiateIpfsUpload'
    signedUploadUrl: string
    objectKey: string
}

export const isInitiateIpfsUploadResponse = (x: any): x is InitiateIpfsUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('initiateIpfsUpload'),
        signedUploadUrl: isString,
        objectKey: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// finalizeIpfsUpload

export type FinalizeIpfsUploadRequest = {
    payload: {
        type: 'finalizeIpfsUpload'
        timestamp: number
        objectKey: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isFinalizeIpfsUploadRequest = (x: any): x is FinalizeIpfsUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('finalizeIpfsUpload'),
            timestamp: isNumber,
            objectKey: isString
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type FinalizeIpfsUploadResponse = {
    type: 'finalizeIpfsUpload'
    cid: string
}

export const isFinalizeIpfsUploadResponse = (x: any): x is FinalizeIpfsUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('finalizeIpfsUpload'),
        cid: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// findIpfsFile

export type FindIpfsFileRequest = {
    payload: {
        type: 'findIpfsFile'
        timestamp: number
        cid: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isFindIpfsFileRequest = (x: any): x is FindIpfsFileRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('findIpfsFile'),
            timestamp: isNumber,
            cid: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindIpfsFileResponse = {
    type: 'findIpfsFile'
    found: boolean
    projectId?: string
    size?: number
    url?: string
}

export const isFindIpfsFileResponse = (x: any): x is FindIpfsFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        projectId: optional(isString),
        cid: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type KacherycloudRequest =
    GetClientInfoRequest |
    InitiateIpfsUploadRequest |
    FinalizeIpfsUploadRequest |
    FindIpfsFileRequest

export const isKacherycloudRequest = (x: any): x is KacherycloudRequest => {
    return isOneOf([
        isGetClientInfoRequest,
        isInitiateIpfsUploadRequest,
        isFinalizeIpfsUploadRequest,
        isFindIpfsFileRequest
    ])(x)
}

export type KacherycloudResponse =
    GetClientInfoResponse |
    InitiateIpfsUploadResponse |
    FinalizeIpfsUploadResponse |
    FindIpfsFileResponse

export const isKacherycloudResponse = (x: any): x is KacherycloudResponse => {
    return isOneOf([
        isGetClientInfoResponse,
        isInitiateIpfsUploadRequest,
        isInitiateIpfsUploadResponse,
        isFindIpfsFileResponse
    ])(x)
}