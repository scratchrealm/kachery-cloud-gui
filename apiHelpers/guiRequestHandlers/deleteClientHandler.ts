import { UserId } from "../../src/commonInterface/kacheryTypes";
import { DeleteClientRequest, DeleteClientResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const deleteClientHandler = async (request: DeleteClientRequest, verifiedUserId?: UserId): Promise<DeleteClientResponse> => {
    const { clientId, ownerId } = request

    if (ownerId !== verifiedUserId) {
        throw Error('Mismatch between ownerId and verifiedUserId')
    }

    const db = firestoreDatabase()

    const batch = db.batch();

    const projectClientsCollection = db.collection('kacherycloud.projectClients')
    const projectClientsSnapshot = await projectClientsCollection.where('clientId', '==', clientId).get()
    projectClientsSnapshot.forEach(doc => {
        batch.delete(doc.ref)
    })

    const clientsCollection = db.collection('kacherycloud.clients')
    batch.delete(clientsCollection.doc(clientId.toString()))

    await batch.commit()

    return {
        type: 'deleteClient'
    }
}

export default deleteClientHandler