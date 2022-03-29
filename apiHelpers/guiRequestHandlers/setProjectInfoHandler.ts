import { UserId } from "../../src/commonInterface/kacheryTypes";
import { SetProjectInfoRequest, SetProjectInfoResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';

const setProjectInfoHandler = async (request: SetProjectInfoRequest, verifiedUserId: UserId): Promise<SetProjectInfoResponse> => {
    const { projectId, label } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    let docSnapshot = await collection.doc(projectId).get()

    if (!docSnapshot.exists) {
        throw Error('Project does not exist')
    }

    const project = docSnapshot.data()
    if (!isProject(project)) {
        throw Error('Invalid project in database')
    }
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set project info')
    }
    
    if (label !== undefined) {
        project.label = label
    }
    await collection.doc(projectId).set(project)
    return {
        type: 'setProjectInfo'
    }
}

export default setProjectInfoHandler