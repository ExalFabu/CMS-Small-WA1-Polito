import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo } from "react";
import { Button, Col, Container, FloatingLabel, Form, Row } from "react-bootstrap";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import PageCard from "../components/PageCard";
import PropTypes from 'prop-types';
import { isFrontOfficeViewWrapper } from '../components/header/Header'

const pageIsPublished = (page) => dayjs(page.published_at).isBefore(dayjs());

const FILTERS = {
  all: { value: "all", label: "All", callback: () => true },
  published: { value: "published", label: "Published", callback: pageIsPublished },
  drafts: { value: "drafts", label: "Drafts", callback: (page) => page.published_at === null },
  scheduled: { value: "scheduled", label: "Scheduled", callback: (page) => !pageIsPublished(page) && dayjs(page.published_at).isAfter(dayjs()) },
  mine: { value: "mine", label: "Mine", callback: (page, user_id) => page.author === user_id }
};

const SORTS = {
  oldest: { value: "creation", label: "Creation", callback: (a, b) => dayjs(a.created_at).startOf("day").isBefore(dayjs(b.created_at).startOf("day")) ? -1 : 1 },
  newest: { value: "publish", label: "Publish", callback: (a, b) => dayjs(a.published_at.startOf("day")).isAfter(dayjs(b.published_at).startOf("day")) ? -1 : 1 },
  title: { value: "title", label: "Title", callback: (a, b) => a.title.localeCompare(b.title) },
  author: { value: "author", label: "Author", callback: (a, b) => a.author_name.localeCompare(b.author_name) }
};

const SORT_DIRECTION = {
  desc: { value: "desc", label: "DESC", callback: (pages) => Array.from(pages).reverse() },
  asc: { value: "asc", label: "ASC", callback: (pages) => pages }
}


const ThreeWayCheckbox = ({ id, label, onChange, selected }) => {
  const states = ["⇓", "⇧"];
  const [checkState, setCheckState] = React.useState(0);

  const handleChange = useCallback(() => {
    const newState = (checkState + 1) % 2;
    if (newState === 0) {
      onChange(id, "desc");
    } else {
      onChange(id, "asc");
    }

    setCheckState(newState);
  }, [checkState, id, onChange]);

  return <Button
    variant="none"
    id={id}
    name={id}
    value={id}
    onClick={handleChange}
    size="sm"
    className={selected ? "text-primary" : ""}
  >
    {selected ? `${states[checkState]}${label}` : label}
  </Button>

}

ThreeWayCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired
};


const FilterTopBar = ({ isBackOffice }) => {
  const [searchParam, setSearchParam] = useSearchParams();
  const [searchName, setSearchName] = React.useState(searchParam.get("name") || "");
  const [filterRadio, setFilterRadio] = React.useState(searchParam.get("filter") || "all");
  const [sortsRadio, setSortsRadio] = React.useState(searchParam.get("sort") || "oldest");
  const [sortDirection, setSortDirection] = React.useState(searchParam.get("sortDirection") || "desc");



  useEffect(() => {
    setSearchParam((otherParams) => ({
      ...(Object.fromEntries(otherParams.entries())),
      name: searchName,
      filter: filterRadio,
      sort: sortsRadio,
      sortDirection: sortDirection
    }));
  }, [filterRadio, searchName, sortsRadio, sortDirection, setSearchParam]); // To trigger the effect whenever the params change

  const handleSubmit = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
  }

  return <Form onSubmit={handleSubmit} className="my-2" >
    <Row className="mb-1">
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Search by Title"
          size="sm"
        >
          <Form.Control
            type="text"
            size="sm"
            value={searchName}
            placeholder="Search by Title"
            onChange={(event) => setSearchName(event.target.value)}
          />
        </FloatingLabel>
      </Col>
    </Row>
    <Row className="justify-content-around">
      <Col className="d-flex justify-content-start flex-wrap text-center">
        <Form.Label className="w-100 mb-0">Sort by</Form.Label>
        <div className="w-100">
          {Object.entries(SORTS).map(([_, sort]) => { // eslint-disable-line no-unused-vars
            return <ThreeWayCheckbox key={sort.value} id={sort.value}
              label={sort.label} selected={sortsRadio === sort.value} onChange={(sortClicked, sortDirection) => {
                setSortsRadio(sortClicked);
                setSortDirection(sortDirection);
              }} />
          })
          }

        </div>
      </Col>
      {isBackOffice && (<Col className="d-flex justify-content-end flex-wrap text-center">

        <Form.Label className="w-100">Filter by</Form.Label>
        <div className="w-100">

          {Object.entries(FILTERS).map(([_, filter]) => { // eslint-disable-line no-unused-vars
            return <Form.Check
              key={filter.value}
              inline
              id={`filter-radio-${filter.value}`}
              type="radio"
              name="filter"
              value={filter.value}
              label={filter.label}
              checked={filterRadio === filter.value}
              onChange={(event) => setFilterRadio(event.target.value)}
            />
          }
          )}

        </div>
      </Col>
      )
      }
    </Row>

  </Form>
};

FilterTopBar.propTypes = {
  isBackOffice: PropTypes.bool
};

const applyFiltersNSorts = (pages, filter, sort, sortDirection, name, user_id) => {
  pages = pages.filter((page) => name == "" || page.title.toLowerCase().includes(name.toLowerCase()));
  if (SORTS[sort])
    pages = pages.sort(SORTS[sort].callback);
  if (SORT_DIRECTION[sortDirection])
    pages = SORT_DIRECTION[sortDirection].callback(pages);
  return pages.filter((page) => FILTERS[filter].callback(page, user_id));
}


const Home = ({ user }) => {
  const pages = useLoaderData();
  const [filteredPages, setFilteredPages] = React.useState(pages);
  const [searchParam] = useSearchParams();

  const forcedFrontOffice = useMemo(() => {
    return isFrontOfficeViewWrapper(searchParam, user);
  }, [searchParam, user]);


  const canCreatePage = useMemo(() => (user && (user.role === "admin" || user.role === "editor") && !forcedFrontOffice), [user, forcedFrontOffice])

  useEffect(() => {
    const name = searchParam.get("name") || "";
    const filter = searchParam.get("filter") || "all";
    const sorts = searchParam.get("sort") || "publish";
    const sortDirection = searchParam.get("sortDirection") || "desc";
    const appliedFilters = applyFiltersNSorts(pages, filter, sorts, sortDirection, name, user?.id);

    if (forcedFrontOffice) {
      setFilteredPages(appliedFilters.filter(pageIsPublished));
    } else {
      setFilteredPages(appliedFilters);
    }
  }, [forcedFrontOffice, pages, searchParam, user]);

  const navigator = useNavigate();

  return (
    <div className="w-75 mx-auto">
      <FilterTopBar isBackOffice={canCreatePage} /> {/*Same criteria */}
      <Container className="d-flex flex-wrap align-items-center justify-content-evenly ">
        {filteredPages.map((page) => {
          return <PageCard key={page.id} page={page} user={user} forcedFrontOffice={forcedFrontOffice} />;
        })}
      </Container>
      {canCreatePage ? (
        <Container className="my-5 d-flex justify-content-center">
          <Button variant="primary" onClick={() => navigator("/page/new")}>Create a new Page</Button>
        </Container>
      ) : (
        <></>
      )}
    </div>
  );
};

Home.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    role: PropTypes.string,
  })
};

export default Home;
