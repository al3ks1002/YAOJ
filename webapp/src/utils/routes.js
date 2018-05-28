import React from "react";

import { Redirect, Route, Router } from "react-router-dom";
import App from "../components/App.js";
import Home from "../components/Home.js";
import Callback from "../components/Callback.js";
import Profile from "../components/Profile.js";
import ContestList from "../components/ContestList.js";
import NewContest from "../components/NewContest.js";
import Auth from "../services/Auth.js";
import history from "./history.js";

const auth = new Auth();

const handleAuthentication = ({ location }) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
};

export const makeMainRoutes = () => {
  return (
    <Router history={history}>
      <div>
        <Route path="/" render={props => <App auth={auth} {...props} />} />
        <Route path="/home" render={props => <Home auth={auth} {...props} />} />
        <Route
          path="/public-contests"
          render={props => <ContestList isPublic={true} {...props} />}
        />
        <Route
          path="/new-contest"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <NewContest {...props} />
            )
          }
        />
        <Route
          path="/my-contests"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ContestList isPublic={false} {...props} />
            )
          }
        />
        <Route
          path="/profile"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <Profile auth={auth} {...props} />
            )
          }
        />
        <Route
          path="/callback"
          render={props => {
            handleAuthentication(props);
            return <Callback {...props} />;
          }}
        />
      </div>
    </Router>
  );
};
