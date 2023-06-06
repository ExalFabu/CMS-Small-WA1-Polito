import React from "react";
import { Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const PageCard = ({ page, user }) => {
  const isDeletable =
    user && (user.role === "admin" || user.id === page.author);

  const navigate = useNavigate();

  const goToPage = () => {
    navigate(`/page/${page.id}`);
  };
  return (
    <Card
      style={{ minWidth: "20%", maxWidth: "33%" }}
      className="m-2"
      onClick={goToPage}
    >
      <Card.Body>
        <Card.Title>{page.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {" "}
          {page.author}
        </Card.Subtitle>
      </Card.Body>
      {isDeletable ? (
        <Card.Footer
          className="text-muted d-flex justify-content-center"
          style={{ height: "min-content" }}
        >
          <Button variant="danger" className="mx-auto">
            Elimina <FontAwesomeIcon icon={faTrash} />
          </Button>
        </Card.Footer>
      ) : (
        <> </>
      )}
    </Card>
  );
};

export default PageCard;
