import React, { useMemo } from "react";
import { Button, ButtonGroup, Navbar } from "react-bootstrap";
import { Link, Outlet, useNavigate, useRevalidator } from "react-router-dom";
import TitleSite from "./TitleSite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faArrowsRotate,
  faArrowLeft,
  faHouseChimney,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

import { logout } from "../../api/auth";

const Header = ({ user, logout: stateLogout, forcedFrontOffice, setFFO }) => {
  const doLogout = () => {
    logout().then(() => stateLogout());
  };
  const { revalidate } = useRevalidator();
  const navigator = useNavigate();
  const goHome = () => navigator("/");
  const goBack = () => navigator(-1);
  const reload = () => revalidate();

  const enabledBackOffice = useMemo(() => (user && (user.role === "admin" || user.role === "editor")), [user]);


  return (
    <>
      <Navbar
        bg="light"
        variant="light"
        sticky="top"
        className="mb-4 px-4 justify-content-between"
      >
        <Navbar.Brand className="d-flex align-content-center gap-1">
          <FontAwesomeIcon cursor={"pointer"} className="m-2" icon={faArrowLeft} onClick={goBack} />
          <FontAwesomeIcon cursor={"pointer"} className="m-2" icon={faHouseChimney} onClick={goHome} />
          <FontAwesomeIcon cursor={"pointer"} className="m-2" icon={faArrowsRotate} onClick={reload} />
        </Navbar.Brand>
        {enabledBackOffice && <ButtonGroup>
          <Button
            size="sm"
            variant="outline-primary"
            active={forcedFrontOffice}
            onClick={() => setFFO(true)}
          >
            Front Office
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
            active={!forcedFrontOffice}
            onClick={() => setFFO(false)}
          >
            Back Office
          </Button>
          </ButtonGroup>
          }


        <TitleSite user={user} forcedFrontOffice={forcedFrontOffice} />
        <Navbar.Brand className="me-0">
          {user ? <span className="me-2"> Hi {user.name}! </span> : <></>}
          {user ? (
            <Link to="/" onClick={doLogout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </Link>
          ) : (
            <Link to="/login">
              <FontAwesomeIcon icon={faArrowRightToBracket} />
            </Link>
          )}
        </Navbar.Brand>
      </Navbar>
      <Outlet />
    </>
  );
};

Header.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
  }),
  logout: PropTypes.func.isRequired,
  forcedFrontOffice: PropTypes.bool,
  setFFO: PropTypes.func.isRequired
};

export default React.memo(Header);
