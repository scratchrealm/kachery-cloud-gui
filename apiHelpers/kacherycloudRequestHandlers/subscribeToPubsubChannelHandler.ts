import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { SubscribeToPubsubChannelRequest, SubscribeToPubsubChannelResponse } from "../../src/types/KacherycloudRequest";
import { SubscribeToPubsubChannelLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import pubnub, { subscribeKey } from '../common/pubnub';

const subscribeToPubsubChannelHandler = async (request: SubscribeToPubsubChannelRequest, verifiedClientId: NodeId | undefined): Promise<SubscribeToPubsubChannelResponse> => {
    const { channelName } = request.payload

    const clientId = verifiedClientId

    const client = clientId ? await getClient(clientId) : undefined

    const projectId = request.payload.projectId || client?.defaultProjectId
    if (!projectId) throw Error('No project ID')

    const userId = client ? client.ownerId : undefined
    // make sure project exists
    await getProject(projectId)

    const projectMembership = userId ? await getProjectMembership(projectId, userId) : undefined

    if (channelName === 'provideTasks') {
        // okay - anyone can subscribe to this
    }
    else if (channelName === 'requestTasks') {
        if (!projectMembership?.permissions?.write) {
            throw Error('Not authorized to subscribe to the requestTasks pubsub channel for this project')
        }
    }
    else {
        throw Error(`Unexpected channel ${channelName}`)
    }

    const pubsubChannelName = `${projectId}.${channelName}`

    const uuid = clientId ? clientId.toString() : 'kachery-cloud-' + randomAlphaLowerString(10)
    const token = await grantSubscribeToken({uuid, pubsubChannelName})

    const db = firestoreDatabase()
    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: SubscribeToPubsubChannelLogItem = {
        type: 'subscribeToPubsubChannel',
        clientId: client?.clientId,
        projectId,
        userId,
        channelName,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'subscribeToPubsubChannel',
        token,
        subscribeKey,
        uuid,
        pubsubChannelName
    }
}

const grantSubscribeToken = async (o: {uuid: string, pubsubChannelName: string}) => {
    return new Promise<string>((resolve, reject) => {
        pubnub.grantToken({
            ttl: 3,
            authorized_uuid: o.uuid,
            resources: {
                channels: {
                    [o.pubsubChannelName]: {
                        read: true
                    }
                }
            }
        }, function (status, token) {
            if (status.error) {
                reject(status.errorData)
                return
            }
            resolve(token)
        })
    })
}

const randomAlphaLowerString = (num_chars: number) => {
    if (!num_chars) {
        /* istanbul ignore next */
        throw Error('randomAlphaString: num_chars needs to be a positive integer.')
    }
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default subscribeToPubsubChannelHandler