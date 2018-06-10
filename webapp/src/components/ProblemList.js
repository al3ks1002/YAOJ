import React, { Component } from "react";
import ProblemRow from "./ProblemRow.js";

import { Table } from "react-bootstrap";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class ProblemList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contestId: this.props.contestId,
      problems: [],
      loaded: false,
      error: null
    };
  }

  // Once this components mounts, we will make a call to the API to get the problem data
  componentDidMount() {
    AxiosUtils.getProblems(this.state.contestId)
      .then(result => {
        this.setState({
          problems: result.data,
          loaded: true
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      if (this.state.problems.length === 0) {
        return <div>There are no problems at the moment.</div>;
      }
      return (
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {this.state.problems.map((problem, i) => {
              return <ProblemRow key={i} id={problem.Id} name={problem.Name} />;
            })}
          </tbody>
        </Table>
      );
    }

    return (
      <div className="container">
        <div style={Styles.loadingStyle}>
          <img src={loading} alt="loading" />
        </div>
      </div>
    );
  }
}

export default ProblemList;
