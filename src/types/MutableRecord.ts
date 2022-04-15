import { isNumber, isString, _validateObject } from "../commonInterface/kacheryTypes"

export type MutableRecord = {
    projectId: string
    mutableKey: string
    value: string
}

export const isMutableRecord = (x: any): x is MutableRecord => (
    _validateObject(x, {
        projectId: isString,
        mutableKey: isString,
        value: isString
    })
)