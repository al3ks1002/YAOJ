import React, { Component } from "react";

import * as LocalStorageUtils from "../utils/localStorage.js";

class ResultRow extends Component {
  isMySubmission() {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === this.props.userId;
    } catch (error) {
      return false;
    }
  }

  isMyContest(contest) {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === this.props.contestOwnerId;
    } catch (error) {
      return false;
    }
  }

  render() {
    if (this.isMySubmission() || this.isMyContest()) {
      return (
        <tr>
          <td>{this.props.testName + ".in"}</td>
          <td>{this.props.verdict}</td>
          <td>{this.props.time} ms</td>
        </tr>
      );
    } else {
      return (
        <tr>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
      );
    }
  }
}

export default ResultRow;
