import React from "react";
import { Button, Container } from "react-bootstrap";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import PageCard from "../components/PageCard";

const Home = ({ user }) => {
  const pages = useLoaderData();
  const canCreatePage =
    user && (user.role === "admin" || user.role === "editor");

    const navigator = useNavigate();

    return (
    <div className="w-75 mx-auto">
      <Container className="d-flex flex-wrap align-items-center justify-content-evenly ">
        {pages.map((page) => {
          return <PageCard key={page.id} page={page} user={user} />;
        })}
      </Container>
      {canCreatePage ? (
        <Container className="my-5 d-flex justify-content-center">
            <Button variant="primary" onClick={() => navigator("/page/new")}>Crea una nuova Pagina</Button>
        </Container>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Home;
