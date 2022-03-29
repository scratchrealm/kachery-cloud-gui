import { hexToPublicKey, verifySignature } from "../../src/commonInterface/crypto/signatures";
import { nodeIdToPublicKeyHex, UserId } from "../../src/commonInterface/kacheryTypes";
import { Client } from "../../src/types/Client"
import { AddClientRequest, AddClientResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const MAX_NUM_CLIENTS_PER_USER = 5

const addClientHandler = async (request: AddClientRequest, verifiedUserId: UserId): Promise<AddClientResponse> => {
    const { clientId, ownerId, label, defaultProjectId } = request

    if (ownerId !== verifiedUserId) {
        throw Error('Mismatch between ownerId and verifiedUserId')
    }

    // we need to verify that the user owns the client
    // const elapsed = Date.now() - request.verificationDocument.timestamp
    // if ((elapsed < -3000) || (elapsed > 60 * 1000)) {
    //     throw Error('Invalid timestamp when verifying control of client')
    // }
    if (!verifySignature(request.verificationDocument, hexToPublicKey(nodeIdToPublicKeyHex(request.clientId)), request.verificationSignature)) {
        throw Error('Invalid verification signature')
    }

    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (clientSnapshot.exists) {
        throw Error('Client clientId already exists.')
    }

    const result = await clientsCollection.where('ownerId', '==', ownerId).get()
    if (result.docs.length + 1 > MAX_NUM_CLIENTS_PER_USER) {
        throw Error(`User cannot own more than ${MAX_NUM_CLIENTS_PER_USER} clients`)
    }

    const client: Client = {
        clientId,
        ownerId,
        timestampCreated: Date.now(),
        label,
        defaultProjectId
    }
    await clientsCollection.doc(clientId.toString()).set(client)
    return {
        type: 'addClient'
    }
}

export default addClientHandler