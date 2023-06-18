import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Stack,
  FloatingLabel,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faFloppyDisk,
  faCancel,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../api/meta";
import PropTypes from 'prop-types';
import { useSearchParams } from "react-router-dom";
import { isFrontOfficeViewWrapper } from "./Header";

const TitleSite = ({ user }) => {
  const [siteName, setSiteName] = useState("");
  const [searchParam] = useSearchParams();

  const forcedFrontOffice = useMemo(() => {
    return isFrontOfficeViewWrapper(searchParam, user);
  }, [searchParam, user]);
  useEffect(() => {
    api.getSiteName().then((siteName) => setSiteName(siteName));
  }, []);
  useEffect(() => {
    document.title = siteName;
    setNewSiteName(siteName);
  }, [siteName]);
  const isEditable = useMemo(() => (user && user.role === "admin" && !forcedFrontOffice), [user, forcedFrontOffice]);
  const [editing, setEditing] = React.useState(false);
  const [newSiteName, setNewSiteName] = React.useState(siteName);

  const updateSiteName = (newSiteName) => {
    api.setSiteName(newSiteName).then(() => setSiteName(newSiteName));
  };

  return (
    <Row className="align-items-center w-100 justify-content-center">
      <Col style={{ "maxWidth": "fit-content" }}>
        {!editing ? (
          <h1 className="text-center">{siteName}</h1>
        ) : (
          <FloatingLabel label="Nome del Sito">
            <Form.Control
              type="text"
              value={newSiteName}
              onChange={(ev) => setNewSiteName(ev.target.value)}
            />
          </FloatingLabel>
        )}
      </Col>
      <Col xs="1" hidden={!isEditable}>
        {!editing ? (
          <Button size="sm" onClick={() => setEditing(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        ) : (
          <Stack gap={2}>
            <Button
              size="sm"
              variant="outline-success"
              onClick={() => {
                setEditing(false);
                updateSiteName(newSiteName);
              }}
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                setNewSiteName(siteName);
                setEditing(false);
              }}
            >
              <FontAwesomeIcon icon={faCancel} />
            </Button>
          </Stack>
        )}
      </Col>
    </Row>
  );
};

TitleSite.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
  })
};

export default TitleSite;
