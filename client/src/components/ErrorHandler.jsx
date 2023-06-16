import { Alert, Button, Container } from "react-bootstrap";
import { useNavigate, useRouteError } from "react-router-dom";
import PropTypes from 'prop-types';

const ErrorHandler = ({ error: errorObject, closeError }) => {
    console.log(errorObject)
    const navigate = useNavigate();
    const routeError = useRouteError();
    const showDebugError = true;
    if (errorObject) {
        return (<Alert variant="danger" className="w-full" dismissible onClose={closeError}>
            <Alert.Heading>{errorObject.error ?? "Qualcosa è andato storto"} </Alert.Heading>
            {errorObject?.details?.error && <p>{errorObject.details.error}</p>}
            {errorObject?.details?.details && <p>{errorObject.details.details}</p>}
        </Alert>


        )
    }
    return (<>
        <Container
            bg="light"
            variant="light"
            className="mt-4 px-4 justify-content-center d-flex flex-column text-center"
        >
            <h1>{routeError.error ?? 'Something went wrong while loading the page'}</h1>
            <p>{routeError.details ?? 'If the problem persists, contact the administrator'}</p>
            {showDebugError &&
                <div>
                    <pre>{JSON.stringify(routeError)}</pre>
                </div>
            }
            <Button onClick={() => navigate("/")} variant="primary" className="mx-auto">
                Torna alla Home
            </Button>
        </Container>
    </>
    );
}

ErrorHandler.propTypes = {
    error: PropTypes.shape({
        error: PropTypes.string,
        details: PropTypes.shape({ // Might be a nested error
            error: PropTypes.string,
            details: PropTypes.string
        })
    }),
    closeError: PropTypes.func.isRequired
};

export default ErrorHandler;