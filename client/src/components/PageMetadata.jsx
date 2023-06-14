import {
  faCancel,
  faFloppyDisk,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
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
import { getEditors } from "../api/meta";
import { PubishedLabel } from "./PageCard";

const EditModePageMetadata = ({ page, isAdmin, user, saveEditedPageMetadata, cancelEdit }) => {
  const [editedPage, setEditedPage] = useState(page);
  useEffect(() => {
    setEditedPage(page);
  }, [page]);
  const [editors, setEditors] = useState([]);
  useEffect(() => {

    if (isAdmin) {
      getEditors().then((res) => {
        setEditors([{ name: user.name, id: user.id }, ...res]);
      });
    }
    else {
      setEditors([{ name: page.author_name, id: page.author }]);
    }
  }, [isAdmin, page.author, page.author_name]);

  const [pageHasChanged, setPageHasChanged] = useState(false);

  const changeEditor = (e) => {
    const editor_id = e.target.value;
    const editor_name = e.target.options[e.target.selectedIndex].label;
    setEditedPage((currEditedPage) => ({ ...currEditedPage, author: editor_id, author_name: editor_name }));
  }

  const save = () => {
    saveEditedPageMetadata(editedPage);
  };

  return (
    <Container className="">
      <Row className="align-content-center align-items-center">
        <Col>
          <FloatingLabel label="Autore">
            <Form.Select
              type="text"
              value={editedPage.author}
              disabled={!isAdmin}
              onChange={(e) => {
                changeEditor(e);
                setPageHasChanged(true);
              }}
            >
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name}
                </option>
              ))}
            </Form.Select>
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
          <FloatingLabel
            label="Data di Pubblicazione"
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

const ViewModePageMetadata = ({ page, setEditMode, editable }) => {

  return (
    <Container className="">
      <Row className="text-center align-items-center d-flex justify-content-around">
        <Col className="text-muted">
          <span>{page.author_name}</span>
        </Col>
        <Col>
          <h1>{page.title}</h1>
        </Col>
        <Col><PubishedLabel date={page.published_at} /></Col>
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

const PageMetadata = ({ page, editable, isAdmin, user, saveEditedPageMetadata }) => {
  const [editMode, setEditMode] = useState(false);

  const saveWrapper = (editedPage) => {
    saveEditedPageMetadata(editedPage);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <EditModePageMetadata
        page={page}
        isAdmin={isAdmin}
        user={user}
        saveEditedPageMetadata={saveWrapper}
        cancelEdit={() => setEditMode(false)}
      />
    );
  } else {
    return (
      <ViewModePageMetadata
        page={page}
        editable={editable}
        setEditMode={() => setEditMode(true)}
      />
    );
  }
};

export default React.memo(PageMetadata);
