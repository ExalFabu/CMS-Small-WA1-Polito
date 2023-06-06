import React, { useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import Block from "../components/Block";
import { updatePage } from "../api/pages";

const Page = ({ user }) => {
  const page = useLoaderData();
  const [editedBlocks, setEditedBlocks] = useState([]);
  const setEditedBlock = (block) => {
    setEditedBlocks((currEditedBlocks) => {
        const newEditedBlocks = [...currEditedBlocks];
        const idx = newEditedBlocks.findIndex((b) => b.id === block.id);
        if (idx === -1) {
          newEditedBlocks.push(block);
        } else {
          newEditedBlocks[idx] = block;
        }
        return newEditedBlocks;
    });
  };
  const editable = user && (user.role === "admin" || user.id === page.author);
    const saveEdits = () => {
        page.blocks = page.blocks.map((block) => {
            return editedBlocks.find((b) => b.id === block.id) ?? block;
        });
        updatePage(page.id, page).then((res) => {
            console.log(res);
            setEditedBlocks([]);
        }).catch((err) => {
            console.log(err);
        });
    };
  console.log(page);
  return (
    <div className="w-75 mx-auto">
      <div className="text-center">
        <h1>{page.title}</h1>
      </div>
      {page.blocks.map((block) => (
        <Block key={block.id} block={block} editable={editable} setBlock={setEditedBlock} />
      ))}
      <Navbar fixed="bottom">
        <Container className="text-muted">
            Autore: {page.author}
        </Container>
        <Container>
            <Button disabled={editedBlocks.length === 0} onClick={saveEdits} variant="primary" className="mx-auto">
                Salva Modifiche</Button>            
        </Container>
      </Navbar>
    </div>
  );
};

export default Page;
