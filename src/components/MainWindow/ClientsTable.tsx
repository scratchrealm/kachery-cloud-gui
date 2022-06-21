import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { isNodeId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useClients from './useClients';
import useProjectsForUser from './useProjectsForUser';

type Props = {
}

const ClientsTable: FunctionComponent<Props> = () => {
    // const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { clients, refreshClients, deleteClient } = useClients()
    const { projects } = useProjectsForUser()

    const columns = useMemo(() => ([
        {
            key: 'clientId',
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
            <div className="PageHeading">Clients</div>
            <div className="PageBlurb">
                Clients are used to access kachery cloud resources on your behalf.
                &nbsp;Each client is associated with a user and a default project.
                &nbsp;If you are accessing these resources from your computer,
                &nbsp;you can register a client by installing the kachery-cloud Python package and running <span style={{fontFamily: 'courier'}}>kachery-cloud-init</span>.
            </div>
            <IconButton onClick={refreshClients} title="Refresh clients"><Refresh /></IconButton>
            {/* <IconButton onClick={addVisible.show} title="Add client"><AddCircle /></IconButton> */}
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