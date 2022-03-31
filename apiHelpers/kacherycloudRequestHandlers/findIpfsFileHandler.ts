import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { Client, isClient } from "../../src/types/Client";
import { IpfsFile, isIpfsFile } from "../../src/types/IpfsFile";
import { FindIpfsFileRequest, FindIpfsFileResponse } from "../../src/types/KacherycloudRequest";
import { isProject, Project } from '../../src/types/Project';
import firestoreDatabase from '../common/firestoreDatabase';

const findIpfsFileHandler = async (request: FindIpfsFileRequest, verifiedClientId?: NodeId): Promise<FindIpfsFileResponse> => {
    const { cid, projectId } = request.payload
    const clientId = verifiedClientId

    const db = firestoreDatabase()

    let project: Project | undefined = undefined
    if (projectId) {
        const projectsCollection = db.collection('kacherycloud.projects')
        const projectSnapshot = await projectsCollection.doc(projectId).get()
        if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
        const projectData = projectSnapshot.data()
        if (!isProject(projectData)) throw Error('Invalid project in database')
        project = projectData
    }

    let client: Client | undefined = undefined
    if (clientId) {
        const clientsCollection = db.collection('kacherycloud.clients')
        const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
        if (!clientSnapshot.exists) throw Error('Client does not exist')
        const clientData = clientSnapshot.data()
        if (!isClient(clientData)) throw Error('Invalid client in database')
        client = clientData
    }

    const ipfsFilesCollection = db.collection('kacherycloud.ipfsFiles')
    let ipfsFile: IpfsFile
    if (projectId) {
        const ifKey = `${projectId}.${cid}`
        const ipfsFileSnapshot = await ipfsFilesCollection.doc(ifKey).get()
        if (!ipfsFileSnapshot.exists) {
            return {
                type: 'findIpfsFile',
                found: false
            }
        }
        const ipfsFileData = ipfsFileSnapshot.data()
        if (!isIpfsFile(ipfsFileData)) throw Error('Invalid IpfsFile in database')
        ipfsFile = ipfsFileData
    }
    else {
        const ipfsFilesResult = await ipfsFilesCollection.where('cid', '==', cid).get()
        if (ipfsFilesResult.docs.length === 0) {
            return {
                type: 'findIpfsFile',
                found: false
            }
        }
        else {
            const ipfsFileData = ipfsFilesResult.docs[0].data()
            if (!isIpfsFile(ipfsFileData)) throw Error('Invalid IpfsFile in database')
            ipfsFile = ipfsFileData
        }
    }

    const size = ipfsFile.size
    const url = ipfsFile.url

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    await usageLogCollection.add({
        type: 'finalizeIpfsUpload',
        clientId,
        projectId: ipfsFile.projectId,
        userId: client?.ownerId,
        size,
        url,
        timestamp: Date.now()
    })

    return {
        type: 'findIpfsFile',
        found: true,
        projectId,
        size,
        url
    }
}

export default findIpfsFileHandler