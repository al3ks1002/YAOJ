import React, { Component } from "react";

import * as LocalStorageUtils from "../utils/localStorage.js";

class SubmissionRow extends Component {
  isMySubmission() {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === this.props.userId;
    } catch (error) {
      return false;
    }
  }

  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td> {this.props.userName} </td>
        {this.isMySubmission() ? (
          <td>
            <a href={"http://localhost:8081/" + this.props.fId}>Code</a>
          </td>
        ) : (
          <td>
            -
          </td>
        )}
        <td> {this.props.status} </td>
        <td> {new Date(this.props.timestamp).toString()} </td>
      </tr>
    );
  }
}

export default SubmissionRow;
