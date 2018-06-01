import React, { Component } from "react";

class ProblemRow extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id} </td>
        <td>
          <a href={"/problem/" + this.props.id}>{this.props.name}</a>
        </td>
      </tr>
    );
  }
}

export default ProblemRow;
