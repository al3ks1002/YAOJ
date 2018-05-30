import React, { Component } from "react";

class Contest extends Component {
  constructor(props) {
    super(props);

    const id = parseInt(props.match.params.id, 10);
    if (id) {
      console.log(id);
    }
  }
  render() {
    return null;
  }
}

export default Contest;
