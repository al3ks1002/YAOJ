import React, { Component } from "react";

class ContestRow extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td>
          <a href={"/contest/" + this.props.id}>{this.props.name}</a>
        </td>
      </tr>
    );
  }
}

export default ContestRow;
