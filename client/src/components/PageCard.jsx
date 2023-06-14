import { useMemo } from "react";
import {  Card, Stack } from "react-bootstrap";
import { useNavigate, useRevalidator } from "react-router-dom";
import dayjs from "dayjs";
import pagesApi from "../api/pages";
import DeleteButton from "./DeleteButton";

export const PubishedLabel = ({date}) => {
  const publishedDate = dayjs(date);
  if (!publishedDate.isValid()) return <span className="text-muted">Draft</span>;
  if (publishedDate.isAfter(dayjs()))
    return <Stack className="text-muted" direction="vertical"><span>{publishedDate.format("DD/MM/YYYY")}</span><span>(scheduled)</span></Stack>;
  return <span className="text-muted">{publishedDate.format("DD/MM/YYYY")}</span>;
}

const PageCard = ({ page, user, forcedFrontOffice }) => {
  const { revalidate } = useRevalidator();
  const isDeletable = useMemo(() => (user && (user.role === "admin" || user.id === page.author) && !forcedFrontOffice), [user, forcedFrontOffice, page.author])

  const navigate = useNavigate();

  const goToPage = () => {
    navigate(`/page/${page.id}`);
  };

  const deletePage = (e) => {
    e.stopPropagation();
    pagesApi.deletePage(page.id).then(() => {
      revalidate();
    });
    // TODO: catch errors
  };


  return (
    <>
      <style>
        {`
          .pageCard {
            min-width: 20%;
            max-width: 48%;  
            transition: all 0.3s ease-in-out;
          }
            .pageCard:hover {
              box-shadow: 0 0 11px rgba(33,33,33,.2);
              transform: scale(1.04, 1.04);
              transition: all 0.2s ease-in-out;
              border: 1px solid blue;
              cursor: pointer;
          }
      `}
      </style>
      <Card className="m-2 pageCard" onClick={goToPage}>
        <Card.Body >
          <Card.Title>{page.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {" by "}
            {page.author_name ?? "Anonimo"}
          </Card.Subtitle>
        </Card.Body>
        <Card.Footer
          className="text-muted d-flex justify-content-around align-items-center align-content-center gap-5"
          style={{ height: "min-content" }}
        >
          <PubishedLabel date={page.published_at} />

          {isDeletable ? (
            // <Button variant="danger" className="mx-auto" onClick={deletePage}>
            //   Elimina <FontAwesomeIcon icon={faTrash} />
            // </Button>
            <DeleteButton onClick={deletePage} label={"Delete"} />
          ) : (
            <> </>
          )}
        </Card.Footer>
      </Card>
    </>
  );
};

export default PageCard;
