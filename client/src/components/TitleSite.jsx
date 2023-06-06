import React from "react";
import { Button, Col, Row, Container, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

const TitleSite = ({ user }) => {
  const [siteName, setSiteName] = React.useState("Nome del Sito");
  const isEditable = user && user.role === "admin";
  const [editing, setEditing] = React.useState(false);
  const [newSiteName, setNewSiteName] = React.useState(siteName);

  const updateSiteName = (newSiteName) => {
    setSiteName(newSiteName);
    // TODO: call api to update site name
  };

  return (
    <div className="mx-auto">
      <Container>
        <Row className="align-items-center">
          <Col>
            {!editing ? <h1 className="text-center" >{siteName}</h1> : <></>}
            {editing ? (
              <Form.Control
                type="text"
                value={newSiteName}
                onChange={(ev) => setNewSiteName(ev.target.value)}
              />
            ) : (
              <></>
            )}
          </Col>
          <Col xs="2" hidden={!isEditable}>
            {!editing ? (
              <Button size="sm" onClick={() => setEditing(true)}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            ) : (
              <></>
            )}
            {editing ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(false);
                  updateSiteName(newSiteName);
                }}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
              </Button>
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TitleSite;
