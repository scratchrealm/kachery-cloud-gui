import { IconButton, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { NodeId, PrivateKeyHex } from 'commonInterface/kacheryTypes';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
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
                key: 'privateKey',
                label: 'Private Key',
                value: (
                    <PrivateKey privateKey={client.privateKeyHex} />
                )
            },
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
                    <div>
                        <SelectProjectControl
                            projects={projects}
                            selectedProjectId={client.defaultProjectId || ''}
                            setSelectedProjectId={handleSetSelectedProject}
                        />
                        {
                            client.defaultProjectId && (
                                <div>
                                    <Hyperlink onClick={() => setRoute({page: 'project', projectId: client.defaultProjectId || ''})}>
                                        Go to project
                                    </Hyperlink>
                                </div>
                            )
                        }
                    </div>
                )
            }
        ]
    }, [client, projects, handleSetSelectedProject, handleLabelChange, setRoute])

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
            <p /><hr /><p />
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
            <p /><hr /><p />
        </div>
    )
}

const PrivateKey: FunctionComponent<{privateKey?: PrivateKeyHex}> = ({privateKey}) => {
    const [visible, setVisible] = useState<boolean>(false)
    if (!privateKey) return <span>Not available</span>
    if (!visible) {
        return <span>
            <IconButton onClick={() => setVisible(true)}><VisibilityOff /></IconButton>
            &nbsp;***hidden***
        </span>
    }
    else {
        return <span>
            <IconButton onClick={() => setVisible(false)}><Visibility /></IconButton>
            &nbsp;{privateKey}
        </span>
    }
}

export default ClientPage