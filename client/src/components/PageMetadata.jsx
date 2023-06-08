import {
  faCancel,
  faFloppyDisk,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  InputGroup,
  Row,
  Stack,
} from "react-bootstrap";
import { useLoaderData } from "react-router-dom";

const EditModePageMetadata = ({isAdmin, saveEditedPage, cancelEdit }) => {
  const page = useLoaderData();
  const [editedPage, setEditedPage] = useState(page);
  useEffect(() => {
    setEditedPage(page);
  }, [page]);
  const [pageHasChanged, setPageHasChanged] = useState(false);

  const save = () => {
    saveEditedPage(editedPage);
  };

  return (
    <Container className="">
      <Row className="align-content-center align-items-center">
        <Col>
          <FloatingLabel label="Autore">
            <Form.Control
              type="text"
              value={editedPage.author}
              disabled={!isAdmin}
              onChange={(e) => {
                setEditedPage({ ...editedPage, author: e.target.value });
                setPageHasChanged(true);
              }}
            />
          </FloatingLabel>
        </Col>
        <Col>
          <FloatingLabel label="Titolo">
            <Form.Control
              type="text"
              value={editedPage.title}
              onChange={(e) => {
                setEditedPage({ ...editedPage, title: e.target.value });
                setPageHasChanged(true);
              }}
            />
          </FloatingLabel>
        </Col>
        <Col>
          <FloatingLabel label="Data di Pubblicazione" 
          disabled={editedPage.published_at === null}
          >
            <Form.Control
              type="date"
              size="sm"
              value={dayjs(editedPage.published_at).format("YYYY-MM-DD")}
              onChange={(e) => {
                setEditedPage({
                  ...editedPage,
                  published_at: dayjs(e.target.value).toISOString(),
                });
                setPageHasChanged(true);
              }}
              disabled={editedPage.published_at === null}
              
            />
          </FloatingLabel>
        </Col>
        <Col xs="1">
            <Form.Check
              checked={editedPage.published_at === null}
              onChange={(e) => {
                setEditedPage({
                  ...editedPage,
                  published_at: e.target.checked ? null : dayjs().toISOString(),
                });
                setPageHasChanged(true);
              }}
              aria-label="Draft"
              label="Draft"
            />
        </Col>
        <Col xs="1">
          <Stack gap={2}>
            <Button
              size="sm"
              variant="outline-success"
              disabled={!pageHasChanged}
              onClick={save}
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
            </Button>
            <div className="hr border"></div>
            <Button size="sm" variant="outline-secondary" onClick={cancelEdit}>
              <FontAwesomeIcon icon={faCancel} />
            </Button>
          </Stack>
        </Col>
      </Row>
    </Container>
  );
};

const ViewModePageMetadata = ({ setEditMode, editable }) => {
  const page = useLoaderData();
  const pageState = !dayjs(page.published_at).isValid()
    ? "Draft"
    : dayjs(page.published_at).format("DD/MM/YYYY");
  return (
    <Container className="">
      <Row className="text-center align-items-center d-flex justify-content-around">
        <Col className="text-muted">
          Autore: <span>{page.author}</span>
        </Col>
        <Col>
          <h1>{page.title}</h1>
        </Col>
        <Col className="text-muted">{pageState}</Col>
        {editable ? (
          <Col xs="1">
            <Button size="sm" variant="outline-primary" onClick={setEditMode}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          </Col>
        ) : (
          <></>
        )}
      </Row>
    </Container>
  );
};

const PageMetadata = ({ editable, isAdmin, saveEditedPage }) => {
  const [editMode, setEditMode] = useState(false);

  const save = (editedPage) => {
    saveEditedPage(editedPage);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <EditModePageMetadata
        isAdmin={isAdmin}
        saveEditedPage={save}
        cancelEdit={() => setEditMode(false)}
      />
    );
  } else {
    return (
      <ViewModePageMetadata
        editable={editable}
        setEditMode={() => setEditMode(true)}
      />
    );
  }
};

export default React.memo(PageMetadata);
