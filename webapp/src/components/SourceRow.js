import React, { Component } from "react";
import { Button } from "react-bootstrap";

class SourceRow extends Component {
  render() {
    return (
      <tr>
        <td>
          <a href={"http://localhost:8081/" + this.props.fId}>
            {this.props.name}
          </a>
        </td>
        <td>
          <Button onClick={() => this.props.deleteSourceCallback(this.props.fId)}>
            x
          </Button>
        </td>
      </tr>
    );
  }
}

export default SourceRow;
