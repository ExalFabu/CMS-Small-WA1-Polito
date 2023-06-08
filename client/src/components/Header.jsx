import React from "react";
import { Navbar } from "react-bootstrap";
import { Link, Outlet, useNavigate, useRevalidator } from "react-router-dom";
import TitleSite from "./TitleSite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
    faArrowRightFromBracket,
    faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";

import { logout } from "../api/auth";

const Header = ({ user, logout: stateLogout }) => {
  const doLogout = () => {
    logout().then(() => stateLogout());
  };
  const {revalidate} = useRevalidator();
  const reload = () => {
    revalidate();
  };
  return (
    <>
      <Navbar
        bg="light"
        variant="light"
        sticky="top"
        className="mb-4 px-4 justify-content-between"
      >
        <Navbar.Brand className="d-flex align-content-center gap-1">
          <Link to="/">Home</Link>
          <FontAwesomeIcon cursor={"pointer"} className="m-2" icon={faArrowsRotate} onClick={reload} />
        </Navbar.Brand>


        <TitleSite user={user} />
        <Navbar.Brand className="me-0">
          {user ? <span className="me-2"> Ciao {user.name}! </span> : <></>}
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

export default Header;
