import { isEqualTo, isSha1Hash, isString, optional, Sha1Hash, _validateObject } from "../commonInterface/kacheryTypes"

export type PubsubChannelName = 'requestTasks' | 'provideTasks'

export const isPubsubChannelName = (x: any): x is TaskStatus => (['requestTasks', 'provideTasks'].includes(x))

export type TaskStatus = 'started' | 'error' | 'finished'

export const isTaskStatus = (x: any): x is TaskStatus => (['started', 'error', 'finished'].includes(x))

export type TaskType = 'calculation' | 'action'

export const isTaskType = (x: any): x is TaskType => (['calculation', 'action'].includes(x))

export type PubsubMessage = {
    type: 'setTaskStatus'
    taskName: string
    taskJobId: Sha1Hash
    status: TaskStatus
    errorMessage?: string
} | {
    type: 'requestTask'
    taskType: TaskType
    taskName: string
    taskInput: any
    taskJobId: Sha1Hash
}

export const isPubsubMessage = (x: any): x is PubsubMessage => (
    _validateObject(x, {
        type: isEqualTo('setTaskStatus'),
        taskName: isString,
        taskJobId: isSha1Hash,
        status: isTaskStatus,
        errorMessage: optional(isString)
    }) ||
    _validateObject(x, {
        type: isEqualTo('requestTask'),
        taskType: isTaskType,
        taskName: isString,
        taskInput: () => (true),
        taskJobId: isSha1Hash
    })
)