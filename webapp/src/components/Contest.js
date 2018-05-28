import React, { Component } from "react";

class Contest extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td> {this.props.name} </td>
        <td> {this.props.ownerId} </td>
      </tr>
    );
  }
}

export default Contest;
