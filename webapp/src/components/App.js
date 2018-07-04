import React, { Component } from "react";

import { Menu, Icon } from "antd";

const SubMenu = Menu.SubMenu;

class App extends Component {
  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.renewToken = this.renewToken.bind(this);
  }

  goTo(route) {
    this.props.history.push(`/${route}`);
  }

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout(true);
  }

  renewToken() {
    this.props.auth.renewToken();
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div>
        <Menu mode="horizontal">
          <Menu.Item key="home">
            <a onClick={this.goTo.bind(this, "home")}>
              <Icon type="home" />Home
            </a>
          </Menu.Item>
          {isAuthenticated() && (
            <SubMenu
              title={
                <span>
                  <Icon type="code" />Contests
                </span>
              }
            >
              <Menu.Item key="public-contests">
                <a onClick={this.goTo.bind(this, "public-contests")}>
                  Public Contests
                </a>
              </Menu.Item>
              <Menu.Item key="my-contests">
                <a onClick={this.goTo.bind(this, "my-contests")}>My contests</a>
              </Menu.Item>
              <Menu.Item key="new-contest">
                <a onClick={this.goTo.bind(this, "new-contest")}>New Contest</a>
              </Menu.Item>
            </SubMenu>
          )}
          {!isAuthenticated() && (
            <Menu.Item key="login">
              <a onClick={this.login}>
                <Icon type="login" />Login
              </a>
            </Menu.Item>
          )}
          {isAuthenticated() && (
            <Menu.Item key="profile">
              <a onClick={this.goTo.bind(this, "profile")}>
                <Icon type="profile" />Profile
              </a>
            </Menu.Item>
          )}
          {isAuthenticated() && (
            <Menu.Item key="logout">
              <a onClick={this.logout}>
                <Icon type="logout" />Logout
              </a>
            </Menu.Item>
          )}
        </Menu>
        <br />
      </div>
    );
  }
}

export default App;
