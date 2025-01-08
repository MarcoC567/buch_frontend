"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../api/auth/useAuth";

const Navbar = () => {
  const { writeAccess } = useAuth();
  const { isLoggedIn, logout } = useAuth();
  const [activeLink, setActiveLink] = useState("#");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (tabName: string) => {
    setActiveLink(tabName);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          href="/"
          passHref
          onClick={() => setActiveLink("#")}
        >
          <Image
            src="/book.svg"
            alt="Book Icon"
            width="30"
            height="30"
            className="d-inline-block align-text-top mx-4"
          />
          Bookstore
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="navbarSupportedContent"
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarSupportedContent"
        >
          <ul
            className="nav nav-pills me-auto mb-2 mb-lg-0"
            style={{ right: "px" }}
          >
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  activeLink === "Suchen" ? "active" : ""
                }`}
                aria-current="page"
                href="/search"
                onClick={() => handleLinkClick("Suchen")}
              >
                Suchen
              </Link>
            </li>

            <li className="nav-item">
              {writeAccess && (
                <Link
                  href="/add"
                  className={`nav-link ${
                    activeLink === "Hinzufügen" ? "active" : ""
                  }`}
                  onClick={() => handleLinkClick("Hinzufügen")}
                >
                  Hinzufügen
                </Link>
              )}
            </li>
          </ul>

          <Button
            className="ms-auto"
            onClick={isLoggedIn() ? handleLogout : undefined}
            href={isLoggedIn() ? undefined : "/login"}
          >
            {isLoggedIn() ? "Logout" : "Login"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
