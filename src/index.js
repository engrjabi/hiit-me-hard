import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

/**
 * Only render root React app once spotty player is loaded
 */
const readyPlayedCheckerId = setInterval(() => {
  if (!window.SpotifyPlayerInstanceMaker) {
    return;
  }

  clearInterval(readyPlayedCheckerId);
  ReactDOM.render(<App />, document.getElementById("root"));
}, 1000);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
