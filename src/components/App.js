import TweetForm from "./TweetForm";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";
import ListGroup from "react-bootstrap/ListGroup";

const App = () => {
  return (
    <div style={{ textAlign: "center" }}>
      {window.location.pathname.length > 1 ? (
        <TweetForm />
      ) : (
        <Jumbotron>
          <h1>Tweet-Only Access</h1>
          <p>
            How it works:
            <ListGroup style={{width: '50%', margin: 'auto'}}>
              <ListGroup.Item>Account owner logs in to Twitter</ListGroup.Item>
              <ListGroup.Item>Owner gets a unique, secret URL they can share to tweeters they trust</ListGroup.Item>
              <ListGroup.Item>Designated tweeters use the secret URL to send tweets and retweets</ListGroup.Item>
              <ListGroup.Item>(the app is <a href="https://github.com/hpr/tweet-only-access">open source</a> and only makes API calls related to tweeting)</ListGroup.Item>
            </ListGroup>
          </p>
          <Button href="/auth/twitter">Login to Twitter</Button>
        </Jumbotron>
      )}
    </div>
  );
};

export default App;
