import React, { Component } from "react";
import { Navbar, Button, DropdownButton, MenuItem } from "react-bootstrap";

class App extends Component {
  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.renewToken = this.renewToken.bind(this);
  }

  goTo(route) {
    this.props.history.replace(`/${route}`);
  }

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout();
  }

  renewToken() {
    this.props.auth.renewToken();
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div>
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <a onClick={this.goTo.bind(this, "home")}>Mlc</a>
            </Navbar.Brand>
            <Button
              bsStyle="primary"
              className="btn-margin"
              onClick={this.goTo.bind(this, "home")}
            >
              Home
            </Button>
            <DropdownButton
              title="Contests"
              bsStyle="primary"
              className="btn-margin"
              id={`dropdown-basic-contests`}
            >
              <MenuItem onClick={this.goTo.bind(this, "public-contests")}>
                Public contests
              </MenuItem>
              <MenuItem onClick={this.goTo.bind(this, "my-contests")}>
                My contests
              </MenuItem>
            </DropdownButton>

            {!isAuthenticated() && (
              <Button
                bsStyle="primary"
                className="btn-margin"
                onClick={this.login}
              >
                Log In
              </Button>
            )}
            {isAuthenticated() && (
              <Button
                bsStyle="primary"
                className="btn-margin"
                onClick={this.goTo.bind(this, "profile")}
              >
                Profile
              </Button>
            )}
            {isAuthenticated() && (
              <Button
                bsStyle="primary"
                className="btn-margin"
                onClick={this.logout}
              >
                Log Out
              </Button>
            )}
          </Navbar.Header>
        </Navbar>
      </div>
    );
  }
}

export default App;
