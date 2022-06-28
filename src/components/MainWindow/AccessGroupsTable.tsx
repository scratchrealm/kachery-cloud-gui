import { IconButton } from '@material-ui/core';
import { AddCircle, Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import useRoute from 'components/useRoute';
import { FunctionComponent, useCallback, useMemo } from 'react';
import AddAccessGroupControl from './AddAccessGroupControl';
import useAccessGroups from './useAccessGroupsForUser';

type Props = {
}

const AccessGroupsTable: FunctionComponent<Props> = () => {
    const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { accessGroups, refreshAccessGroups, addAccessGroup, deleteAccessGroup } = useAccessGroups()

    const columns = useMemo(() => ([
        {
            key: 'accessGroup',
            label: 'Access Group'
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
        },
        {
            key: 'timestampLastModified',
            label: 'Modified'
        },
        {
            key: 'service',
            label: 'Service'
        },
        {
            key: 'uri',
            label: 'URI'
        }
    ]), [])

    const rows = useMemo(() => (
        (accessGroups || []).map((accessGroup) => ({
            key: accessGroup.accessGroupId.toString(),
            columnValues: {
                accessGroup: {
                    text: accessGroup.accessGroupId,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'accessGroup', accessGroupId: accessGroup.accessGroupId})}}>
                            {accessGroup.accessGroupId}
                        </Hyperlink>
                    )
                },
                label: {
                    text: accessGroup.label,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'accessGroup', accessGroupId: accessGroup.accessGroupId})}}>
                            {accessGroup.label}
                        </Hyperlink>
                    )
                },
                ownerId: accessGroup.ownerId.toString(),
                timestampCreated: timeSince(accessGroup.timestampCreated),
                timestampLastModified: timeSince(accessGroup.timestampLastModified)
            }
        }))
    ), [accessGroups, setRoute])

    const handleDeleteAccessGroup = useCallback((accessGroupId: string) => {
        deleteAccessGroup(accessGroupId)
    }, [deleteAccessGroup])

    const handleAddAccessGroup = useCallback((label: string) => {
        addAccessGroup(label, {navigateToAccessGroupPage: true})
    }, [addAccessGroup])

    return (
        <div>
            <div className="PageHeading">Access Groups</div>
            <div className="PageBlurb">
                Access groups allow you to restrict access to resources.
            </div>
            <IconButton onClick={refreshAccessGroups} title="Refresh access groups"><Refresh /></IconButton>
            <IconButton onClick={addVisible.show} title="Add access group"><AddCircle /></IconButton>
            {
                addVisible.visible && (
                    <AddAccessGroupControl
                        onAdd={handleAddAccessGroup}
                        onClose={addVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteAccessGroup}
            />
            {
                !accessGroups ? (
                    <div>Loading access groups...</div>
                ) : <span />
            }
        </div>
    )
}

// thanks https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: number) {
    var seconds = Math.floor((Date.now() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export default AccessGroupsTable