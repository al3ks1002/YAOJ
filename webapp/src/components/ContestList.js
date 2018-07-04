import React, { Component } from "react";

import { Card, Table } from "antd";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

const columns = [
  {
    title: "#",
    dataIndex: "Id",
    sorter: (a, b) => a.Id - b.Id,
  },
  {
    title: "Name",
    dataIndex: "Name",
    render: (name, record) => <a href={"/contest/" + record.Id}>{name}</a>
  },
  {
    title: "User",
    dataIndex: "UserName"
  },
  {
    title: "Start time",
    dataIndex: "StartTime",
    render: startTime => {
      return new Date(startTime).toString();
    },
    sorter: (a, b) => new Date(a.StartTime) - new Date(b.StartTime)
  },
  {
    title: "End time",
    dataIndex: "EndTime",
    render: endTime => {
      return new Date(endTime).toString();
    },
    sorter: (a, b) => new Date(a.EndTime) - new Date(b.EndTime)
  }
];

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
        return <Card>There are no contests at the moment.</Card>;
      }
      return (
        <div className="container">
          <Table
            bordered
            pagination={false}
            columns={columns}
            rowKey={record => record.Id}
            dataSource={this.state.contests}
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

export default ContestList;
