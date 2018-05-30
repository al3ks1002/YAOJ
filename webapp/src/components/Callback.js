import React, { Component } from "react";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import history from "../utils/history";

class Callback extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  handleAuthentication() {
    if (/access_token|id_token|error/.test(this.props.location.hash)) {
      this.props.auth
        .handleAuthentication()
        .then(() => {
          history.replace("/home");
        })
        .catch(error => {
          this.setState({
            error: error
          });
          this.props.auth.logout(false);
          history.replace("/callback");
        });
    }
  }

  componentDidMount() {
    this.handleAuthentication();
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    return (
      <div style={Styles.loadingStyle}>
        <img src={loading} alt="loading" />
      </div>
    );
  }
}

export default Callback;
