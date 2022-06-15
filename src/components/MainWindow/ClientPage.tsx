import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { NodeId } from 'commonInterface/kacheryTypes';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { SetClientInfoRequest } from 'types/GuiRequest';
import EditableTextField from './EditableTextField';
import SelectProjectControl from './SelectProjectControl';
import useClients from './useClients';
import useProjectsForUser from './useProjectsForUser';

type Props = {
    clientId: NodeId
}

const ClientPage: FunctionComponent<Props> = ({clientId}) => {
    const { clients, refreshClients } = useClients()
    const { projects } = useProjectsForUser()
    const { setRoute } = useRoute()

    const client = useMemo(() => (
        (clients || []).filter(client => (client.clientId === clientId))[0]
    ), [clients, clientId])

    const {userId, googleIdToken} = useSignedIn()

    const { setErrorMessage } = useErrorMessage()

    const handleSetSelectedProject = useCallback((projectId: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: SetClientInfoRequest = {
                type: 'setClientInfo',
                clientId,
                defaultProjectId: projectId,
                auth: {
                    userId, googleIdToken
                }
            }
            await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
            refreshClients()
        })()
    }, [clientId, userId, googleIdToken, refreshClients, setErrorMessage])

    const handleLabelChange = useCallback((label: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: SetClientInfoRequest = {
                type: 'setClientInfo',
                clientId,
                label,
                auth: {
                    userId, googleIdToken
                }
            }
            await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
            refreshClients()
        })()
    }, [clientId, userId, googleIdToken, refreshClients, setErrorMessage])

    const tableData = useMemo(() => {
        if (!client) return undefined
        if (!projects) return undefined
        return [
            { key: 'clientId', label: 'Client ID', value: client.clientId.toString() },
            {
                key: 'label',
                label: 'Label',
                value: (
                    <EditableTextField
                        value={client.label}
                        onChange={handleLabelChange}
                    />
                )
            },
            { key: 'ownerId', label: 'Owner', value: client.ownerId.toString() },
            { key: 'timestampCreated', label: 'Created', value: `${new Date(client.timestampCreated)}` },
            {
                key: 'defaultProject',
                label: 'Default project',
                value: (
                    <SelectProjectControl
                        projects={projects}
                        selectedProjectId={client.defaultProjectId || ''}
                        setSelectedProjectId={handleSetSelectedProject}
                    />
                )
            }
        ]
    }, [client, projects, handleSetSelectedProject, handleLabelChange])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    if (!clients) {
        return <span>Loading...</span>
    }

    if (!client) {
        return <span style={{color: 'red'}}>Client not found for user {userId}: {clientId}</span>
    }


    if (!tableData) return <div />
    return (
        <div>
            <Hyperlink onClick={handleBack}>Back</Hyperlink>
            <Table>
                <TableBody>
                    {
                        tableData.map(x => (
                            <TableRow key={x.key}>
                                <TableCell>{x.label}: </TableCell>
                                <TableCell style={{wordBreak: 'break-word'}}>{x.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ClientPage