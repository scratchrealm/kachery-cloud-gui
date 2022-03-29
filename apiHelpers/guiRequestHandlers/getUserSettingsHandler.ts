import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetUserSettingsRequest, GetUserSettingsResponse } from "../../src/types/GuiRequest";
import { isUserSettings } from "../../src/types/User";
import firestoreDatabase from '../common/firestoreDatabase';

const getUserSettingsHandler = async (request: GetUserSettingsRequest, verifiedUserId: UserId): Promise<GetUserSettingsResponse> => {
    const { userId } = request

    if (userId !== verifiedUserId) {
        throw Error('Not authorized to get user settings for this user')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.users')
    let docSnapshot = await collection.doc(userId.toString()).get()
    const userSettings = docSnapshot.exists ? docSnapshot.data() : {}
    if (!isUserSettings(userSettings)) {
        throw Error('Invalid user settings')
    }
    return {
        type: 'getUserSettings',
        userSettings
    }
}

export default getUserSettingsHandler