import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Stack,
  FloatingLabel,
  Spinner,
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
  const [isFetching, setIsFetching] = useState(true);

  const forcedFrontOffice = useMemo(() => {
    return isFrontOfficeViewWrapper(searchParam, user);
  }, [searchParam, user]);
  useEffect(() => {
    api.getSiteName().then((siteName) => setSiteName(siteName));
  }, []);
  useEffect(() => {
    document.title = siteName;
    setNewSiteName(siteName);
    setIsFetching(false);
  }, [siteName]);
  const isEditable = useMemo(() => (user && user.role === "admin" && !forcedFrontOffice), [user, forcedFrontOffice]);
  const [editing, setEditing] = React.useState(false);
  const [newSiteName, setNewSiteName] = React.useState(siteName);

  const updateSiteName = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsFetching(true);
    api.setSiteName(newSiteName).then(() => {
      setSiteName(newSiteName);
      setEditing(false);
      setIsFetching(false);
    });
  }, [newSiteName]);

  if (isFetching)
    return <div className="d-flex align-items-center w-100 justify-content-center">
      <Spinner animation="grow" role="status" >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>

  return (
    <Row className="align-items-center w-100 justify-content-center">
      <Col style={{ "maxWidth": "fit-content" }}>
        {!editing ? (
          <h1 className="text-center">{siteName}</h1>
        ) : (
          <Form onSubmit={updateSiteName}>
            <FloatingLabel label="Nome del Sito">
              <Form.Control
                type="text"
                value={newSiteName}
                onChange={(ev) => setNewSiteName(ev.target.value)}
              />
            </FloatingLabel>
          </Form>
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
              onClick={updateSiteName}
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
