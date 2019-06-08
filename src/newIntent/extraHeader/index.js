
import React from 'react';
import { Icon, Tooltip, Input } from "antd";

const Search = Input.Search;

export const genExtra = (text) => (
  <Tooltip title={text} text>
    <Icon
      type="question-circle"
      theme="filled"
      onClick={event => {
        event.stopPropagation();
      }}
    />
  </Tooltip>
);

export const genExtraTraining = (text) => (
  <div
    className="newIntent-training-header"
    onClick={event => {
      event.stopPropagation();
    }}>
    <Tooltip title={text} text>
      <Icon
        type="question-circle"
        theme="filled"
      />
    </Tooltip>
    <Search
      className="newIntent-training-inputSearch"
      placeholder="Search training phases"
    />
  </div>
);