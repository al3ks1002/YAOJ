import React, { Component } from "react";
import { Navbar, Button, DropdownButton, MenuItem } from "react-bootstrap";

import { Menu, Icon } from "antd";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

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
    this.props.auth.logout(true);
  }

  renewToken() {
    this.props.auth.renewToken();
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    //     return (
    //       <Menu mode="horizontal">
    //         <Menu.Item key="home">
    //           <a onClick={this.goTo.bind(this, "home")}>
    //             <Icon type="home" />Home
    //           </a>
    //         </Menu.Item>
    //         <SubMenu
    //           title={
    //             <span>
    //               <Icon type="setting" />Navigation Three - Submenu
    //             </span>
    //           }
    //         >
    //           <MenuItemGroup title="Item 1">
    //             <Menu.Item key="setting:1">Option 1</Menu.Item>
    //             <Menu.Item key="setting:2">Option 2</Menu.Item>
    //           </MenuItemGroup>
    //           <MenuItemGroup title="Item 2">
    //             <Menu.Item key="setting:3">Option 3</Menu.Item>
    //             <Menu.Item key="setting:4">Option 4</Menu.Item>
    //           </MenuItemGroup>
    //         </SubMenu>
    //         <Menu.Item key="alipay">
    //           <a
    //             href="https://ant.design"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             Navigation Four - Link
    //           </a>
    //         </Menu.Item>
    //       </Menu>
    //     );

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
            {isAuthenticated() && (
              <DropdownButton
                title="Contests"
                bsStyle="primary"
                className="btn-margin"
                id={`dropdown-basic-contests`}
              >
                <MenuItem onClick={this.goTo.bind(this, "public-contests")}>
                  Public contests
                </MenuItem>
                <MenuItem onClick={this.goTo.bind(this, "new-contest")}>
                  New contest
                </MenuItem>
                <MenuItem onClick={this.goTo.bind(this, "my-contests")}>
                  My contests
                </MenuItem>
              </DropdownButton>
            )}

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
