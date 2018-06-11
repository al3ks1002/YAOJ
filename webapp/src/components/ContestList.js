import React, { Component } from "react";
import ContestRow from "./ContestRow.js";

import { Table } from "react-bootstrap";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class ContestList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPublic: this.props.isPublic,
      contests: [],
      loaded: false,
      error: null
    };
  }

  // Once this components mounts, we will make a call to the API to get the contest data
  componentDidMount() {
    AxiosUtils.getContests(this.state.isPublic)
      .then(result => {
        const contests = result.data;
        this.setState({
          contests: contests,
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
      if (this.state.contests.length === 0) {
        return <div>There are no contests at the moment.</div>;
      }
      return (
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {this.state.contests.map(function(contest, i) {
              return <ContestRow key={i} id={contest.Id} name={contest.Name} userName={contest.UserName} />;
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

export default ContestList;
