import React, { useEffect, useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import Block from "../components/Block";
import { updatePageBlocks, updatePageMetadata } from "../api/pages";
import PageMetadata from "../components/PageMetadata";

const Page = ({ user }) => {
  const { revalidate } = useRevalidator();
  const page = useLoaderData();
  const [editedBlocks, setEditedBlocks] = useState(page.blocks);
  const [blocksHaveBeenEdited, setBlocksHaveBeenEdited] = useState(false);

  const saveEditedPageMetadata = (editedPage) => {
    updatePageMetadata(page.id, { ...page, ...editedPage })
      .then((res) => {
        console.log(res);
        revalidate(); // To trigger a reload of the data
      })
      .catch((err) => {
        console.log(err);
      });
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
        blocks.forEach((it, idx) => {
          it.order = idx + 1; // To make sure that the order is correct and there are no duplicates
        });
      }
      setBlocksHaveBeenEdited(true);
      return blocks;
    });
  };

  const editable = user && (user.role === "admin" || user.id === page.author);

  const saveEditedBlocks = () => {
    updatePageBlocks(page.id, editedBlocks)
      .then((res) => {
        console.log(res);
        setBlocksHaveBeenEdited(false);
        navigator(); // To trigger a reload of the data
      })
      .catch((err) => {
        console.log(err);
        // TODO: Toast error
      });
  };
  console.log(page);
  return (
    <div className="w-75 mx-auto">
      <div>
        <PageMetadata
          editable={editable}
          isAdmin={user && user.role === "admin"}
          saveEditedPage={saveEditedPageMetadata}
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
                page: page.id,
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
        <Container className="text-muted">Autore: {page.author_name}</Container>
        {editable ? (
          <Container>
            <Button
              disabled={!blocksHaveBeenEdited}
              onClick={saveEditedBlocks}
              variant="primary"
              className="mx-auto"
            >
              Salva Modifiche
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
