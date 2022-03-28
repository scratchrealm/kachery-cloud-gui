import { isArrayOf, isBoolean, isEqualTo, isNodeId, isNumber, isOneOf, isSignature, NodeId, optional, Signature, _validateObject } from "../commonInterface/kacheryTypes"
import { Client, isClient } from "./Client"
import { isProject, Project } from "./Project"
import { isProjectMembership, ProjectMembership } from "./ProjectMembership"

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
}

export const isGetClientInfoResponse = (x: any): x is GetClientInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getClientInfo'),
        found: isBoolean,
        client: optional(isClient),
        projects: optional(isArrayOf(isProject)),
        projectMemberships: optional(isArrayOf(isProjectMembership))
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type KacherycloudRequest =
    GetClientInfoRequest

export const isKacherycloudRequest = (x: any): x is KacherycloudRequest => {
    return isOneOf([
        isGetClientInfoRequest
    ])(x)
}

export type KacherycloudResponse =
    GetClientInfoResponse

export const isKacherycloudResponse = (x: any): x is KacherycloudResponse => {
    return isOneOf([
        isGetClientInfoResponse
    ])(x)
}