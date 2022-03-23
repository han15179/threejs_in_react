import React from "react";
import ReactDOM from "react-dom";
import BasicLayout from "./BasicLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Showsnow from "./js/showsnow";
import ShowTransform from "./js/showTransfrom";

ReactDOM.render(
  <BrowserRouter>
    <BasicLayout>
      <Routes>
        <Route path="/" element={<Showsnow />}></Route>
        <Route path="snow" element={<Showsnow />}></Route>
        <Route path="transform" element={<ShowTransform />}></Route>
      </Routes>
    </BasicLayout>
  </BrowserRouter>,
  document.getElementById("root")
);
