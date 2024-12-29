"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Alert, Spinner } from "react-bootstrap";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { writeAccess } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (writeAccess === undefined) {
      setCheckingAccess(true);
    } else {
      setAccessDenied(!writeAccess);
      setCheckingAccess(false);
    }
  }, [writeAccess]);

  if (checkingAccess) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Laden...</span>
        </Spinner>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <Alert variant="danger">
        Zugriff verweigert: Sie haben keine Berechtigung, diese Seite zu sehen.
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
