import { isEqualTo, isNumber, isOneOf, isString, isUserId, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type Bucket = {
    bucketId: string
    ownerId: UserId
    label: string
    timestampCreated: number
    timestampLastModified: number
    service: 'google' | 'filebase'
    uri: string
    credentials: string
}

export const isBucket = (x: any): x is Bucket => {
    return _validateObject(x, {
        bucketId: isString,
        ownerId: isUserId,
        label: isString,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        service: isOneOf(['google', 'filebase'].map(s => (isEqualTo(s)))),
        uri: isString,
        credentials: isString
    })
}