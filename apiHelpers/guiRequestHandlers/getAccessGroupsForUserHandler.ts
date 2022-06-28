import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AccessGroup, isAccessGroup } from "../../src/types/AccessGroup";
import { GetAccessGroupsForUserRequest, GetAccessGroupsForUserResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import isAdminUser from "./helpers/isAdminUser";

const getAccessGroupsForUserHandler = async (request: GetAccessGroupsForUserRequest, verifiedUserId?: UserId): Promise<GetAccessGroupsForUserResponse> => {
    const { userId } = request
    if (!userId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not admin user.')
        }
    }
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.accessGroups')
    const results = userId ?
        await collection.where('ownerId', '==', userId).get() :
        await collection.get()
    const accessGroups: AccessGroup[] = []
    for (let doc of results.docs) {
        const x = doc.data()
        if (isAccessGroup(x)) {
            accessGroups.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid access group in database')
            // await doc.ref.delete() // only delete if we are sure we want to -- don't risk losing data!
        }
    }
    return {
        type: 'getAccessGroupsForUser',
        accessGroups
    }
}

export default getAccessGroupsForUserHandler