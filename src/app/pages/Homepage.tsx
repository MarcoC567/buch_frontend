import Image from "next/image";

export const Homepage = () => {
  return (
    <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        alignItems: "flex-start", 
        marginTop: "150px", 
      }}>
      <div className="card" style={{ width: "400px", height: "400px" }}>
        <Image
          src="./next.svg"
          className="card-img-top my-5"
          alt="Card Image"
          width={200}
          height={100}
        ></Image>
        <div className="card-body">
          <h5 className="card-title">Buchname</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the cards content.
          </p>
          <a href="#" className="btn btn-primary my-3">
            Details
          </a>
        </div>
      </div>
      <div className="card" style={{ width: "400px", height: "400px" }}>
        <Image
          src="./globe.svg"
          className="card-img-top my-5"
          alt="Card Image"
          width={200}
          height={100}
        ></Image>
        <div className="card-body">
          <h5 className="card-title">Buchname</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the cards content.
          </p>
          <a href="#" className="btn btn-primary my-3">
            Details
          </a>
        </div>
      </div>
      <div className="card" style={{ width: "400px", height: "400px" }}>
        <Image
          src="./window.svg"
          className="card-img-top my-5"
          alt="Card Image"
          width={200}
          height={100}
        ></Image>
        <div className="card-body">
          <h5 className="card-title">Buchname</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the cards content.
          </p>
          <a href="#" className="btn btn-primary my-3">
            Details
          </a>
        </div>
      </div>
    </div>
  );
};
