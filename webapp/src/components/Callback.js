import React, { Component } from "react";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";

class Callback extends Component {
  render() {
    return (
      <div style={Styles.loadingStyle}>
        <img src={loading} alt="loading" />
      </div>
    );
  }
}

export default Callback;
