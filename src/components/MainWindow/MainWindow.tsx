import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback } from 'react';
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import useRoute from '../useRoute';
import AdminPage from './AdminPage';
import BucketPage from './BucketPage';
import ClientPage from './ClientPage';
import HomePage from './HomePage';
import kacheryLogoFull from './kacheryLogoFull.png';
import ProjectMembershipPage from './ProjectMembershipPage';
import ProjectPage from './ProjectPage';
import RegisterClientPage from './RegisterClientPage';
import TestFeedsPage from './TestFeedsPage';
import TestTaskBackendPage from './TestTaskBackendPage';

type Props = {

}

const MainWindow: FunctionComponent<Props> = () => {
    const {route, setRoute} = useRoute()
    // const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    const {errorMessage} = useErrorMessage()

    const { signedIn } = useSignedIn()

    return (
        <div>
            <div>
                <ApplicationBar
                    title={"kachery cloud"}
                    onHome={handleHome}
                    logo={kacheryLogoFull}
                />
            </div>
            <div style={{margin: 20}}>
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
                    ) : signedIn ? (
                        route.page === 'home' ? (
                            <HomePage />
                        ) : route.page === 'project' ? (
                            <ProjectPage
                                projectId={route.projectId}
                            />
                        ) : route.page === 'bucket' ? (
                            <BucketPage
                                bucketId={route.bucketId}
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
                            <AdminPage />
                        ) : <span />
                    ) : (
                        <HomePage />
                    )
                }
            </div>
        </div>
    )
}

export default MainWindow