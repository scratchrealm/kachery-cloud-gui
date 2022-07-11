import { UserId } from "../../src/commonInterface/kacheryTypes";
import { ManualDeleteFileRecordRequest, ManualDeleteFileRecordResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProject } from "../common/getDatabaseItems";

const manualDeleteFileRecordHandler = async (request: ManualDeleteFileRecordRequest, verifiedUserId?: UserId): Promise<ManualDeleteFileRecordResponse> => {
    const { projectId, hash, hashAlg } = request

    const project = await getProject(projectId)

    if (project.ownerId !== verifiedUserId) {
        throw Error('Not owner of this project')
    }

    const db = firestoreDatabase()
    const filesCollection = db.collection('kacherycloud.files')
    const fKey = `${projectId}:${hashAlg}:${hash}`
    const fileSnapshot = await filesCollection.doc(fKey).get()
    const exists = fileSnapshot.exists

    if (!exists) {
        throw Error(`File object does not exist: ${fKey}`)
    }

    await fileSnapshot.ref.delete()
    return {
        type: 'manualDeleteFileRecord'
    }
}

export default manualDeleteFileRecordHandler