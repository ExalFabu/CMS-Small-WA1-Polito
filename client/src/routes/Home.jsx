import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
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
  oldest: { value: "oldest", label: "Date(ASC)", callback: (a, b) => dayjs(a.published_at).isBefore(dayjs(b.published_at)) ? -1 : 1 },
  newest: { value: "newest", label: "Date(DESC)", callback: (a, b) => dayjs(a.published_at).isAfter(dayjs(b.published_at)) ? -1 : 1 },
  title: { value: "title", label: "Title", callback: (a, b) => a.title.localeCompare(b.title) },
  author: { value: "author", label: "Author", callback: (a, b) => a.author_name.localeCompare(b.author_name) }
};



const FilterTopBar = ({ isBackOffice }) => {
  const [searchParam, setSearchParam] = useSearchParams();
  const [searchName, setSearchName] = React.useState(searchParam.get("name") || "");
  const [filterRadio, setFilterRadio] = React.useState(searchParam.get("filter") || "all");
  const [sortsRadio, setSortsRadio] = React.useState(searchParam.get("sort") || "oldest");




  useEffect(() => {
    setSearchParam((otherParams) => ({ ...(Object.fromEntries(otherParams.entries())), name: searchName, filter: filterRadio, sort: sortsRadio }));
  }, [filterRadio, searchName, sortsRadio, setSearchParam]); // To trigger the effect whenever the params change

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
            return <Form.Check
              key={sort.value}
              inline
              type="radio"
              name="sort"
              value={sort.value}
              label={sort.label}
              checked={sortsRadio === sort.value}
              onChange={(event) => setSortsRadio(event.target.value)}
            />
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

const applyFiltersNSorts = (pages, filter, sort, name, user_id) => {
  pages = pages.filter((page) => name == "" || page.title.toLowerCase().includes(name.toLowerCase()));
  const sorted = pages.sort(SORTS[sort].callback);
  return sorted.filter((page) => FILTERS[filter].callback(page, user_id));
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
    const sorts = searchParam.get("sort") || "oldest";
    const appliedFilters = applyFiltersNSorts(pages, filter, sorts, name, user?.id);
    console.log("Pages in Home changed", appliedFilters, name, filter)

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
          <Button variant="primary" onClick={() => navigator("/page/new")}>Crea una nuova Pagina</Button>
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
