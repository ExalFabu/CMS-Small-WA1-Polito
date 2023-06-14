import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Stack, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faFloppyDisk,
  faCancel,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { getImages } from "../api/meta";
import { URL_IMAGES } from "../api";
import DeleteButton from "./DeleteButton";

const HeaderBlock = ({ block }) => {
  return <h2>{block.content}</h2>;
};

const ParagraphBlock = ({ block }) => {
  return <p>{block.content}</p>;
};

const ImageBlock = ({ block }) => {
  return <Image style={{ maxHeight: "400px" }} src={`${URL_IMAGES}/${block.content}`} rounded fluid />;
};

const ViewBlock = ({ block }) => {
  switch (block.type) {
    case "header":
      return <HeaderBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    default:
      return <div>Unknown block type</div>;
  }
};

const EditableBlock = ({ block, setBlock }) => {
  const [selectableImages, setSelectableImages] = useState([]);
  useEffect(() => {
    getImages().then((images) => setSelectableImages(images));
  }, []);

  return (
    <Form className="my-2" >
      <Form.Group>
        <Form.Label>Tipo</Form.Label>
        <Form.Select
          value={block.type}
          onChange={(ev) => setBlock({ ...block, type: ev.target.value })}
        >
          <option value="header">Header</option>
          <option value="paragraph">Paragraph</option>
          <option value="image">Image</option>
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label>Contenuto</Form.Label>
        {block.type === "image" ? (<>
          <Form.Select
            value={block.content}
            onChange={(ev) => setBlock({ ...block, content: ev.target.value })}
            isInvalid={selectableImages.find((it) => it.path === block.content) === undefined}
          >
            {[...selectableImages, { path: block.content, name: "Choose an image" }].map((image) => (
              <option key={image.name} value={image.path}>
                {image.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">Choose one</Form.Control.Feedback>
        </>
        ) : (<>
          <Form.Control
            type="text"
            {...(block.type === "paragraph" && { as: "textarea", rows: 3 })}
            value={block.content}
            onChange={(ev) => setBlock({ ...block, content: ev.target.value })}
            isInvalid={block.content === ""}
          />
          <Form.Control.Feedback type="invalid">Cannot be empty </Form.Control.Feedback>
        </>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label>Ordine</Form.Label>
        <Form.Control
          type="number"
          value={block.order}
          disabled
          onChange={(ev) =>
            setBlock({ ...block, order: ev.target.valueAsNumber })
          }
        />
      </Form.Group>
    </Form>
  );
};

const Block = ({ block, editable, setBlock, length }) => {
  const [localBlock, setLocalBlock] = useState(block);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const saveBlock = useCallback(() => {
    setBlock(localBlock);
    setIsEditing(false);
  }, [localBlock, setBlock]);

  const cancelEdit = useCallback(() => {
    setLocalBlock(block);
    setIsEditing(false);
  }, [block]);

  const deleteBlock = useCallback(() => {
    setBlock(block, true);
  }, [block, setBlock]);

  const isValid = useCallback(() => {
    return localBlock.content !== "";
  }, [localBlock]);

  return (
    <Container style={editable ? { borderTop: "dashed 1px gray" } : {}}>
      <Row className="align-items-center my-2">
        {editable ? (
          <Col xs="auto">
            {isEditing ? (
              <Stack gap={2}>
                <Button size="sm" variant="outline-success" disabled={!isValid()} onClick={saveBlock}>
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </Button>
                <div className="hr border"></div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={cancelEdit}
                >
                  <FontAwesomeIcon icon={faCancel} />
                </Button>
              </Stack>
            ) : (
              <Stack gap={2} direction="vertical">
                <Stack gap={1} direction="horizontal">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    disabled={block.order === 1}
                    onClick={() => setBlock({ ...block, order: block.order - 1 })}
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Button>
                </Stack>
                <Stack gap={1} direction={"horizontal"}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    disabled={block.order === length}
                    onClick={() => setBlock({ ...block, order: block.order + 1 })}
                  >
                    <FontAwesomeIcon icon={faArrowDown} />
                  </Button>
                  {/* <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={deleteBlock}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button> */}
                  <DeleteButton
                    onClick={deleteBlock}
                    />
                </Stack>
              </Stack>
            )}
          </Col>
        ) : (
          <></>
        )}
        <Col>
          {editable && isEditing ? (
            <EditableBlock block={localBlock} setBlock={setLocalBlock} />
          ) : (
            <ViewBlock block={localBlock} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Block;
