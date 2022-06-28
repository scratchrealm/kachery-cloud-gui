import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import { FunctionComponent, useCallback, useMemo } from 'react';
import AccessGroupPropertiesView from './AccessGroupPropertiesView';
import EditableTextField from './EditableTextField';
import useAccessGroup from './useAccessGroup';

type Props = {
    accessGroupId: string
}

const AccessGroupPage: FunctionComponent<Props> = ({accessGroupId}) => {
    const { accessGroup, setAccessGroupProperties } = useAccessGroup(accessGroupId)
    const { setRoute } = useRoute()

    const { userId, googleIdToken } = useSignedIn()

    const handleChangeLabel = useCallback((newLabel: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            await setAccessGroupProperties({label: newLabel})
        })()
    }, [userId, googleIdToken, setAccessGroupProperties])

    const tableData = useMemo(() => {
        if (!accessGroup) return undefined
        return [
            {
                key: 'accessGroupLabel',
                label: 'Access group label',
                value: (
                    <EditableTextField
                        value={accessGroup.label}
                        onChange={handleChangeLabel}
                    />
                )
            },
            { key: 'accessGroupId', label: 'Access group ID', value: accessGroup.accessGroupId.toString() },
            { key: 'ownerId', label: 'Owner', value: accessGroup.ownerId.toString() },
            { key: 'timestampCreated', label: 'Created', value: `${new Date(accessGroup.timestampCreated)}` },
            { key: 'timestampLastModified', label: 'Modified', value: `${new Date(accessGroup.timestampLastModified)}` }
        ]
    }, [accessGroup, handleChangeLabel])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    if (!accessGroup) {
        return <span>Loading...</span>
    }

    if (!tableData) return <div />
    return (
        <div>
            <p /><hr /><p />
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
            <p /><hr /><p />
            <AccessGroupPropertiesView
                accessGroup={accessGroup}
                setAccessGroupProperties={setAccessGroupProperties}
            />
            <p /><hr /><p />
        </div>
    )
}

export default AccessGroupPage