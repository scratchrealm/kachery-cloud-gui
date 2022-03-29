import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { isNodeId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useClients from './useClients';
import useProjects from './useProjects';

type Props = {
}

const ClientsTable: FunctionComponent<Props> = () => {
    // const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { clients, refreshClients, deleteClient } = useClients()
    const { projects } = useProjects()

    const columns = useMemo(() => ([
        {
            key: 'clientId',
            label: 'Client ID'
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
                    clientId: {
                        text: client.clientId.toString(),
                        element: <Hyperlink onClick={() => {setRoute({page: 'client', clientId: client.clientId})}}>{client.clientId}</Hyperlink>
                    },
                    label: {
                        text: client.label,
                        element: <Hyperlink onClick={() => {setRoute({page: 'client', clientId: client.clientId})}}>{client.label}</Hyperlink>
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

    return (
        <div>
            <h3>Clients</h3>
            <p>
                Clients are used to access kachery cloud resources on your behalf.
                If you are accessing these resources from you computer,
                you can register a client by running <span style={{fontFamily: 'courier'}}>kachery-cloud-init</span>.
            </p>
            <IconButton onClick={refreshClients} title="Refresh clients"><Refresh /></IconButton>
            {/* <IconButton onClick={addVisible.show} title="Add client"><AddCircle /></IconButton> */}
            {
                !clients ? (
                    <div>Loading clients...</div>
                ) : <span />
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteClient}
            />
        </div>
    )
}

export default ClientsTable