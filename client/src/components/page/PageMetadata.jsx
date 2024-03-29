import {
  faCancel,
  faFloppyDisk,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
  Stack,
} from "react-bootstrap";
import { getEditors } from "../../api/meta";
import { PubishedLabel } from "../PageCard";
import pagesApi from "../../api/pages";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../DeleteButton";
import PropTypes from 'prop-types';
import { userContext } from "../../App";

const EditModePageMetadata = ({ page, saveEditedPageMetadata, cancelEdit, deletePage, isNew }) => {
  const user = useContext(userContext);
  const isAdmin = useMemo(() => (user && user.role === "admin"), [user]);
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
  }, [isAdmin, page.author, page.author_name, user.id, user.name]);

  const [pageHasChanged, setPageHasChanged] = useState(false);

  const changeEditor = (e) => {
    const editor_id = parseInt(e.target.value);
    const editor_name = e.target.options[e.target.selectedIndex].label;
    setEditedPage((currEditedPage) => ({ ...currEditedPage, author: editor_id, author_name: editor_name }));
  }

  const save = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    saveEditedPageMetadata(editedPage);
  };

  return (
    <Container as={Form} onSubmit={save} className="">
      <Row className="align-content-center align-items-center">
        <Col>
          <FloatingLabel label="Author">
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
          <FloatingLabel label="Title">
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
            label="Publish Date"
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
            {!isNew && (<>
              <div className="hr border"></div>
              <DeleteButton onClick={deletePage} popoverText={`Click twice to delete the current Page`} />
            </>)}
          </Stack>
        </Col>
      </Row>
    </Container>
  );
};

EditModePageMetadata.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.number,
    author: PropTypes.number.isRequired,
    author_name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    created_at: PropTypes.string
  }),
  saveEditedPageMetadata: PropTypes.func.isRequired,
  cancelEdit: PropTypes.func.isRequired,
  deletePage: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired
};

const ViewModePageMetadata = ({ page, setEditMode, editable, deletePage, isNew }) => {

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
            {!isNew && (<>
              <div className="hr border"></div>
              <DeleteButton onClick={deletePage} popoverText={`Click twice to delete the current Page`} />
            </>)}
          </Col>
        ) : (
          <></>
        )}
      </Row>
    </Container>
  );
};

ViewModePageMetadata.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.number,
    author: PropTypes.number.isRequired,
    author_name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    created_at: PropTypes.string
  }),
  editable: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  deletePage: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired
};

const PageMetadata = ({ page, editable, saveEditedPageMetadata, setError, isNew, setCurrentlyEditingCount }) => {
  const [editMode, setEditMode] = useState(false);
 

  useEffect(() => {
    if (editMode) {
      setCurrentlyEditingCount((count) => count + 1);
    }
    return () => {
      if (editMode) {
        setCurrentlyEditingCount((count) => count - 1);
      }
    }
  }, [editMode, setCurrentlyEditingCount]);

  const saveWrapper = (editedPage) => {
    saveEditedPageMetadata(editedPage);
    setEditMode(false);
  };

  const navigator = useNavigate();
  const deletePage = () => {
    pagesApi.deletePage(page.id).then(() => {
      navigator("/");
    }).catch((err) => {
      console.error(err);
      setError(err);
    });
  }

  if (editMode) {
    return (
      <EditModePageMetadata
        page={page}
        saveEditedPageMetadata={saveWrapper}
        cancelEdit={() => setEditMode(false)}
        deletePage={deletePage}
        isNew={isNew}
      />
    );
  } else {
    return (
      <ViewModePageMetadata
        page={page}
        editable={editable}
        setEditMode={() => setEditMode(true)}
        deletePage={deletePage}
        isNew={isNew}
      />
    );
  }
};

PageMetadata.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.number,
    author: PropTypes.number.isRequired,
    author_name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    created_at: PropTypes.string
  }),
  editable: PropTypes.bool.isRequired,
  saveEditedPageMetadata: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired,
  setCurrentlyEditingCount: PropTypes.func.isRequired
};

export default React.memo(PageMetadata);
