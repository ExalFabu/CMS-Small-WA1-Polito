import React from "react";
import { Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const PageCard = ({ page, user }) => {
  const isDeletable =
    user && (user.role === "admin" || user.id === page.author);

  const isDraft =  !page.published_at || dayjs(page.published_at).isAfter(dayjs());

  const dateText = isDraft ? "Draft" : dayjs(page.published_at).format("DD/MM/YYYY");

  const navigate = useNavigate();

  const goToPage = () => {
    navigate(`/page/${page.id}`);
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
        <Card.Body>
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
          {dateText}

          {isDeletable ? (
            <Button variant="danger" className="mx-auto">
              Elimina <FontAwesomeIcon icon={faTrash} />
            </Button>
          ) : (
            <> </>
          )}
        </Card.Footer>
      </Card>
    </>
  );
};

export default PageCard;
