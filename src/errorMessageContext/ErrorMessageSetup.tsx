import React, { FunctionComponent } from 'react';
import ErrorMessageContext from './ErrorMessageContext';
import useSetupErrorMessage from './useSetupErrorMessage';

const ErrorMessageSetup: FunctionComponent = (props) => {
    const errorMessageData = useSetupErrorMessage()
    return (
        <ErrorMessageContext.Provider value={errorMessageData}>
            {props.children}
        </ErrorMessageContext.Provider>
    )
}

export default ErrorMessageSetup