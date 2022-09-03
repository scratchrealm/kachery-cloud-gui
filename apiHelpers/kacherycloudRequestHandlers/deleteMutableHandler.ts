import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { DeleteMutableRequest, DeleteMutableResponse } from "../../src/types/KacherycloudRequest";
import { DeleteMutableLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProjectMembership } from '../common/getDatabaseItems';
import { _createNewMutableKey } from "./setMutableHandler";

const deleteMutableHandler = async (request: DeleteMutableRequest, verifiedClientId?: NodeId): Promise<DeleteMutableResponse> => {
    const { mutableKey, isFolder } = request.payload

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }
    const newMutableKey = _createNewMutableKey(mutableKey, {isFolder})

    const db = firestoreDatabase()
    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No default project ID')

    // const project = await getProject(projectId)

    const userId = client.ownerId
    const pm = await getProjectMembership(projectId, userId)

    if ((!pm) || (!pm.permissions.write)) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const mutablesCollection = db.collection('kacherycloud.mutables')
    // const mKey = `${projectId}:${mutableKey.split('/').join(':')}`
    const mKey = `${projectId}:${newMutableKey}`
    if (isFolder) {
        throw Error('Deleting a mutable folder not yet implemented. It is hard.')
    }
    else {
        const mutableSnapshot = await mutablesCollection.doc(mKey).get()
        if (!mutableSnapshot.exists) {
            throw Error(`Mutable does not exist: ${mutableKey}`)
        }
        await mutableSnapshot.ref.delete()
    }

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: DeleteMutableLogItem = {
        type: 'deleteMutable',
        clientId: client.clientId,
        projectId,
        userId,
        mutableKey,
        isFolder,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'deleteMutable',
        projectId
    }
}

export default deleteMutableHandler