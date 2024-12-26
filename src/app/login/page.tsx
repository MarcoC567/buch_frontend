"use client"
import { Alert, Badge, Button } from "react-bootstrap";
import { useAuth } from "../api/auth/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";


const Login = () => {
    const { login } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      const success = await login(user, password);
      console.log(success);
      if (success) {
        router.push("/");
        console.log("ok");
      } else {
        setErrorMessage("Ungültiger Username oder Passwort. Bitte bersuche es erneut.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Ein Fehler ist während des Loginversuchs aufgetreten.");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "50px",
      }}
    >
      <div className="card border-primary" style={{ width: "450px", height: "500px"}}>
        <div className="card-body">
          <h5 className="card-title text-center mb-5">Login</h5>
          <div className="mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <Badge
              className="mb-3"
              style={{ display: "inline-block", width: "auto"}}
            >
              Username
            </Badge>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="Username"
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="mb-5" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <Badge
              className="mb-3"
              style={{ display: "inline-block", width: "auto" }}
            >
              Password
            </Badge>
            <input
              type="password"
              className="form-control border-primary"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-center mt-4">
            <Button variant="primary" style={{ minWidth: "120px" }} onClick={handleLogin}>
              Login
            </Button>
            {errorMessage && (
                <Alert variant="danger" className="mt-3">{errorMessage}</Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
