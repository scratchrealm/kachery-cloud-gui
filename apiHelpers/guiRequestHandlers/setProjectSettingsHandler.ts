import { UserId } from "../../src/commonInterface/kacheryTypes";
import { ProjectSettings, isProject } from "../../src/types/Project";
import { SetProjectSettingsRequest, SetProjectSettingsResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProject } from "../common/getDatabaseItems";

const setProjectSettingsHandler = async (request: SetProjectSettingsRequest, verifiedUserId?: UserId): Promise<SetProjectSettingsResponse> => {
    const { projectId, projectSettings } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    const project = await getProject(projectId)
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set project settings for this project.')
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