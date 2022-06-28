import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback, useMemo } from 'react';
import AccessGroupPropertiesView from './AccessGroupPropertiesView';
import EditableTextField from './EditableTextField';
import useAccessGroup from './useAccessGroup';

type Props = {
    accessGroupId: string
}

const AccessGroupPage: FunctionComponent<Props> = ({accessGroupId}) => {
    const { accessGroup, setAccessGroupProperties, refreshAccessGroup } = useAccessGroup(accessGroupId)
    const { setRoute } = useRoute()

    const { setErrorMessage } = useErrorMessage()

    const { userId, googleIdToken } = useSignedIn()

    const handleChangeLabel = useCallback((newLabel: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            await setAccessGroupProperties({label: newLabel})
        })()
    }, [userId, googleIdToken, accessGroupId, refreshAccessGroup, setErrorMessage])

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
            { key: 'ownerId', label: 'Owner', value: accessGroup.accessGroupId.toString() },
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
            <AccessGroupPropertiesView
                accessGroup={accessGroup}
                setAccessGroupProperties={setAccessGroupProperties}
            />
        </div>
    )
}

export default AccessGroupPage