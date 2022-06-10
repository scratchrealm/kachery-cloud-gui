import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectUsageRequest, GetProjectUsageResponse } from "../../src/types/GuiRequest";
import { isProjectUsage } from "../../src/types/ProjectUsage";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProjectMembership } from "../common/getDatabaseItems";
import isAdminUser from "./helpers/isAdminUser";

const getProjectUsageHandler = async (request: GetProjectUsageRequest, verifiedUserId?: UserId): Promise<GetProjectUsageResponse> => {
    const { projectId } = request

    const userId = verifiedUserId
    if (!userId) {
        throw Error('No verified user')
    }

    const pm = await getProjectMembership(projectId, userId)
    if ((!pm) || (!pm.permissions.read)) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('This user does not have permission to read this project')
        }
    }

    const db = firestoreDatabase()
    const projectUsagesCollection = db.collection('kacherycloud.projectUsages');
    const docSnapshot = await projectUsagesCollection.doc(projectId).get()
    if (!docSnapshot.exists) {
        return {
            type: 'getProjectUsage',
            projectUsage: {projectId}
        }
    }
    const projectUsage = docSnapshot.data()
    if (!isProjectUsage(projectUsage)) {
        throw Error('Invalid project usage')
    }
    return {
        type: 'getProjectUsage',
        projectUsage
    }
}

export default getProjectUsageHandler