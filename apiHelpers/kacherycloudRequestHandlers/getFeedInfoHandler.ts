import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isFeedRecord } from "../../src/types/FeedRecord";
import { GetFeedInfoRequest, GetFeedInfoResponse } from "../../src/types/KacherycloudRequest";
import { GetFeedInfoLogItem } from "../../src/types/LogItem";
import firestoreDatabase from "../common/firestoreDatabase";
import { getClient } from "../common/getDatabaseItems";

const getFeedInfoHandler = async (request: GetFeedInfoRequest, verifiedClientId: NodeId): Promise<GetFeedInfoResponse> => {
    let { feedId } = request.payload

    const clientId = verifiedClientId
    let client = clientId ? await getClient(clientId) : undefined

    // const project = await getProject(projectId)

    const db = firestoreDatabase()

    const feedsCollection = db.collection('kacherycloud.feeds')
    const feedSnapshot = await feedsCollection.doc(feedId).get()
    if (!feedSnapshot.exists) {
        throw Error(`Feed not found: ${feedId}`)
    }
    const feedRecord = feedSnapshot.data()
    if (!isFeedRecord(feedRecord)) {
        throw Error('Invalid feed record in database')
    }
    const projectId = feedRecord.projectId

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: GetFeedInfoLogItem = {
        type: 'getFeedInfo',
        clientId,
        userId: client ? client.ownerId : undefined,
        projectId,
        feedId,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'getFeedInfo',
        projectId
    }
}

export default getFeedInfoHandler