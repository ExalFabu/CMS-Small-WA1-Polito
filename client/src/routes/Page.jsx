import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import Block from "../components/Block";
import { createPage, updatePage } from "../api/pages";
import PageMetadata from "../components/PageMetadata";
import ErrorHandler from "../components/ErrorHandler";
import dayjs from "dayjs";

const Page = ({ user, isNew = false, forcedFrontOffice }) => {
  const { revalidate } = useRevalidator();
  const navigate = useNavigate()
  const page = useLoaderData();
  const [editedPage, setEditedPage] = useState(page);
  const [editedBlocks, setEditedBlocks] = useState(page.blocks);
  const [pageHasBeenEdited, setPageHasBeenEdited] = useState(false);
  const [saveError, setSaveError] = useState(null);
  useEffect(() => {
    setEditedPage(page);
    setPageHasBeenEdited(false);
  }, [page])


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
      });
      setPageHasBeenEdited(true);
      return blocks;
    });
  };

  const editable = useMemo(() => (user && (user.role === "admin" || user.id === page.author) && !forcedFrontOffice), [user, page.author, forcedFrontOffice]);

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
  return (
    <div className="w-75 mx-auto">
      {saveError !== null && <ErrorHandler error={saveError} closeError={() => setSaveError(null)} />}
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
          length={editedBlocks.length}
        />
      ))}

      <Navbar fixed="bottom">
        {editable ? (
          <Container>
            <Button
            onClick={() =>
              setEditedBlock({
                order: editedBlocks.length + 1,
                type: "paragraph",
                content: "Empty Paragraph",
                page_id: page.id,
                id: dayjs().unix(),
              })
            }
            variant="primary"
            className="mx-auto"
          >
            Aggiungi Blocco
          </Button>
            <Button
              disabled={!pageHasBeenEdited}
              onClick={saveEditedPage}
              variant="success"
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
