import { UserId } from "../../src/commonInterface/kacheryTypes";
import { isAccessGroup } from "../../src/types/AccessGroup";
import { DeleteAccessGroupRequest, DeleteAccessGroupResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const deleteAccessGroupHandler = async (request: DeleteAccessGroupRequest, verifiedUserId?: UserId): Promise<DeleteAccessGroupResponse> => {
    const { accessGroupId } = request

    const db = firestoreDatabase()

    const batch = db.batch();

    const collection = db.collection('kacherycloud.accessGroups')
    const docSnapshot = await collection.doc(accessGroupId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error(`Access group does not exist in deleteAccessGroupHandler: ${accessGroupId}`)
    }
    const accessGroup = docSnapshot.data()
    if (!isAccessGroup(accessGroup)) {
        throw Error('Invalid access group')
    }
    if (accessGroup.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }
    batch.delete(collection.doc(accessGroupId.toString()))
    await batch.commit()
    
    return {
        type: 'deleteAccessGroup'
    }
}

export default deleteAccessGroupHandler