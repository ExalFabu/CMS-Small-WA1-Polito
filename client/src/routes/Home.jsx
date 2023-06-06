import React from "react";
import { Container } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import PageCard from "../components/PageCard";

const Home = ( {user} ) => {
    const pages = useLoaderData();
    console.log(pages);
    return <div className="w-75 mx-auto">
        <Container className="d-flex flex-wrap align-items-center justify-content-evenly ">
            {pages.map((page) => {
                return <PageCard key={page.id} page={page} user={user} />;
            })
            }
        </Container>
    </div>;
}

export default Home;