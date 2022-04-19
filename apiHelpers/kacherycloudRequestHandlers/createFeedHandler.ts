import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { FeedRecord } from "../../src/types/FeedRecord";
import { CreateFeedRequest, CreateFeedResponse } from "../../src/types/KacherycloudRequest";
import { CreateFeedLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProjectMembership } from "../common/getDatabaseItems";
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";

const createFeedHandler = async (request: CreateFeedRequest, verifiedClientId: NodeId): Promise<CreateFeedResponse> => {
    const clientId = verifiedClientId

    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No project ID')
    const projectMembership = await getProjectMembership(projectId, client.ownerId)
    if ((!projectMembership) || (!projectMembership.permissions.write)) {
        throw Error('Not authorized to create a feed for this project')
    }

    const db = firestoreDatabase()

    const feedsCollection = db.collection('kacherycloud.feeds')
    const feedId = randomAlphaLowerString(12)
    const feedRecord: FeedRecord = {
        feedId,
        projectId
    }
    await feedsCollection.doc(feedId).create(feedRecord)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: CreateFeedLogItem = {
        type: 'createFeed',
        clientId: client.clientId,
        projectId,
        userId: client.ownerId,
        feedId,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'createFeed',
        feedId,
        projectId
    }
}

export default createFeedHandler