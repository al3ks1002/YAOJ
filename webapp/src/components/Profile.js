import React, { Component } from "react";
import { Panel, ControlLabel, Glyphicon } from "react-bootstrap";

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
          <div className="profile-area">
            <h1>{profile.name}</h1>
            <Panel header="Profile">
              <img src={profile.picture} alt="profile" />
              <div>
                <ControlLabel>
                  <Glyphicon glyph="user" /> Nickname
                </ControlLabel>
                <h3>{profile.nickname}</h3>
              </div>
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </Panel>
          </div>
        </div>
      );
    } else {
      return <div>Cannot get profile</div>;
    }
  }
}

export default Profile;
