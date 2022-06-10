import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectsForUserRequest, GetProjectsForUserResponse } from "../../src/types/GuiRequest";
import { isProject, Project } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';
import hideSecretsInProject from './helpers/hideSecretsInProject';
import isAdminUser from "./helpers/isAdminUser";

const getProjectsForUserHandler = async (request: GetProjectsForUserRequest, verifiedUserId?: UserId): Promise<GetProjectsForUserResponse> => {
    const { userId } = request
    if (!userId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not admin user.')
        }
    }
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    const results = userId ?
        await collection.where('ownerId', '==', userId).get() :
        await collection.get()
    const projects: Project[] = []
    for (let doc of results.docs) {
        const x = doc.data()
        if (isProject(x)) {
            projects.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid project in database')
            // await doc.ref.delete() // only delete if we are sure we want to -- don't risk losing data!
        }
    }
    for (let project of projects) {
        hideSecretsInProject(project)
    }
    return {
        type: 'getProjectsForUser',
        projects
    }
}

export default getProjectsForUserHandler