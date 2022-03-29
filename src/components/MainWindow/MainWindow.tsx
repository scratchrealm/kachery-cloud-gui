import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback } from 'react';
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import useRoute from '../useRoute';
import ProjectMembershipPage from './ProjectMembershipPage';
import ProjectPage from './ProjectPage';
import HomePage from './HomePage';
import ClientPage from './ClientPage';
import RegisterClientPage from './RegisterClientPage';

type Props = {

}

const MainWindow: FunctionComponent<Props> = () => {
    const {route, setRoute} = useRoute()
    // const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    const {errorMessage} = useErrorMessage()

    return (
        <div>
            <div>
                <ApplicationBar
                    title={"kachery cloud"}
                    onHome={handleHome}
                    logo={undefined}
                />
            </div>
            <div style={{margin: 20, maxWidth: 1000}}>
                {
                    errorMessage ? (
                        <span style={{color: 'red'}}>{errorMessage}</span>
                    ) : <span />
                }
                {
                    route.page === 'home' ? (
                        <HomePage />
                    ) : route.page === 'project' ? (
                        <ProjectPage
                            projectId={route.projectId}
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
                    ) : route.page === 'registerClient' ? (
                        <RegisterClientPage
                            clientId={route.clientId}
                            signature={route.signature}
                            label={route.label}
                        />
                    ) : <span />
                }
            </div>
        </div>
    )
}

export default MainWindow