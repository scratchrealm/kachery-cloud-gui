import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { Client } from "../../src/types/Client";
import { FileRecord, isFileRecord } from "../../src/types/FileRecord";
import { AccessGroupDecryptRequest, FindFileRequest, FindFileResponse } from "../../src/types/KacherycloudRequest";
import { FindFileLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient } from "../common/getDatabaseItems";
import accessGroupDecryptHandler from './accessGroupDecryptHandler';

const findFileHandler = async (request: FindFileRequest, verifiedClientId?: NodeId): Promise<FindFileResponse> => {
    const { hashAlg, hash } = request.payload

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // handle access group encryption
    if (hashAlg === 'sha1-enc') {
        // Example: 4dc5679dfcd586c5e211cfad3699505d36f9dd8c275b8c6e67c94674ad8bcda3bc8af5a571a38120dff3570af057f957.ag_kddvtdrlrl
        const a = hash.split('.')
        if (a.length !== 2) throw Error(`Invalid hash for sha1-enc`)
        const sha1Enc = a[0]
        const b = a[1]
        if (!b.startsWith('ag_')) throw Error(`Invalid hash for sha1-enc`)
        const accessGroupId = b.slice(3)
        const req2: AccessGroupDecryptRequest = {
            payload: {
                type: 'accessGroupDecrypt',
                timestamp: request.payload.timestamp,
                accessGroupId,
                encryptedText: sha1Enc
            },
            fromClientId: request.fromClientId,
            signature: undefined // we don't need to check the signature since this is an internal call
        }
        const resp2 = await accessGroupDecryptHandler(req2, verifiedClientId)
        const sha1 = resp2.decryptedText
        const req3: FindFileRequest = {
            payload: {
                type: 'findFile',
                timestamp: request.payload.timestamp,
                hashAlg: 'sha1',
                hash: sha1,
                projectId: request.payload.projectId
            },
            fromClientId: request.fromClientId,
            signature: undefined // we don't need to check the signature since this is an internal call
        }
        return await findFileHandler(req3, verifiedClientId)
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let projectId  = request.payload.projectId
    const clientId = verifiedClientId

    const db = firestoreDatabase()

    // let project: Project | undefined = undefined
    // if (projectId) {
    //     const projectsCollection = db.collection('kacherycloud.projects')
    //     const projectSnapshot = await projectsCollection.doc(projectId).get()
    //     if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    //     const projectData = projectSnapshot.data()
    //     if (!isProject(projectData)) throw Error('Invalid project in database')
    //     project = projectData
    // }

    let client: Client | undefined = undefined
    if (clientId) {
        client = await getClient(clientId)
    }

    const filesCollection = db.collection('kacherycloud.files')
    let fileRecord: FileRecord
    if (projectId) {
        const fKey = `${projectId}:${hashAlg}:${hash}`
        const fileSnapshot = await filesCollection.doc(fKey).get()
        if (!fileSnapshot.exists) {
            return {
                type: 'findFile',
                found: false
            }
        }
        const fileData = fileSnapshot.data()
        if (!isFileRecord(fileData)) throw Error('Invalid file record in database')
        fileRecord = fileData
    }
    else {
        const uri = `${hashAlg}://${hash}`
        // important to order by timestampCreated so that we get the earliest version of a file (prevents an attack where attacker uploads incorrect content for an existing hash)
        const filesResult = await filesCollection.where('uri', '==', uri).orderBy('timestampCreated').get()
        // const filesResult = await filesCollection.where('uri', '==', uri).get()
        if (filesResult.docs.length === 0) {
            return {
                type: 'findFile',
                found: false
            }
        }
        else {
            const fileData = filesResult.docs[0].data() // the first doc is the earliest because we ordered by timestampCreated
            if (!isFileRecord(fileData)) throw Error('Invalid file in database')
            fileRecord = fileData
        }
    }

    const size = fileRecord.size
    const url = fileRecord.url
    const timestampCreated = fileRecord.timestampCreated
    const timestampAccessed = fileRecord.timestampAccessed

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: FindFileLogItem = {
        type: 'findFile',
        found: true,
        clientId,
        projectId: fileRecord.projectId,
        userId: client?.ownerId,
        hashAlg,
        hash,
        size,
        url,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'findFile',
        found: true,
        projectId,
        size,
        url,
        timestampCreated,
        timestampAccessed
    }
}

export default findFileHandler