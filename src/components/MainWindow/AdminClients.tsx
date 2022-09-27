import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Client } from 'types/Client';
import { AdminGetClientsRequest, isAdminGetClientsResponse } from 'types/GuiRequest';
import { timeSince } from './ProjectsTable';

type Props = {
    width: number
    height: number
}

const AdminClients: FunctionComponent<Props> = ({width, height}) => {
    const [clients, setClients] = useState<Client[] | undefined>(undefined)
    const {userId, googleIdToken} = useSignedIn()
    const {setErrorMessage} = useErrorMessage()
    const {setRoute} = useRoute()

    const columns = useMemo(() => ([
        {
            key: 'client',
            label: 'Client'
        },
        {
            key: 'label',
            label: 'Label'
        },
        {
            key: 'ownerId',
            label: 'Owner'
        },
        {
            key: 'timestampCreated',
            label: 'Created'
        }
    ]), [])

    const rows = useMemo(() => (
        (clients || []).sort((c1, c2) => (c2.timestampCreated - c2.timestampCreated)).map((client) => {
            return {
                key: client.clientId.toString(),
                columnValues: {
                    client: {
                        text: client.label,
                        element: (
                            <Hyperlink onClick={() => {setRoute({page: 'client', clientId: client.clientId})}}>
                                {client.label} ({client.clientId})
                            </Hyperlink>
                        )
                    },
                    label: client.label,
                    ownerId: client.ownerId.toString(),
                    timestampCreated: timeSince(client.timestampCreated)
                }
            }
        })
    ), [clients, setRoute])

    useEffect(() => {
        if (!userId) return
        ;(async () => {
            const req: AdminGetClientsRequest = {
                type: 'adminGetClients',
                auth: {userId, googleIdToken}
            }
            const resp = await guiApiRequest(req, {reCaptcha: false, setErrorMessage})
            if (!isAdminGetClientsResponse(resp)) throw Error('Invalid response')
            setClients(resp.clients)
        })()
    }, [userId, googleIdToken, setErrorMessage])
    if (!clients) {
        return <div>Loading clients...</div>
    }
    return (
        <div style={{position: 'relative', width, height, overflowY: 'auto'}}>
            <NiceTable
                rows={rows}
                columns={columns}
            />
        </div>
    )
}

export default AdminClients