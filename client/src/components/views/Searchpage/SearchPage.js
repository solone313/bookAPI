import React, { useEffect, useState } from "react";
import { Card, Col } from "antd";
import axios from "axios";
import queryString from "query-string";
const { Meta } = Card;

function SearchPage({ match, location }) {
  const [searchResult, setsearchResult] = useState([]);
  const [result, setresult] = useState("");

  const query = queryString.parse(location.search);

  const variables = {
    value: query.value
  };
  useEffect(() => {
    axios.post("/api/book/searchresult", variables).then(response => {
      if (response.data.success) {
        setsearchResult(response.data.searchresult);
        if (response.data.searchresult.length===0){
          setresult("검색결과가 없습니다.")
        }else{
          setresult(`${response.data.searchresult.length}건이 검색되었습니다.`)
        }
      } else {
        alert(" 저장에 실패했습니다 이유: " + response.data.err);
      }
    });
  }, []);
  const renderCards = searchResult.map((book, index) => {
    return (
      <Col
        lg={4}
        md={8}
        xs={12}
        style={{ textAlign: "center", maxHeight: "300px" }}
        key={book._id}
      >
        <a href={`/book/${book._id}`}>
          <div>
            <img
              style={{
                maxWidth: "100%",
                height: "200px"
              }}
              alt="thumbnail"
              src={`${book.filePath}`}
              crossOrigin="anonymous"
            />
            {/* src={`http://localhost:5000/${book.filePath}`}/> */}
          </div>
          <br />
          <Meta title={book.title} />
        </a>
        <span>
          {book.author}, {book.publisher}
        </span>
        {/* <br />
          <span>평점: {book.rating}</span> */}
      </Col>
    );
  });
  if(searchResult.length===0){
    return <div> 
              <div style={{margin:"1rem 0"}}>
                {result}
              </div> 
              <hr />
              <h4>찾으시는 통합검색이(가) 없습니까?</h4>
              <h3>핵심 단어를 띄어쓰기를 제거해주세요</h3>
              <h3>※ 미움 받을 용기 → 미움받을용기</h3>
              <h3>※ 고마운 마음 → 고마운마음</h3>
            </div>
  }
  else{

       return <div style={{textAlign:"center",margin:"1rem 0"}} >
                {result}
                <div>
                   {renderCards}
                </div>
            </div>
  }
}

export default SearchPage;