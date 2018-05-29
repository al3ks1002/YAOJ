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
      error: ""
    };
  }

  // Once this components mounts, we will make a call to the API to get the product data
  componentDidMount() {
    try {
      AxiosUtils.getContests(this.state.isPublic)
        .then(result => {
          this.setState({
            contests: result.data,
            loaded: true
          });
        })
        .catch(error => {
          this.setState({
            loaded: true,
            error: error.toString()
          });
          console.log(error.toString());
        });
    } catch (error) {
      this.setState({
        loaded: true,
        error: error.toString()
      });
      console.log(error.toString());
    }
  }

  render() {
    if (this.state.error) {
      return <div>{this.state.error}</div>;
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
              <th>Owner Id</th>
            </tr>
          </thead>
          <tbody>
            {this.state.contests.map(function(contest, i) {
              return (
                <ContestRow
                  key={i}
                  id={contest.Id}
                  name={contest.Name}
                  ownerId={contest.OwnerId}
                />
              );
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
