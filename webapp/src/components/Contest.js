import React, { Component } from "react";

class Contest extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td> {this.props.name} </td>
      </tr>
    );
  }
}

export default Contest;
