import { IconButton } from '@material-ui/core';
import { AddCircle, Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import { isNodeId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useClients from './useClients';

type Props = {
}

const ClientsTable: FunctionComponent<Props> = () => {
    const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { clients, refreshClients, deleteClient } = useClients()

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
        }
    ]), [])

    const rows = useMemo(() => (
        (clients || []).map((client) => ({
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
                ownerId: client.ownerId.toString()
            }
        }))
    ), [clients, setRoute])

    const handleDeleteClient = useCallback((clientId: string) => {
        if (!isNodeId(clientId)) return
        deleteClient(clientId)
    }, [deleteClient])

    if (!clients) {
        return <span>Loading clients...</span>
    }

    return (
        <div>
            <h3>Clients</h3>
            <IconButton onClick={refreshClients} title="Refresh clients"><Refresh /></IconButton>
            <IconButton onClick={addVisible.show} title="Add client"><AddCircle /></IconButton>
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteClient}
            />
        </div>
    )
}

export default ClientsTable