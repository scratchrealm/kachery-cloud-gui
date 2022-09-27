import { FunctionComponent } from 'react';
import AdminClients from './AdminClients';
import AdminProjects from './AdminProjects';
import TabWidget from './TabWidget';

type Props = {
    width: number
    height: number
}

const tabs = [{label: 'Projects'}, {label: 'Clients'}]

const AdminPage: FunctionComponent<Props> = ({width, height}) => {
    return (
        <TabWidget
            tabs={tabs}
            width={width}
            height={height}
        >
            <AdminProjects
                width={0}
                height={0}
            />
            <AdminClients
                width={0}
                height={0}
            />
        </TabWidget>
    )
}

export default AdminPage