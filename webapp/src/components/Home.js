import React, { Component } from "react";
import { Alert, Card, Icon } from "antd";

import * as LocalStorageUtils from "../utils/localStorage.js";

class Home extends Component {
  getExpiryDate() {
    const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return JSON.stringify(new Date(expiresAt));
  }

  render() {
    const { isAuthenticated, login } = this.props.auth;
    return (
      <div className="container">
        <Card
          title={
            <font size="4.5">
              <Icon type="code-o" /> PlatformName - a fast competitive
              programming platform
            </font>
          }
        >
          <p>
            On this website you are able to create contests, prepare problems
            and submit solutions in the easiest and quickest way possible.
          </p>
          <p>
            The platform is designed for problem setters that are trying to
            quickly organize a contest, software companies that are trying to
            test their candidates and computer science teachers that want to
            test their students automatically.
          </p>
        </Card>
        <br />
        {isAuthenticated() && (
          <Alert
            message={
              <font size="3.5">
                You are logged in! Welcome back,{" "}
                <strong>{LocalStorageUtils.getUsername()}</strong>!
              </font>
            }
            type="success"
          />
        )}
        {!isAuthenticated() && (
          <Alert
            message={
              <font size="3.5">
                You are not logged in! Please{" "}
                <a onClick={login.bind(this)}>Login</a> to continue.
              </font>
            }
            type="info"
          />
        )}
      </div>
    );
  }
}

export default Home;
