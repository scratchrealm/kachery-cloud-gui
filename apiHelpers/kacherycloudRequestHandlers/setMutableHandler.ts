import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { SetMutableRequest, SetMutableResponse } from "../../src/types/KacherycloudRequest";
import { SetMutableLogItem } from "../../src/types/LogItem";
import { MutableRecord } from "../../src/types/MutableRecord";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProjectMembership } from '../common/getDatabaseItems';

const setMutableHandler = async (request: SetMutableRequest, verifiedClientId?: NodeId): Promise<SetMutableResponse> => {
    const { mutableKey, value } = request.payload

    if (value.length > 100000) {
        throw Error(`Size of mutable value is too large: ${value.length}`)
    }

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    const newMutableKey = _createNewMutableKey(mutableKey, {isFolder: false})

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
    const mutableSnapshot = await mutablesCollection.doc(mKey).get()
    const alreadyExisted = mutableSnapshot.exists
    const mutableRecord: MutableRecord = {
        projectId,
        mutableKey,
        value
    }
    await mutablesCollection.doc(mKey).set(mutableRecord)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: SetMutableLogItem = {
        type: 'setMutable',
        clientId: client.clientId,
        projectId,
        userId,
        mutableKey,
        value,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'setMutable',
        projectId
    }
}

export const _createNewMutableKey = (mutableKey: string, o: {isFolder: boolean}) => {
    const mutableKeyItems = mutableKey.split('/')
    const newMutableKeyItems: string[] = []
    for (let i = 0; i < mutableKeyItems.length; i++) {
        const item = mutableKeyItems[i]
        if (i < mutableKeyItems.length - 1) {
            if (!item.startsWith('@')) {
                throw Error(`Invalid mutable key: ${mutableKey} (${i} ${item})`)
            }
            newMutableKeyItems.push('@')
            newMutableKeyItems.push(item.slice(1))
        }
        else {
            if (o.isFolder) {
                if (!item.startsWith('@')) {
                    throw Error(`Invalid folder mutable key: ${mutableKey}`)
                }
            }
            else {
                if (item.startsWith('@')) {
                    throw Error(`Invalid mutable key: ${mutableKey}`)
                }
            }
            newMutableKeyItems.push(item)
        }
    }
    const newMutableKey = newMutableKeyItems.join('/')
    return newMutableKey
}

export default setMutableHandler