import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import PropTypes from 'prop-types';

const FAST_LOGIN = false;

function LoginForm(props) {
  let startingState = {
    username: "",
    password: "",
  };
  
  if(FAST_LOGIN){
    startingState = {
      username: "buffa@test.com",
      password: "password",
    };
  }

  const [username, setUsername] = useState(startingState.username);
  const [password, setPassword] = useState(startingState.password);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const doLogIn = ({ username, password }) => {
    login(username, password)
      .then((user) => {
        setErrorMessage("");
        props.login(user);
        navigate(-1);
      })
      .catch(() => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage("Wrong username or password");
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");
    const credentials = { username, password };

    // SOME VALIDATION, ADD MORE if needed (e.g., check if it is an email if an email is required, etc.)
    let valid = true;
    if (username === "" || password === "") valid = false;

    if (valid) {
      doLogIn(credentials);
    } else {
      // TODO: show a better error message...
      setErrorMessage("Error(s) in the form, please fix it/them.");
    }
  };

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6}>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert
                variant="danger"
                dismissible
                onClick={() => setErrorMessage("")}
              >
                {errorMessage}
              </Alert>
            ) : (
              ""
            )}
            <Form.Group controlId="username">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </Form.Group>
            <Button className="my-2" type="submit">
              Login
            </Button>
            <Button
              className="my-2 mx-2"
              variant="danger"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  );
}

LoginForm.propTypes = {
  login: PropTypes.func.isRequired,
};

export default LoginForm;
