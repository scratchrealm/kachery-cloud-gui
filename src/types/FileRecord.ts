import { isNumber, isString, _validateObject } from "../commonInterface/kacheryTypes"

export type FileRecord = {
    projectId: string
    hashAlg: string
    hash: string
    uri: string
    size: number
    url: string
}

export const isFileRecord = (x: any): x is FileRecord => {
    return _validateObject(x, {
        projectId: isString,
        hashAlg: isString,
        hash: isString,
        uri: isString,
        size: isNumber,
        url: isString
    })
}