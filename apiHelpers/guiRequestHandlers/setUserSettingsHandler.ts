import { UserId } from "../../src/commonInterface/kacheryTypes";
import { SetUserSettingsRequest, SetUserSettingsResponse } from "../../src/types/GuiRequest";
import { isUser, User } from "../../src/types/User";
import firestoreDatabase from '../common/firestoreDatabase';

const setUserSettingsHandler = async (request: SetUserSettingsRequest, verifiedUserId?: UserId): Promise<SetUserSettingsResponse> => {
    const { userId, userSettings } = request

    if (userId !== verifiedUserId) {
        throw Error('Not authorized to set user settings for this user')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.users')
    let docSnapshot = await collection.doc(userId.toString()).get()
    if (!docSnapshot.exists) {
        const user0: User = {
            userId,
            timestampCreated: Date.now(),
            timestampLastModified: Date.now(),
            settings: {}
        }
        await collection.doc(userId.toString()).set(user0)
        docSnapshot = await collection.doc(userId.toString()).get()
    }
    const user = docSnapshot.data()
    if (!isUser(user)) {
        throw Error('Invalid user')
    }
    user.settings = userSettings
    user.timestampLastModified = Date.now()
    await collection.doc(userId.toString()).set(user)
    return {
        type: 'setUserSettings'
    }
}

export default setUserSettingsHandler