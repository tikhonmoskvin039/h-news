import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import Loader from "../Loader/Loader";

type CommentItem = {
  id: number;
  text: string;
  by: string;
  time: number;
  kids?: number[];
};

type NewsItem = {
  id: number;
  title: string;
  by: string;
  time: number;
  url?: string;
  descendants: number;
  kids?: number[];
};

const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [commentList, setCommentList] = useState<CommentItem[]>([]);
  const [loadedComments, setLoadedComments] = useState<number[]>([]);
  const [hiddenComments, setHiddenComments] = useState<number[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((response) => response.json())
      .then((data: NewsItem) => {
        setNewsItem(data);
        if (data.kids) {
          fetchComments(data.kids);
        }
      });
  }, [id]);

  const fetchComments = (commentIds: number[]) => {
    const promises = commentIds
      .filter((id) => !loadedComments.includes(id))
      .map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then((response) => response.json())
          .then((data: CommentItem) => data)
      );

    Promise.all(promises).then((comments) => {
      const updatedCommentList = comments.map((commentItem) => {
        if (!commentItem) {
          return commentItem;
        }

        return {
          ...commentItem,
          kids: commentItem.kids
            ? (commentItem.kids.filter((kid) => kid !== undefined) as number[])
            : [],
        };
      });
      setCommentList([...commentList, ...updatedCommentList]);
      setLoadedComments([...loadedComments, ...commentIds]);
    });
  };

  const refreshCommentList = () => {
    if (newsItem?.kids) {
      const unloadedComments = newsItem.kids.filter(
        (kidId) => !loadedComments.includes(kidId)
      );
      if (unloadedComments.length > 0) {
        fetchComments(unloadedComments);
      }
    }
  };

  if (!newsItem) {
    return <Loader />;
  }

  return (
    <div>
      <Card
        style={{ backgroundColor: "gold", fontSize: 22, margin: "3% 10% 0" }}
      >
        <a href={newsItem.url} target="_blank" rel="noreferrer">
          {newsItem.title}
        </a>
        <p>
          by <b>{newsItem.by}</b> on{" "}
          <b>{new Date(newsItem.time * 1000).toLocaleDateString()} </b>
          with <b>{newsItem.descendants}</b> comments
        </p>
      </Card>
      <Button
        type="primary"
        style={{ margin: "1%" }}
        onClick={refreshCommentList}
      >
        Refresh
      </Button>
      <>
        {commentList.map((commentItem) => (
          <React.Fragment key={commentItem.id}>
            <Card
              hoverable
              onClick={() =>
                commentItem?.kids && fetchComments(commentItem.kids)
              }
              style={{ width: "80%", margin: "1rem auto" }}
            >
              <div>
                {decodeURIComponent(commentItem.text)}
                <p>
                  by <b>{commentItem.by}</b> on{" "}
                  <b>
                    {new Date(commentItem.time * 1000).toLocaleDateString()}
                  </b>
                </p>
              </div>
              {commentItem?.kids && commentItem?.kids?.length > 1 ? (
                <button
                  style={{
                    color: hiddenComments?.includes(commentItem.id)
                      ? "black"
                      : "yellow",
                    backgroundColor: hiddenComments?.includes(commentItem.id)
                      ? "orange"
                      : "black",
                    border: "none",
                    width: "96px",
                    height: "32px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setHiddenComments((prev) =>
                      prev.includes(commentItem.id)
                        ? prev.filter((id) => id !== commentItem.id)
                        : [...prev, commentItem.id]
                    )
                  }
                >
                  {hiddenComments.includes(commentItem.id)
                    ? "Hide"
                    : "Show more"}
                </button>
              ) : null}
            </Card>

            {commentItem.kids && hiddenComments.includes(commentItem.id) && (
              <>
                {commentItem.kids &&
                  commentItem.kids.map((kidId) => (
                    <Card
                      hoverable
                      key={kidId}
                      style={{
                        width: "80%",
                        margin: "1rem auto",
                        backgroundColor: "lightgray",
                      }}
                    >
                      {loadedComments.includes(kidId) ? (
                        <>
                          {
                            commentList.find((comment) => comment.id === kidId)
                              ?.text
                          }
                          <p>
                            by{" "}
                            <b>
                              {" "}
                              {
                                commentList.find(
                                  (comment) => comment.id === kidId
                                )?.by
                              }
                            </b>{" "}
                            on{" "}
                            <b>
                              {" "}
                              {new Date(
                                commentList.find(
                                  (comment) => comment.id === kidId
                                )?.time! * 1000
                              ).toLocaleDateString()}
                            </b>
                          </p>
                        </>
                      ) : null}
                    </Card>
                  ))}
              </>
            )}
          </React.Fragment>
        ))}
      </>
      <Button style={{ margin: "2% 0" }} onClick={() => navigate("/")}>
        Back to News List
      </Button>
    </div>
  );
};

export default NewsDetails;
