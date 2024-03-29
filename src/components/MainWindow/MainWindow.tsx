import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useWindowDimensions from 'components/misc/useWindowDimensions';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback } from 'react';
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import useRoute from '../useRoute';
import AccessGroupPage from './AccessGroupPage';
import AccessGroupsTable from './AccessGroupsTable';
import AdminPage from './AdminPage';
import BucketPage from './BucketPage';
import BucketsTable from './BucketsTable';
import ClientPage from './ClientPage';
import ClientsTable from './ClientsTable';
import HomePage from './HomePage';
import kacheryLogoFull from './kacheryLogoFull.png';
import LeftPanel from './LeftPanel';
import './MainWindow.css';
import ProjectMembershipPage from './ProjectMembershipPage';
import ProjectPage from './ProjectPage';
import ProjectsTable from './ProjectsTable';
import RegisterClientPage from './RegisterClientPage';
import TestFeedsPage from './TestFeedsPage';
import TestTaskBackendPage from './TestTaskBackendPage';

type Props = {
}

const MainWindow: FunctionComponent<Props> = () => {
    const {route, setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    const {errorMessage} = useErrorMessage()

    const { signedIn } = useSignedIn()

    const W = width - 290
    const H = height - 50

    return (
        <div>
            <div>
                <ApplicationBar
                    title={"kachery cloud"}
                    onHome={handleHome}
                    logo={kacheryLogoFull}
                />
            </div>
            <div style={{position: 'absolute', top: 50}}>
                <div style={{position: 'absolute', left: 0, width: 250}}>
                    <LeftPanel
                        width={250}
                        height={height - 50}
                    />
                </div>
                <div style={{position: 'absolute', left: 270, width: W, height: H, overflowY: 'auto'}}>
                    {
                        errorMessage ? (
                            <span style={{color: 'red'}}>{errorMessage}</span>
                        ) : <span />
                    }
                    {
                        route.page === 'registerClient' ? (
                            <RegisterClientPage
                                clientId={route.clientId}
                                signature={route.signature}
                                label={route.label}
                            />
                        ) : (route.page === 'home') ? (
                            <HomePage />
                        ) : signedIn ? (
                            (route.page === 'projects') ? (
                                <ProjectsTable />
                            ) : route.page === 'clients' ? (
                                <ClientsTable />
                            ) : route.page === 'buckets' ? (
                                <BucketsTable />
                            ) : route.page === 'accessGroups' ? (
                                <AccessGroupsTable />
                            ) : route.page === 'project' ? (
                                <ProjectPage
                                    projectId={route.projectId}
                                />
                            ) : route.page === 'bucket' ? (
                                <BucketPage
                                    bucketId={route.bucketId}
                                />
                            ) : route.page === 'accessGroup' ? (
                                <AccessGroupPage
                                    accessGroupId={route.accessGroupId}
                                />
                            ) : route.page === 'projectMembership' ? (
                                <ProjectMembershipPage
                                    projectId={route.projectId}
                                    memberId={route.memberId}
                                />
                            ) : route.page === 'client' ? (
                                <ClientPage
                                    clientId={route.clientId}
                                />
                            ) : route.page === 'testTaskBackend' ? (
                                <TestTaskBackendPage
                                    projectId={route.projectId}
                                />
                            ) : route.page === 'testFeeds' ? (
                                <TestFeedsPage />
                            ) : route.page === 'admin' ? (
                                <AdminPage
                                    width={W}
                                    height={H}
                                />
                            ) : <span />
                        ) : (
                            <div>
                                <p />
                                <div className='PageBlurb'>You must sign in above.</div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default MainWindow