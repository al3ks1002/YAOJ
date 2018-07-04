import React, { Component } from "react";
import { Card } from "antd";

import * as LocalStorageUtils from "../utils/localStorage.js";

class Profile extends Component {
  componentWillMount() {
    this.setState({
      profile: LocalStorageUtils.getProfile()
    });
  }
  render() {
    const { profile } = this.state;
    if (profile) {
      return (
        <div className="container">
          <Card title="Profile">
            <img src={profile.picture} alt="profile" />
            <br/>
            <font size="5">Username: {profile.name}</font>
            <br/>
            <font size="5">Nickname: {profile.nickname}</font>
            <br/>
          </Card>
        </div>
      );
    } else {
      return <div>Cannot get profile</div>;
    }
  }
}

export default Profile;
