import { isNodeId, isNumber, isSha1Hash, isString, isUserId, NodeId, Sha1Hash, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type TaskResult = {
    clientId: NodeId
    userId: UserId
    projectId: string
    taskType: string
    taskInputHash: Sha1Hash
    size: number
    objectKey: string
    timestampCreated: number
}

export const isTaskResult = (x: any): x is TaskResult => (
    _validateObject(x, {
        clientId: isNodeId,
        userId: isUserId,
        projectId: isString,
        taskType: isString,
        taskInputHash: isSha1Hash,
        size: isNumber,
        objectKey: isString,
        timestampCreated: isNumber
    })
)