import React from "react";

import { Redirect, Route, Router } from "react-router-dom";
import App from "../components/App.js";
import Home from "../components/Home.js";
import Callback from "../components/Callback.js";
import Profile from "../components/Profile.js";
import ContestList from "../components/ContestList.js";
import ErrorBoundary from "../components/ErrorBoundary.js";
import CreateOrUpdateContest from "../components/CreateOrUpdateContest.js";
import NewProblem from "../components/NewProblem.js";
import UpdateProblem from "../components/UpdateProblem.js";
import Contest from "../components/Contest.js";
import Problem from "../components/Problem.js";
import Auth from "../services/Auth.js";
import history from "./history.js";

const auth = new Auth();

export const makeMainRoutes = () => {
  return (
    <Router history={history}>
      <div>
        <Route path="/" render={props => <App auth={auth} {...props} />} />
        <Route
          path="/home"
          render={props => (
            <ErrorBoundary>
              <Home auth={auth} {...props} />
            </ErrorBoundary>
          )}
        />
        <Route
          path="/public-contests"
          render={props => (
            <ErrorBoundary>
              <ContestList isPublic={true} {...props} />
            </ErrorBoundary>
          )}
        />
        <Route
          path="/new-contest"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <CreateOrUpdateContest isNew={true} {...props} />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/update-contest/:id"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <CreateOrUpdateContest isNew={false} {...props} />
              </ErrorBoundary>
            )
          }
        />

        <Route
          path="/my-contests"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <ContestList isPublic={false} {...props} />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/contest/:id"
          render={props => (
            <ErrorBoundary>
              <Contest {...props} />
            </ErrorBoundary>
          )}
        />
        <Route
          path="/problem/:id"
          render={props => (
            <ErrorBoundary>
              <Problem {...props} />
            </ErrorBoundary>
          )}
        />

        <Route
          path="/profile"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <Profile auth={auth} {...props} />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/callback"
          render={props => {
            return (
              <ErrorBoundary>
                <Callback auth={auth} {...props} />
              </ErrorBoundary>
            );
          }}
        />
        <Route
          path="/new-problem/:contestId"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <NewProblem {...props} />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/update-problem/:problemId"
          render={props =>
            !auth.isAuthenticated() ? (
              <Redirect to="/home" />
            ) : (
              <ErrorBoundary>
                <UpdateProblem {...props} />
              </ErrorBoundary>
            )
          }
        />
      </div>
    </Router>
  );
};
