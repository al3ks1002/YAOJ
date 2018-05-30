import React, { Component } from "react";

class ContestRow extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td> {this.props.name} </td>
        <td> {this.props.ownerId} </td>
        <td>
          <a href={"/contest/" + this.props.id}>Go to</a>
        </td>
      </tr>
    );
  }
}

export default ContestRow;
