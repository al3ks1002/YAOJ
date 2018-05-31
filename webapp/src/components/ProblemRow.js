import React, { Component } from "react";

class ProblemRow extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td> {this.props.name} </td>
        <td>
          <a href={"/problem/" + this.props.id}>Go to</a>
        </td>
      </tr>
    );
  }
}

export default ProblemRow;
