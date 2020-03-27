import React, { useEffect, useState } from "react";
import Axios from "axios";

function SideBook() {
  const [SideBook, setSideBook] = useState([]);
  useEffect(() => {
    Axios.get("/api/book/getsidebooks").then(response => {
      if (response.data.success) {
        setSideBook(response.data.books);
      } else {
        alert("책 가져오기를 실패 했습니다.");
      }
    });
  }, []);

  const renderSideBook = SideBook.map((book, index) => {
    return (
      <div
        key={book._id}
        style={{ display:"inline-block", float:"left" , marginBottom: "1rem", padding: "0 2rem" }}
      >
        <div style={{ float:"left" }}>
          <a href={`/book/${book._id}`}>
            <img
              style={{ width: "110px", height: "180px" }}
              src={`${book.filePath}`}
              alt="thumbnail"
            />
          </a>
        </div>
      </div>
    );
  });

  return (
    <React.Fragment>
      <div className="Side_list" style={{ marginTop: "2rem", marginLeft:"1rem" }}>{renderSideBook}</div>
    </React.Fragment>
  );
}

export default SideBook;