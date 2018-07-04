import React, { Component } from "react";

import { Button, Table } from "antd";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class TestList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: this.props.problemId,
      inTests: [],
      okTests: [],
      loaded: 0,
      error: null,
      refresh: this.props.refresh,
      shouldUpdate: false
    };

    this.deleteTestCallback = this.deleteTestCallback.bind(this);
  }

  fetchTests() {
    AxiosUtils.getInTests(this.state.problemId)
      .then(result => {
        this.setState({
          inTests: result.data,
          loaded: this.state.loaded + 1
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });

    AxiosUtils.getOkTests(this.state.problemId)
      .then(result => {
        this.setState({
          okTests: result.data,
          loaded: this.state.loaded + 1
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  static getDerivedStateFromProps(props, state) {
    // Store prevId in state so we can compare when props change.
    // Clear out previously-loaded data (so we don't render stale stuff).
    if (props.refresh !== state.refresh) {
      return {
        shouldUpdate: true,
        refresh: props.refresh,
        loaded: 0
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    this.fetchTests();
  }

  componentDidUpdate() {
    if (this.state.shouldUpdate) {
      this.setState({ shouldUpdate: false });
      this.fetchTests();
    }
  }

  deleteTestCallback(fId) {
    AxiosUtils.deleteFile(fId)
      .then(result => {
        this.setState({
          shouldUpdate: true,
          loaded: 0
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  render() {
    const columns = [
      {
        title: "Name",
        dataIndex: "FileName",
        sorter: (a, b) => {
          let aName = a.FileName.toString();
          let bName = b.FileName.toString();
          return aName > bName;
        },
        defaultSortOrder: true,
        render: (name, record) => (
          <a href={"http://localhost:8081/" + record.FId}>{record.FileName}</a>
        )
      },
      {
        title: "Delete",
        render: (text, record) => (
          <Button
            type="danger"
            onClick={() => this.deleteTestCallback(record.FId)}
          >
            x
          </Button>
        )
      }
    ];

    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded === 2) {
      return (
        <div style={Styles.flex}>
          <Table
            bordered
            pagination={false}
            size="small"
            columns={columns}
            rowKey={record => record.FId}
            dataSource={this.state.inTests}
            loading={this.state.loading}
          />
          <Table
            bordered
            pagination={false}
            size="small"
            columns={columns}
            rowKey={record => record.FId}
            dataSource={this.state.okTests}
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

export default TestList;
