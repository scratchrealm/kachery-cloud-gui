import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { Client, isClient } from "../../src/types/Client";
import { GetMutableRequest, GetMutableResponse } from "../../src/types/KacherycloudRequest";
import { GetMutableLogItem } from "../../src/types/LogItem";
import { isMutableRecord, MutableRecord } from "../../src/types/MutableRecord";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';

const getMutableHandler = async (request: GetMutableRequest, verifiedClientId: NodeId): Promise<GetMutableResponse> => {
    const { mutableKey, projectId } = request.payload

    const db = firestoreDatabase()

    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId).get()
    if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    const projectData = projectSnapshot.data()
    if (!isProject(projectData)) throw Error('Invalid project in database')
    const project = projectData

    const clientId = verifiedClientId
    let client: Client | undefined = undefined
    if (clientId) {
        const clientsCollection = db.collection('kacherycloud.clients')
        const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
        if (!clientSnapshot.exists) throw Error('Client does not exist')
        const clientData = clientSnapshot.data()
        if (!isClient(clientData)) throw Error('Invalid client in database')
        client = clientData
    }

    const mutablesCollection = db.collection('kacherycloud.mutables')
    const mKey = `${projectId}:${mutableKey.replace('/', ':')}`
    const mutableSnapshot = await mutablesCollection.doc(mKey).get()
    const found = mutableSnapshot.exists
    let mutableRecord: MutableRecord | undefined = undefined
    if (found) {
        const d = mutableSnapshot.data()
        if (!isMutableRecord(d)) throw Error('Invalid mutable record in database')
        mutableRecord = d
    }
    const cid = mutableRecord?.cid

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: GetMutableLogItem = {
        type: 'getMutable',
        found,
        clientId: client.clientId,
        projectId,
        userId: client ? client.ownerId : undefined,
        mutableKey,
        cid,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'getMutable',
        found,
        cid,
        projectId
    }
}

export default getMutableHandler