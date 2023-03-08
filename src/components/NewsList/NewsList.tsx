import React, { useEffect, useState } from "react";
import { Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

type NewsItem = {
  id: number;
  title: string;
  score: number;
  by: string;
  time: number;
  url: string;
};

const NewsList: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    fetch("https://hacker-news.firebaseio.com/v0/newstories.json")
      .then((response) => response.json())
      .then((data) => {
        const promises = data.slice(0, 100).map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then((response) => response.json())
            .then((data: NewsItem) => data)
        );

        Promise.all(promises).then((news) => {
          setNewsList(news.sort((a, b) => b.time - a.time));
          setLoading(false);
        });
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Typography.Title>
            Welcome to <b>Hacker Portal</b>{" "}
          </Typography.Title>
          <Button onClick={fetchData} type="primary">
            Refresh
          </Button>
          {newsList.map((newsItem) => (
            <Card
              hoverable
              onClick={() => navigate(`/news/${newsItem.id}`)}
              style={{ width: "80%", margin: "10px 0 10px 0" }}
              key={newsItem.id}
            >
              <a href={newsItem.url} target="_blank" rel="noreferrer">
                {newsItem.title}
              </a>{" "}
              <b>({newsItem.score} points)</b>
              by <b>{newsItem.by}</b> on{" "}
              <b> {new Date(newsItem.time * 1000).toLocaleDateString()}</b>
            </Card>
          ))}
        </>
      )}
    </>
  );
};

export default NewsList;

// http://localhost:3000/news/35066281
