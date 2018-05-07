import React, { Component } from "react";

class Home extends Component {
  getExpiryDate() {
    const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return JSON.stringify(new Date(expiresAt));
  }

  render() {
    const { isAuthenticated, login } = this.props.auth;
    return (
      <div className="container">
        {isAuthenticated() && (
          <div>
            <h4>You are logged in!</h4>
          </div>
        )}
        {!isAuthenticated() && (
          <h4>
            You are not logged in! Please{" "}
            <a style={{ cursor: "pointer" }} onClick={login.bind(this)}>
              Log In
            </a>{" "}
            to continue.
          </h4>
        )}
      </div>
    );
  }
}

export default Home;
