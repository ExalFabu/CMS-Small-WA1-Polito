import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { Button, Container } from "react-bootstrap";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import PageCard from "../components/PageCard";

const pageIsPublished = (page) => dayjs(page.published_at).isBefore(dayjs());

const Home = ({ user, forcedFrontOffice}) => {
  const pages = useLoaderData();
  const [filteredPages, setFilteredPages] = React.useState(pages);
  useEffect(() => {
    setFilteredPages(pages);
  }, [pages]);
  const canCreatePage = useMemo(() => (user && (user.role === "admin" || user.role === "editor") && !forcedFrontOffice), [user, forcedFrontOffice])

  useEffect(() => {
    if (forcedFrontOffice) {
      setFilteredPages(pages.filter(pageIsPublished));
    } else {
      setFilteredPages(pages);
    }
  }, [forcedFrontOffice, pages]);

  const navigator = useNavigate();

  return (
    <div className="w-75 mx-auto">
      <Container className="d-flex flex-wrap align-items-center justify-content-evenly ">
        {filteredPages.map((page) => {
          return <PageCard key={page.id} page={page} user={user} forcedFrontOffice={forcedFrontOffice}/>;
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
