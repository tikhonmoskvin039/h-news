import React from "react";
import { Routes, Route } from "react-router-dom";
import NewsDetails from "../components/NewsDetails/NewsDetails";
import NewsList from "../components/NewsList/NewsList";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<NewsList />} />
      <Route path="/news/:id" element={<NewsDetails />} />
    </Routes>
  );
};

export default AppRouter;
