import { NodeId, UserId } from "../../src/commonInterface/kacheryTypes";
import { FeedRecord } from "../../src/types/FeedRecord";
import { CreateFeedRequest, CreateFeedResponse } from "../../src/types/KacherycloudRequest";
import { CreateFeedLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";

const createFeedHandler = async (request: CreateFeedRequest, verifiedClientId?: NodeId): Promise<CreateFeedResponse> => {
    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    // const client = await getClient(clientId)

    // const projectId = request.payload.projectId || client.defaultProjectId
    // if (!projectId) throw Error('No project ID')
    // const projectMembership = await getProjectMembership(projectId, client.ownerId)
    // if ((!projectMembership) || (!projectMembership.permissions.write)) {
    //     throw Error('Not authorized to create a feed for this project')
    // }

    const projectId = 'interim'

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
        // clientId: client.clientId,
        clientId: verifiedClientId,
        projectId,
        // userId: client.ownerId,
        userId: '' as any as UserId,
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