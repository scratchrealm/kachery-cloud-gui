import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isFeedRecord } from "../../src/types/FeedRecord";
import { GetFeedMessagesRequest, GetFeedMessagesResponse } from "../../src/types/KacherycloudRequest";
import { GetFeedMessagesLogItem } from "../../src/types/LogItem";
import firestoreDatabase from "../common/firestoreDatabase";
import { getClient } from "../common/getDatabaseItems";
import { FeedMessageDocument, isFeedMessageDocument } from "./appendFeedMessagesHandler";

const getFeedMessagesHandler = async (request: GetFeedMessagesRequest, verifiedClientId?: NodeId): Promise<GetFeedMessagesResponse> => {
    let { feedId, startMessageNumber } = request.payload

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

    const feedMessagesCollection = feedSnapshot.ref.collection('messages')
    const result = await feedMessagesCollection
        .where('messageNumber', '>=', startMessageNumber)
        .orderBy('messageNumber').get()
    const messageDocs: FeedMessageDocument[] = []
    for (let doc of result.docs) {
        const docData = doc.data()
        if (!isFeedMessageDocument(docData)) {
            console.warn(docData)
            throw Error('Invalid feed message document in database')
        }
        messageDocs.push(docData)
    }

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: GetFeedMessagesLogItem = {
        type: 'getFeedMessages',
        clientId,
        userId: client ? client.ownerId : undefined,
        projectId,
        feedId,
        numMessages: messageDocs.length,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'getFeedMessages',
        startMessageNumber,
        messages: messageDocs.map(md => (md.message))
    }
}

export default getFeedMessagesHandler