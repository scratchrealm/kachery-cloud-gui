import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback } from 'react';
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import useRoute from '../useRoute';
import ProjectMembershipPage from './ProjectMembershipPage';
import ProjectPage from './ProjectPage';
import HomePage from './HomePage';
import ClientPage from './ClientPage';
import RegisterClientPage from './RegisterClientPage';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import logo from './logo.png'
import kacheryLogoFull from './kacheryLogoFull.png'

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
            <div style={{margin: 20, maxWidth: 1000}}>
                {
                    errorMessage ? (
                        <span style={{color: 'red'}}>{errorMessage}</span>
                    ) : <span />
                }
                {
                    signedIn ? (
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
                    ) : (
                        <div>
                            <h3>Welcome to kachery cloud.</h3>
                            <h3>Sign in above to get started.</h3>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default MainWindow