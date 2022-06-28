import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { AddAccessGroupRequest, DeleteAccessGroupRequest, GetAccessGroupsForUserRequest, isAddAccessGroupResponse, isDeleteAccessGroupResponse, isGetAccessGroupsForUserResponse } from "types/GuiRequest"
import { AccessGroup } from "types/AccessGroup"
import useRoute from "components/useRoute"

const useAccessGroupsForUser = () => {
    const [accessGroups, setAccessGroups] = useState<AccessGroup[] | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refreshAccessGroups = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const {setErrorMessage} = useErrorMessage()

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setAccessGroups(undefined)
            if (!userId) return
            let canceled = false
            const req: GetAccessGroupsForUserRequest = {
                type: 'getAccessGroupsForUser',
                userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetAccessGroupsForUserResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setAccessGroups(resp.accessGroups)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, refreshCode, setErrorMessage])

    const {setRoute} = useRoute()

    const addAccessGroup = useCallback((label: string, o: {navigateToAccessGroupPage?: boolean}) => {
        if (!userId) return
        ; (async () => {
            const req: AddAccessGroupRequest = {
                type: 'addAccessGroup',
                label,
                ownerId: userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
            if (!resp) return
            if (!isAddAccessGroupResponse(resp)) {
                throw Error('Unexpected response')
            }
            refreshAccessGroups()
            if (o.navigateToAccessGroupPage) {
                setRoute({page: 'accessGroup', accessGroupId: resp.accessGroupId || ''})
            }
        })()
    }, [userId, googleIdToken, refreshAccessGroups, setErrorMessage, setRoute])

    const deleteAccessGroup = useCallback((accessGroupId: string) => {
        if (!userId) return
            ; (async () => {
                const req: DeleteAccessGroupRequest = {
                    type: 'deleteAccessGroup',
                    accessGroupId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isDeleteAccessGroupResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshAccessGroups()
            })()
    }, [userId, googleIdToken, refreshAccessGroups, setErrorMessage])

    return { accessGroups, refreshAccessGroups, addAccessGroup, deleteAccessGroup }
}

export default useAccessGroupsForUser