import { IconButton } from '@material-ui/core';
import { AddCircle, Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { isNodeId } from 'commonInterface/kacheryTypes';
import useVisible from 'components/misc/useVisible';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import CreateClientControl from './CreateClientControl';
import useClients from './useClients';
import useProjectsForUser from './useProjectsForUser';

type Props = {
}

const ClientsTable: FunctionComponent<Props> = () => {
    const createClientVisible = useVisible()

    const {setRoute} = useRoute()

    const { clients, refreshClients, deleteClient, createClient } = useClients()
    const { projects } = useProjectsForUser()

    const columns = useMemo(() => ([
        {
            key: 'client',
            label: 'Client'
        },
        {
            key: 'ownerId',
            label: 'Owner'
        },
        {
            key: 'defaultProject',
            label: 'Default project'
        }
    ]), [])

    const rows = useMemo(() => (
        (clients || []).map((client) => {
            const defaultProjectId = client.defaultProjectId
            const defaultProjectLabel: string | undefined = defaultProjectId ? (
                (projects || []).filter(p => (p.projectId === defaultProjectId))[0]?.label || undefined
            ) : undefined
            return {
                key: client.clientId.toString(),
                columnValues: {
                    client: {
                        text: client.clientId.toString(),
                        element: <Hyperlink onClick={() => {setRoute({page: 'client', clientId: client.clientId})}}>
                            {client.label} ({client.clientId.slice(0, 10)}...)
                        </Hyperlink>
                    },
                    ownerId: client.ownerId.toString(),
                    defaultProject: {
                        text: defaultProjectLabel || '',
                        element: defaultProjectId ? (
                            <Hyperlink onClick={() => {setRoute({page: 'project', projectId: defaultProjectId})}}>{defaultProjectLabel} ({defaultProjectId})</Hyperlink>
                        ) : <span />
                    }
                }
            }
        })
    ), [clients, setRoute, projects])

    const handleDeleteClient = useCallback((clientId: string) => {
        if (!isNodeId(clientId)) return
        deleteClient(clientId)
    }, [deleteClient])

    const handleCreateClient = useCallback((label: string) => {
        createClient(label, {navigateToClientPage: true})
    }, [createClient])

    return (
        <div style={{maxWidth: 1000}}>
            <div className="PageHeading">Clients</div>
            <div className="PageBlurb">
                Clients are used to access kachery cloud resources on your behalf.
                &nbsp;Each client is associated with a user and a default project.
                &nbsp;If you are accessing these resources from your computer,
                &nbsp;you can register a client by installing the kachery-cloud Python package and running <span style={{fontFamily: 'courier'}}>kachery-cloud-init</span>.
            </div>
            <IconButton onClick={refreshClients} title="Refresh clients"><Refresh /></IconButton>
            <IconButton onClick={createClientVisible.show} title="Create client"><AddCircle /></IconButton>
            {
                createClientVisible.visible && (
                    <CreateClientControl
                        onCreate={handleCreateClient}
                        onClose={createClientVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteClient}
            />
            {
                !clients ? (
                    <div>Loading clients...</div>
                ) : <span />
            }
        </div>
    )
}

export default ClientsTable