import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Container, Dropdown, DropdownButton, Navbar, Spinner } from "react-bootstrap";
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from "react-router-dom";
import Block from "../components/page/Block";
import { createPage, updatePage } from "../api/pages";
import PageMetadata from "../components/page/PageMetadata";
import ErrorHandler from "../components/ErrorHandler";
import dayjs from "dayjs";
import PropTypes from 'prop-types';
import { isFrontOfficeViewWrapper } from "../components/header/Header";
import { userContext } from "../App";


const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}

const createNewBlock = (type, page_id, order) => {
  if (type === "paragraph") {
    return {
      order: order,
      type: "paragraph",
      content: "Empty Paragraph",
      page_id: page_id,
      id: dayjs().valueOf() // Locally generated id, to be replaced by the server on page create/update
    }
  }

  if (type === "image") {
    return {
      order: order,
      type: "image",
      content: "images/bread.jpg",
      page_id: page_id,
      id: dayjs().valueOf() // Locally generated id, to be replaced by the server on page create/update
    }
  }

  if (type === "header") {
    return {
      order: order,
      type: "header",
      content: "Empty Header",
      page_id: page_id,
      id: dayjs().valueOf() // Locally generated id, to be replaced by the server on page create/update
    }
  }
}


const Page = ({ isNew = false }) => {
  const user = useContext(userContext);
  const { state: revalidatorState, revalidate } = useRevalidator();
  const page = useLoaderData();
  const [searchParams] = useSearchParams();

  const forcedFrontOffice = useMemo(() => {
    return isFrontOfficeViewWrapper(searchParams, user);
  }, [searchParams, user]);

  const navigate = useNavigate()
  const [editedPage, setEditedPage] = useState(deepCopy({ ...page, blocks: [] })); // Blocks are not needed in this object
  const [editedBlocks, setEditedBlocks] = useState(deepCopy(page.blocks)); // We need to deep copy the blocks, otherwise we will modify the original page
  const [pageHasBeenEdited, setPageHasBeenEdited] = useState(false);
  const [currentlyEditingCount, setCurrentlyEditingCount] = useState(0); // Used to keep track of how many blocks are currently being edited
  const [saveError, setSaveError] = useState(null);
  useEffect(() => {
    setEditedPage(deepCopy({ ...page, blocks: [] }));
    setEditedBlocks(deepCopy(page.blocks));
    setPageHasBeenEdited(false);
  }, [page, JSON.stringify(page.blocks)]) // eslint-disable-line react-hooks/exhaustive-deps



  const saveEditedPageMetadata = (editedPageMetadata) => {
    setEditedPage((currEditedPage) => ({ ...currEditedPage, ...editedPageMetadata }));
    setPageHasBeenEdited(true);
  };

  const setEditedBlock = (block, toDelete = false) => {
    setEditedBlocks((currEditedBlocks) => {
      let blocks = [...currEditedBlocks];
      blocks = blocks.sort((a, b) => a.order - b.order);
      blocks = blocks.filter((it) => it.id != block.id);
      if (!toDelete) {
        const clampedPosition = Math.min(
          Math.max(1, block.order),
          blocks.length + 1
        );
        blocks.splice(clampedPosition - 1, 0, block);
      }
      blocks.forEach((it, idx) => {
        it.order = idx + 1; // To make sure that the order is correct and there are no duplicates
        console.log(it.id, it.content, it.order)
      });
      return blocks;
    });
    setPageHasBeenEdited(true);
  };

  const editable = useMemo(() => (!!user && (user.role === "admin" || user.id === page.author) && !forcedFrontOffice), [user, page.author, forcedFrontOffice]);

  const saveEditedPage = useCallback(() => {
    const finalPage = { ...editedPage }
    finalPage.blocks = [...editedBlocks]
    if (!isNew) {
      updatePage(page.id, finalPage)
        .then(() => {
          setPageHasBeenEdited(false);
          setSaveError(null);
          revalidate(); // To trigger a reload of the data
        })
        .catch((err) => {
          setSaveError(err);
          // TODO: Toast error
        });
    }
    else {
      // Create new page and redirect to it
      createPage(finalPage).then(
        (page) => {
          setSaveError(null); // should be useless, but always better to be safe than sorry
          navigate(`/page/${page.id}`);
        }
      ).catch((err) => {
        console.error(err);
        setSaveError(err);
        // TODO: Handle error
      })
    }
  }, [editedPage, editedBlocks, isNew, page.id, navigate, revalidate]);

  if (revalidatorState === "loading") {
    return <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  }
  return (
    <div className="w-75 mx-auto pb-5">
      {saveError !== null && <ErrorHandler error={saveError} closeError={() => setSaveError(null)} />}
      <div>
        <PageMetadata
          page={editedPage}
          editable={editable}
          saveEditedPageMetadata={saveEditedPageMetadata}
          setError={setSaveError}
          isNew={isNew}
          setCurrentlyEditingCount={setCurrentlyEditingCount}
        />
      </div>
      {editedBlocks.map((block, idx) => (
        <Block
          key={block.id}
          block={block}
          editable={editable}
          setBlock={setEditedBlock}
          isFirst={idx === 0}
          isLast={idx === editedBlocks.length - 1}
          setCurrentlyEditingCount={setCurrentlyEditingCount}
        />
      ))}

      <Navbar fixed="bottom">
        {editable ? (
          <Container>
            <DropdownButton
              id="add-block-dropdown"
              title="New Block"
              variant="primary"
              className="mx-auto"
              autoClose="outside"
              drop="up"
            >
              {['Header', 'Paragraph', 'Image'].map((type) => (<Dropdown.Item
                  key={type}
                  onClick={() =>
                    setEditedBlock(createNewBlock(type.toLowerCase(), page.id, editedBlocks.length + 1))
                  }
                >
                  {`Append new ${type}`}
                </Dropdown.Item>)
                )}

            </DropdownButton>
            <Button
              disabled={!pageHasBeenEdited || currentlyEditingCount > 0}
              onClick={saveEditedPage}
              variant="success"
              className="mx-auto"
            >
              {isNew ? "Create Page" : "Save Changes"}
            </Button>
          </Container>
        ) : (
          <> </>
        )}
      </Navbar>
    </div>
  );
};

Page.propTypes = {
  isNew: PropTypes.bool,
}

export default React.memo(Page);
