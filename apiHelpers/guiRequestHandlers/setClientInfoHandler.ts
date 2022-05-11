import { UserId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { SetClientInfoRequest, SetClientInfoResponse, SetUserSettingsRequest, SetUserSettingsResponse } from "../../src/types/GuiRequest";
import { isUser, User } from "../../src/types/User";
import firestoreDatabase from '../common/firestoreDatabase';

const setClientInfoHandler = async (request: SetClientInfoRequest, verifiedUserId: UserId): Promise<SetClientInfoResponse> => {
    const { clientId, label, defaultProjectId } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.clients')
    let docSnapshot = await collection.doc(clientId.toString()).get()

    if (!docSnapshot.exists) {
        throw Error('Client does not exist in setClientInfoHandler')
    }

    const client = docSnapshot.data()
    if (!isClient(client)) {
        throw Error('Invalid client in database')
    }
    if (client.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set client info')
    }
    
    if (label !== undefined) {
        client.label = label
    }
    if (defaultProjectId !== undefined) {
        client.defaultProjectId = defaultProjectId
    }
    await collection.doc(clientId.toString()).set(client)
    return {
        type: 'setClientInfo'
    }
}

export default setClientInfoHandler