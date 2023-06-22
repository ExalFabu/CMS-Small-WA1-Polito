import { useMemo } from "react";
import { Card, Col, Stack } from "react-bootstrap";
import { useNavigate, useRevalidator } from "react-router-dom";
import dayjs from "dayjs";
import pagesApi from "../api/pages";
import DeleteButton from "./DeleteButton";
import PropTypes from 'prop-types';

export const PubishedLabel = ({ date }) => {
  const publishedDate = dayjs(date);
  let dateComponent;
  if (!publishedDate.isValid()) dateComponent = <span className="text-muted">Draft</span>;
  else if (publishedDate.isAfter(dayjs()))
    dateComponent = <span className="text-muted"><i>{publishedDate.format("DD/MM/YYYY")}</i></span>;
  else dateComponent = <span className="text-muted">{publishedDate.format("DD/MM/YYYY")}</span>;

  return (
    <Stack>
      <div>{publishedDate.isValid() ? (publishedDate.isAfter(dayjs()) ? "Scheduled" : "Published") : " "}</div>
      {dateComponent}
    </Stack>
  );
}

PubishedLabel.propTypes = {
  date: PropTypes.string
};

const PageCard = ({ page, user, forcedFrontOffice }) => {
  const { revalidate } = useRevalidator();
  const isDeletable = useMemo(() => (user && (user.role === "admin" || user.id === page.author) && !forcedFrontOffice), [user, forcedFrontOffice, page.author])

  const navigate = useNavigate();

  const goToPage = () => {
    navigate(`/page/${page.id}`);
  };

  const deletePage = (e) => {
    e?.stopPropagation();
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
            width: 367px;
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
      <Card className="m-2 pageCard" onClick={goToPage} aria-label="Open Page">
        <Card.Body >
          <Card.Title>{page.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {" by "}
            {page.author_name ?? "Anonimo"}
          </Card.Subtitle>
        </Card.Body>
        <Card.Footer
          className="text-muted d-flex justify-content-around text-center align-items-center align-content-center gap-5"
          style={{ height: "min-content" }}
        >
          <Col>
            <div>Created</div>
            <span className="text-muted">{dayjs(page.created_at).format("DD/MM/YYYY")}</span>
          </Col>
          <Col>
            <PubishedLabel date={page.published_at} />
          </Col>

          {isDeletable ? (
            <DeleteButton onClick={deletePage} label={"Delete"} popoverText={"Click twice to delete this Page"} />
          ) : (
            <> </>
          )}
        </Card.Footer>
      </Card>
    </>
  );
};

PageCard.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.number.isRequired,
    author_name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    created_at: PropTypes.string.isRequired,
  }),
  user: PropTypes.shape({
    id: PropTypes.number,
    role: PropTypes.string,
  }),
  forcedFrontOffice: PropTypes.bool
};

export default PageCard;
