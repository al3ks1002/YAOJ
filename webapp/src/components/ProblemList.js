import React, { Component } from "react";

import { Table } from "antd";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

const columns = [
  {
    title: "#",
    dataIndex: "Id",
    sorter: (a, b) => a.Id - b.Id
  },
  {
    title: "Name",
    dataIndex: "Name",
    render: (name, record) => <a href={"/problem/" + record.Id}>{name}</a>
  }
];

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
        <div>
          <Table
            bordered
            pagination={false}
            columns={columns}
            rowKey={record => record.Id}
            dataSource={this.state.problems}
            loading={this.state.loading}
          />
        </div>
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
