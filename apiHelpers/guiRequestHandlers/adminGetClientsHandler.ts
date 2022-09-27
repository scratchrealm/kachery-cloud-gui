import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AdminGetClientsRequest, AdminGetClientsResponse } from "../../src/types/GuiRequest";
import { isClient, Client } from "../../src/types/Client";
import firestoreDatabase from '../common/firestoreDatabase';
import isAdminUser from "./helpers/isAdminUser";

const adminGetClientsHandler = async (request: AdminGetClientsRequest, verifiedUserId?: UserId): Promise<AdminGetClientsResponse> => {
    if (!isAdminUser(verifiedUserId)) {
        throw Error('Not an admin user')
    }

    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const results = await clientsCollection.get()
    const clients: Client[] = []
    for (let doc of results.docs) {
        const client = doc.data()
        if (!isClient(client)) {
            throw Error('Invalid client in database')
        }
        clients.push(client)
    }

    return {
        type: 'adminGetClients',
        clients
    }
}

export default adminGetClientsHandler