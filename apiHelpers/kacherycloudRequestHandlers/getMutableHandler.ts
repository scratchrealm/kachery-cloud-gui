import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { Client } from "../../src/types/Client";
import { GetMutableRequest, GetMutableResponse } from "../../src/types/KacherycloudRequest";
import { GetMutableLogItem } from "../../src/types/LogItem";
import { isMutableRecord, MutableRecord } from "../../src/types/MutableRecord";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient } from "../common/getDatabaseItems";

const getMutableHandler = async (request: GetMutableRequest, verifiedClientId?: NodeId): Promise<GetMutableResponse> => {
    const { mutableKey } = request.payload

    const db = firestoreDatabase()

    const clientId = verifiedClientId
    let client: Client | undefined = undefined
    if (clientId) {
        client = await getClient(clientId)
    }

    const projectId = request.payload.projectId || (client ? client.defaultProjectId : undefined)
    if (!projectId) throw Error('No project ID')

    // const projectsCollection = db.collection('kacherycloud.projects')
    // const projectSnapshot = await projectsCollection.doc(projectId).get()
    // if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    // const projectData = projectSnapshot.data()
    // if (!isProject(projectData)) throw Error('Invalid project in database')
    // const project = projectData

    const mutablesCollection = db.collection('kacherycloud.mutables')
    const mKey = `${projectId}:${mutableKey.split('/').join(':')}`
    const mutableSnapshot = await mutablesCollection.doc(mKey).get()
    const found = mutableSnapshot.exists
    let mutableRecord: MutableRecord | undefined = undefined
    if (found) {
        const d = mutableSnapshot.data()
        if (!isMutableRecord(d)) throw Error('Invalid mutable record in database')
        mutableRecord = d
    }
    const value = mutableRecord?.value

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: GetMutableLogItem = {
        type: 'getMutable',
        found,
        clientId: client ? client.clientId : undefined,
        projectId,
        userId: client ? client.ownerId : undefined,
        mutableKey,
        value,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'getMutable',
        found,
        value,
        projectId
    }
}

export default getMutableHandler