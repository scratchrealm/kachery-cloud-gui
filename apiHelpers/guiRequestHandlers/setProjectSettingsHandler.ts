import { UserId } from "../../src/commonInterface/kacheryTypes";
import { ProjectSettings, isProject } from "../../src/types/Project";
import { SetProjectSettingsRequest, SetProjectSettingsResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const setProjectSettingsHandler = async (request: SetProjectSettingsRequest, verifiedUserId: UserId): Promise<SetProjectSettingsResponse> => {
    const { projectId, projectSettings } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    const docSnapshot = await collection.doc(projectId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error('Project does not exists')
    }
    const project = docSnapshot.data()
    if (!isProject(project)) {
        throw Error('Invalid project')
    }
    copyHiddenFields(projectSettings, project.settings)
    project.settings = projectSettings
    project.timestampLastModified = Date.now()
    await collection.doc(projectId.toString()).set(project)
    return {
        type: 'setProjectSettings'
    }
}

const copyHiddenFields = (target: ProjectSettings, source: ProjectSettings) => {
    // if (target.googleCredentials === null) {
    //     target.googleCredentials = source.googleCredentials || undefined
    // }
}

export default setProjectSettingsHandler