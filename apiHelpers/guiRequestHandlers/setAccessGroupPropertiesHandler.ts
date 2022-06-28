import { UserId } from "../../src/commonInterface/kacheryTypes";
import { isAccessGroup } from "../../src/types/AccessGroup";
import { SetAccessGroupPropertiesRequest, SetAccessGroupPropertiesResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import { invalidateAccessGroupInCache } from "../common/getDatabaseItems";

const setAccessGroupPropertiesHandler = async (request: SetAccessGroupPropertiesRequest, verifiedUserId?: UserId): Promise<SetAccessGroupPropertiesResponse> => {
    const { accessGroupId, publicRead, publicWrite, users, label } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.accessGroups')
    const docSnapshot = await collection.doc(accessGroupId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error('Access group does not exist in setAccessGroupPropertiesHandler.')
    }
    const accessGroup = docSnapshot.data()
    if (!isAccessGroup(accessGroup)) {
        throw Error('Invalid access group')
    }
    if (accessGroup.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set access group settings for this access group.')
    }
    if (label !== undefined) {
        accessGroup.label = label
    }
    if (publicRead !== undefined) {
        accessGroup.publicRead = publicRead
    }
    if (publicWrite !== undefined) {
        accessGroup.publicWrite = publicWrite
    }
    if (users !== undefined) {
        accessGroup.users = users
    }
    accessGroup.timestampLastModified = Date.now()
    await collection.doc(accessGroupId.toString()).set(accessGroup)
    invalidateAccessGroupInCache(accessGroupId)
    return {
        type: 'setAccessGroupProperties'
    }
}

export default setAccessGroupPropertiesHandler