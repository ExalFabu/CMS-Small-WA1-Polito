import { Container } from "react-bootstrap"
import { Link } from "react-router-dom"


const NotFound = () => {
    return (
        <Container>
            <h1>404 - Not Found</h1>
            <p>Looks like a someone brought you here... but nothing is in here</p>
            <Link to="/">Go to Home</Link>
        </Container>
    )
}

export default NotFound