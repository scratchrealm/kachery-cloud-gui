import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { NodeId } from 'commonInterface/kacheryTypes';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useClients from './useClients';

type Props = {
    clientId: NodeId
}

const ClientPage: FunctionComponent<Props> = ({clientId}) => {
    const { clients } = useClients()
    const { setRoute } = useRoute()

    const client = useMemo(() => (
        (clients || []).filter(client => (client.clientId === clientId))[0]
    ), [clients, clientId])

    const tableData = useMemo(() => {
        if (!client) return undefined
        return [
            { key: 'clientId', label: 'Client ID', value: client.clientId.toString() },
            { key: 'label', label: 'Label', value: client.label },
            { key: 'ownerId', label: 'Owner', value: client.ownerId.toString() },
            { key: 'timestampCreated', label: 'Created', value: `${new Date(client.timestampCreated)}` }
        ]
    }, [client])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    if (!clients) {
        return <span>Loading...</span>
    }

    if (!client) {
        return <span>client not found: {clientId}</span>
    }


    if (!tableData) return <div />
    return (
        <div>
            <Hyperlink onClick={handleBack}>Back</Hyperlink>
            <Table className="NiceTable2">
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