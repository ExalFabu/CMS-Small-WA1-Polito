import React, { useEffect, useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import Block from "../components/Block";
import { createPage, updatePage } from "../api/pages";
import PageMetadata from "../components/PageMetadata";
import ErrorHandler from "../components/ErrorHandler";

const Page = ({ user, isNew = false }) => {
  const { revalidate } = useRevalidator();
  const navigate = useNavigate()
  const page = useLoaderData();
  const [editedPage, setEditedPage] = useState(page);
  const [editedBlocks, setEditedBlocks] = useState(page.blocks);
  const [pageHasBeenEdited, setPageHasBeenEdited] = useState(false);
  const [saveError, setSaveError] = useState(null);
  useEffect(() => {
    setEditedPage(page);
    setEditedBlocks(page.blocks);
    setPageHasBeenEdited(false);
  }, [page, JSON.stringify(page.blocks)])

  const saveEditedPageMetadata = (editedPageMetadata) => {
    setEditedPage({ ...editedPage, ...editedPageMetadata });
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
      });
      setPageHasBeenEdited(true);
      return blocks;
    });
  };

  const editable = user && (user.role === "admin" || user.id === page.author);

  const saveEditedPage = () => {
    const finalPage = { ...editedPage }
    finalPage.blocks = [...editedBlocks]
    if (!isNew) {
      updatePage(page.id, finalPage)
        .then((res) => {
          console.log(res);
          setPageHasBeenEdited(false);
          setSaveError(null);
          revalidate(); // To trigger a reload of the data
        })
        .catch((err) => {
          console.log(err);
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
      console.log(finalPage)
    }
  };
  return (
    <div className="w-75 mx-auto">
      {saveError !== null ? (
        <ErrorHandler error={saveError} closeError={() => setSaveError(null)} />) : (<></>
      )}
      <div>
        <PageMetadata
          page={editedPage}
          editable={editable}
          isAdmin={user && user.role === "admin"}
          user={user}
          saveEditedPageMetadata={saveEditedPageMetadata}
        />
      </div>
      {editedBlocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          editable={editable}
          setBlock={setEditedBlock}
        />
      ))}
      {editable ? (
        <div className="d-flex my-5">
          <Button
            onClick={() =>
              setEditedBlock({
                order: editedBlocks.length + 1,
                type: "paragraph",
                content: "Empty Paragraph",
                page_id: page.id,
                id: editedBlocks.length + 1,
              })
            }
            variant="primary"
            className="mx-auto"
          >
            Aggiungi Blocco
          </Button>
        </div>
      ) : (
        <></>
      )}
      <Navbar fixed="bottom">
        {editable ? (
          <Container>
            <Button
              disabled={!pageHasBeenEdited}
              onClick={saveEditedPage}
              variant="primary"
              className="mx-auto"
            >
              {isNew ? "Crea Pagina" : "Salva Modifiche"}
            </Button>
          </Container>
        ) : (
          <> </>
        )}
      </Navbar>
    </div>
  );
};

export default Page;
