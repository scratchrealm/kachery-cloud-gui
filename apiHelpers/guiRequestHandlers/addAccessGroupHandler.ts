import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AccessGroup } from "../../src/types/AccessGroup";
import { AddAccessGroupRequest, AddAccessGroupResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import { randomAlphaLowerString } from "./helpers/randomAlphaString";
import crypto from 'crypto'

const MAX_NUM_ACCESS_GROUPS_PER_USER = 12

const addAccessGroupHandler = async (request: AddAccessGroupRequest, verifiedUserId?: UserId): Promise<AddAccessGroupResponse> => {
    const { label, ownerId } = request
    if (verifiedUserId !== ownerId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.accessGroups')
    const results2 = await collection.where('ownerId', '==', ownerId).get()
    if (results2.docs.length + 1 > MAX_NUM_ACCESS_GROUPS_PER_USER) {
        throw Error(`User cannot own more than ${MAX_NUM_ACCESS_GROUPS_PER_USER} access groups`)
    }
    const accessGroupId = randomAlphaLowerString(10)
    
    const key = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    const keyHex = key.toString('hex')
    const ivHex = iv.toString('hex')

    const accessGroup: AccessGroup = {
        label,
        accessGroupId,
        ownerId,
        timestampCreated: Date.now(),
        timestampLastModified: Date.now(),
        users: [],
        publicRead: false,
        publicWrite: false,
        keyHex,
        ivHex
    }
    await collection.doc(accessGroupId).set(accessGroup)

    return {
        type: 'addAccessGroup',
        accessGroupId
    }
}

export default addAccessGroupHandler