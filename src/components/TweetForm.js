import axios from "axios";
import { useState, useEffect } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

const TweetForm = () => {
  const [username, setUsername] = useState("Loading...");
  const [tweet, setTweet] = useState("");
  const [toast, setToast] = useState(false);
  const urlCode = window.location.pathname.slice(1);
  useEffect(() => {
    const getTweeter = async () => {
      const { data } = await axios.get(`/api/tweeter/${urlCode}`);
      setUsername(data.username);
    };
    getTweeter();
  }, [setUsername, urlCode]);
  return (
    <Jumbotron>
      <Toast
        onClose={() => setToast(false)}
        show={!!toast}
        delay={3000}
        autohide
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <Toast.Header>
          <strong className="mr-auto">{toast.tile}</strong>
          <small>{toast.id && <a href={`https://twitter.com/${username}/status/${toast.id}`}>{`https://twitter.com/${username}/status/${toast.id}`}</a>}</small>
        </Toast.Header>
        <Toast.Body>{toast.desc}</Toast.Body>
      </Toast>
      <h3>Tweeting on behalf of @{username}:</h3>
      <h4>
        (send this secret URL to anyone to allow them to tweet on @{username}'s
        behalf)
      </h4>
      <Form
        onSubmit={async (e) => {
          try {
            e.preventDefault();
            const {data} = await axios.post("/api/tweet", {
              urlCode,
              tweet,
            });
            setTweet("");
            setToast({ title: 'Tweet Sent', desc: 'Your Tweet was sent successfully!', id: data.id_str });
          } catch (err) {
            console.error(err);
            setToast({ title: 'Error', desc: err.message })
          }
        }}
        style={{ width: "50%", margin: "auto" }}
      >
        <Form.Group controlId="tweet">
          <Form.Label>Write a Tweet:</Form.Label>
          <Form.Control
            type="text"
            placeholder="What's on your mind?"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
          />
          <Form.Text className="text-muted">
            {tweet.length} characters
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
          Post Tweet
        </Button>
      </Form>
    </Jumbotron>
  );
};

export default TweetForm;
