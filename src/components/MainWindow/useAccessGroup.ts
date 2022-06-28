import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AccessGroup, AccessGroupUser } from "types/AccessGroup"
import { GetAccessGroupRequest, isGetAccessGroupResponse, isSetAccessGroupPropertiesResponse, SetAccessGroupPropertiesRequest } from "types/GuiRequest"

const useAccessGroup = (accessGroupId: string | undefined) => {
    const [accessGroup, setAccessGroup] = useState<AccessGroup | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const {setErrorMessage} = useErrorMessage()

    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setAccessGroup(undefined)
            if (!accessGroupId) return
            if (!userId) return
            let canceled = false
            const req: GetAccessGroupRequest = {
                type: 'getAccessGroup',
                accessGroupId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetAccessGroupResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setAccessGroup(resp.accessGroup)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, accessGroupId, setErrorMessage, refreshCode])

    const setAccessGroupProperties = useMemo(() => (async (o: {label?: string, publicRead?: boolean, publicWrite?: boolean, users?: AccessGroupUser[]}) => {
        if (!accessGroupId) return
        const {label, publicRead, publicWrite, users} = o
        if (!userId) return
        const req: SetAccessGroupPropertiesRequest = {
            type: 'setAccessGroupProperties',
            accessGroupId,
            label,
            publicRead,
            publicWrite,
            users,
            auth: { userId, googleIdToken }
        }
        const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
        if (!resp) return
        if (!isSetAccessGroupPropertiesResponse(resp)) {
            throw Error('Unexpected response')
        }
        refresh()
    }), [accessGroupId, userId, googleIdToken, refresh, setErrorMessage])

    return { accessGroup, setAccessGroupProperties, refreshAccessGroup: refresh }
}

export default useAccessGroup