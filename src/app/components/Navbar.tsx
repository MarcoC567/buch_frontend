'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "react-bootstrap";

const Navbar = () => {
  const [activeLink, setActiveLink] = useState("#");

  const handleLinkClick = (tabName: string) => setActiveLink(tabName);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/" passHref>
          <Image
            src="/book.svg"
            alt="Book Icon"
            width="30"
            height="30"
            className="d-inline-block align-text-top mx-4"
          />
          Bookstore
        </Link>
        <div className="d-flex w-100 align-items-center">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a  className={`nav-link ${activeLink === "Suchen" ? "active" : ""}`} 
              aria-current="page" href="search" onClick={() => handleLinkClick("Suchen")}>
                Suchen
              </a>
            </li>
            <li className="nav-item">
              <Link 
                href="/add" 
                className={`nav-link ${activeLink === "Hinzufügen" ? "active" : ""}`}
                onClick={() => handleLinkClick("Hinzufügen")}
              >
                Hinzufügen
              </Link>
            </li>
          </ul>
          <Button className="ms-auto mx-4" href="/login">Login</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;