import React, { Component } from "react";

import { Button, Table } from "antd";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

import history from "../utils/history";

class SourceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: this.props.problemId,
      sources: [],
      loaded: false,
      error: null,
      refresh: this.props.refresh,
      shouldUpdate: false
    };

    this.deleteSourceCallback = this.deleteSourceCallback.bind(this);
    this.executeSourceCallback = this.executeSourceCallback.bind(this);
  }

  fetchSources() {
    AxiosUtils.getSources(this.state.problemId)
      .then(result => {
        this.setState({
          sources: result.data,
          loaded: true
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
        loaded: false
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    this.fetchSources();
  }

  componentDidUpdate() {
    if (this.state.shouldUpdate) {
      this.setState({ shouldUpdate: false });
      this.fetchSources();
    }
  }

  deleteSourceCallback(fId) {
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

  executeSourceCallback(fId) {
    history.push("/submissions/" + this.state.problemId);
    AxiosUtils.executeSource(fId)
      .then(result => {})
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
            onClick={() => this.deleteSourceCallback(record.FId)}
          >
            x
          </Button>
        )
      },
      {
        title: "Execute",
        render: (text, record) => (
          <Button
            type="primary"
            onClick={() => this.executeSourceCallback(record.FId)}
          >
            Run
          </Button>
        )
      }
    ];

    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <div style={Styles.flex}>
          <Table
            bordered
            pagination={false}
            size="small"
            columns={columns}
            rowKey={record => record.FId}
            dataSource={this.state.sources}
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

export default SourceList;
