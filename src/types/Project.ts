import { isBoolean, isNull, isNumber, isOneOf, isString, isUserId, optional, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type ProjectSettings = {
    public: boolean
    ipfsDownloadGateway?: {
        hostName: string
    }
    ipfsUploadGateway?: {
        hostName: string
        authenticationToken?: string | null // null means hidden, undefined means not present
    }
}

const isStringOrNull = (x: any) => {
    return isOneOf([isString, isNull])
}

export const isProjectSettings = (y: any): y is ProjectSettings => (
    _validateObject(y, {
        public: isBoolean,
        ipfsDownloadGateway: optional((a: any) => (
            _validateObject(a, {
                hostName: isString
            })
        )),
        ipfsUploadGateway: optional((a: any) => (
            _validateObject(a, {
                hostName: isString,
                authenticationToken: optional(isStringOrNull)
            })
        ))
    })
)

export type Project = {
    projectName: string
    projectId: string
    ownerId: UserId
    timestampCreated: number
    timestampLastModified: number
    settings: ProjectSettings
}

export const isProject = (x: any): x is Project => {
    return _validateObject(x, {
        projectName: isString,
        projectId: isString,
        ownerId: isUserId,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        settings: isProjectSettings
    })
}