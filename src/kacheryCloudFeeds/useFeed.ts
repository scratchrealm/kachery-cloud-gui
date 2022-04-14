import { JSONObject } from "commonInterface/kacheryTypes"
import kacherycloudApiRequest from "kacheryCloudTasks/kacherycloudApiRequest"
import PubsubSubscription from "kacheryCloudTasks/PubsubSubscription"
import { useCallback, useEffect, useReducer, useState } from "react"
import { GetFeedInfoRequest, GetFeedMessagesRequest, isGetFeedInfoResponse, isGetFeedMessagesResponse } from "types/KacherycloudRequest"

type MessagesAction = {
    type: 'appendMessages'
    startMessageNumber: number
    messages: JSONObject[]
} | {
    type: 'clearMessages'
}

const messagesReducer = (state: JSONObject[], action: MessagesAction) => {
    if (action.type === 'clearMessages') {
        return []
    }
    else if (action.type === 'appendMessages') {
        if (action.startMessageNumber <= state.length) {
            return [...state.slice(0, action.startMessageNumber), ...action.messages]
        }
        else return state
    }
    else return state
}

const useFeed = (feedId: string) => {
    const [messages, messagesDispatch] = useReducer(messagesReducer, [])
    const [messagesUpdateCode, setMessagesUpdateCode] = useState<number>(0)
    const incrementMessagesUpdateCode = useCallback(() => {setMessagesUpdateCode(c => (c + 1))}, [])

    useEffect(() => {
        let canceled = false
        ;(async () => {
            const req: GetFeedMessagesRequest = {
                payload: {
                    type: 'getFeedMessages',
                    timestamp: Date.now(),
                    feedId,
                    startMessageNumber: messages.length
                }
            }
            const resp = await kacherycloudApiRequest(req)
            if (canceled) return
            if (!isGetFeedMessagesResponse(resp)) throw Error('Unexpected response')
            if (resp.messages.length === 0) return
            messagesDispatch({
                type: 'appendMessages',
                startMessageNumber: resp.startMessageNumber,
                messages: resp.messages
            })
        })()
        return () => {
            canceled = true
        }
    }, [messagesUpdateCode, messages, feedId])

    useEffect(() => {
        messagesDispatch({type: 'clearMessages'})
        let pubsubSubscription: PubsubSubscription | undefined = undefined
        let canceled = false
        ;(async () => {
            const req: GetFeedInfoRequest = {
                payload: {
                    type: 'getFeedInfo',
                    timestamp: Date.now(),
                    feedId
                }
            }
            const resp = await kacherycloudApiRequest(req)
            if (!isGetFeedInfoResponse(resp)) throw Error('Unexpected response')
            const {projectId} = resp

            pubsubSubscription = new PubsubSubscription({
                projectId,
                channelName: 'feedUpdates'
            })
            pubsubSubscription.onMessage((pubsubChannelName, msg) => {
                if (canceled) return
                if ((msg.type === 'feedMessagesAppended') && (msg.feedId === feedId)) {
                    incrementMessagesUpdateCode()
                }
            })
        })()
        return () => {
            canceled = true
            if (pubsubSubscription) {
                pubsubSubscription.unsubscribe()
            }
        }
    }, [feedId, incrementMessagesUpdateCode])

    return {messages}
}

export default useFeed