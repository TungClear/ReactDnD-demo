
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Tabs, Icon, Dropdown, Menu, Switch, Tooltip, Alert } from 'antd';
import DragSortingCard from '../dragSortingCard';

import {
  updateResponses,
  updateActiveKey,
  updateEndConversation,
  updateDefaultResponsePlatform,
} from '../../../actions/intentDetailAction';

const TabPane = Tabs.TabPane;
const text = `Enable to close an interaction when this intent is finished. Some integrations 
							(e.g. Actions on Google or Dialogflow phone gateway) 
							use this information to close interaction with an end user.`;

class Responses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'Default',
      panes: [],
      listPlatform: this.initListPlatform,
      listResponse: this.initListResponse,
      listResponseDefault: this.initListResponseDefault,
      keyItemResponse: 1,
    };
  }

  componentDidMount() {
  }

  initListPlatform = [
    "Kik",
    "Google Assistant",
    "Telephony",
    "Slack",
    "Telegram",
    "Viber",
    "Skype",
    "Facebook Messenger",
  ]

  initListResponseDefault = [
    {
      type: 0,
      name: 'Text response',
    },
    {
      type: 1,
      name: 'Custom payload',
    }
  ]

  initListResponse = [
    {
      type: 0,
      name: 'Text response',
    },
    {
      type: 1,
      name: 'Custom payload',
    },
    {
      type: 2,
      name: 'Image',
    },
    {
      type: 3,
      name: 'Card',
    },
    {
      type: 4,
      name: 'Quick replies',
    },
  ]

  menuPlatform = () => {
    const { listPlatform } = this.state;
    return (
      <Menu className="newIntent-platform-dropdown-menu">
        {listPlatform.map((item, index) =>
          (
            <Menu.Item key={index} onClick={() => this.add(item)}>
              {item}
            </Menu.Item>
          )
        )}
      </Menu>
    );
  }

  menuResponse = (platform) => {
    const { listResponseDefault } = this.state;
    return (
      <Menu className="newIntent-response-dropdown-menu">
        {listResponseDefault.map((item, index) =>
          (
            <Menu.Item key={index} onClick={() => this.addResponse(platform, item)}>
              {item.name}
            </Menu.Item>
          )
        )}
      </Menu>
    );
  }

  onChangeEndConversation = (checked) => {
    const { dispatchUpdateEndConversation } = this.props;
    const end = checked === true ? 2 : 1;
    dispatchUpdateEndConversation(end);
  }

  onChangeDefaultResponsePlatform = (checked, platform) => {
    const { intentDetailReducer, dispatchUpdateResponses } = this.props;
    let { responses } = intentDetailReducer;

    responses = responses.map(item => {
      if (item.platform === platform) {
        item.default_response_platform = checked === true ? 2 : 1;
        return item;
      }
      return item;
    });

    dispatchUpdateResponses(responses);
  }

  onChange = targetKey => {
    const { dispatchUpdateActiveKey } = this.props;
    dispatchUpdateActiveKey(targetKey);
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = (name) => {
    const { dispatchUpdateResponses, intentDetailReducer, dispatchUpdateActiveKey } = this.props;
    let { responses } = intentDetailReducer;
    let { listPlatform } = this.state;
    const activeKey = `${name}`;
    const newData = {
      platform: name,
      messages: [
        {
          key: 0,
          type: 0,
          speech: [
            {
              key: 1,
              text: '',
            }
          ]
        }
      ],
      key: name,
      default_response_platform: 1,
    };
    responses.push(newData);
    this.setState({
      listPlatform: listPlatform.filter((item, index) => item !== name),
    });
    dispatchUpdateResponses(responses);
    dispatchUpdateActiveKey(activeKey);
  };

  remove = targetKey => {
    const { dispatchUpdateResponses, intentDetailReducer, dispatchUpdateActiveKey } = this.props;
    let { responses, activeKey } = intentDetailReducer;

    let { listPlatform } = this.state;
    let lastIndex;
    //thay panes thanh responses va thay activekey tu state sang reduccer
    responses.forEach((pane, i) => {
      if (pane.platform === targetKey) {
        lastIndex = i - 1;
      }
    });
    responses = responses.filter(pane => pane.platform !== targetKey);
    if (responses.length && activeKey === targetKey) {
      if (lastIndex > 0) {
        activeKey = responses[lastIndex].key;
      } else {
        activeKey = "Default";
      }
    }
    this.setState({
      listPlatform: [...listPlatform, targetKey]
    });
    dispatchUpdateResponses(responses);
    dispatchUpdateActiveKey(activeKey);
  };

  addResponse = (platform, rowValue) => {
    let { dispatchUpdateResponses, intentDetailReducer } = this.props;
    let { responses } = intentDetailReducer;
    let { keyItemResponse } = this.state;
    let newDataText = '';
    console.log(platform);
    console.log(rowValue);
    console.log(responses);

    switch (parseInt(rowValue.type, 10)) {
      case 0:
        newDataText = {
          key: keyItemResponse,
          type: 0,
          speech: [
            {
              key: 1,
              text: '',
            }
          ]
        };
        break;
      case 1:
        newDataText = {
          key: keyItemResponse,
          type: 1,
          payload: '{}',
        };
        break;
      default:
        return "Error";
    }
    responses = responses.map((item, index) => {
      if (item.platform === platform) {
        item.messages.push(newDataText);
        return item;
      }
      return item;
    });
    this.setState({
      keyItemResponse: keyItemResponse + 1,
    });
    dispatchUpdateResponses(responses);
  }

  removeResponse = (platform, key) => {
    const { dispatchUpdateResponses, intentDetailReducer } = this.props;
    let { responses } = intentDetailReducer;
    responses = responses.map((item, index) => {
      if (item.platform === platform) {
        item.messages = item.messages.filter((i) => i.key !== key);
        return item;
      }
      return item;
    });
    dispatchUpdateResponses(responses);
  }

  render() {
    const { dispatchUpdateResponses, intentDetailReducer } = this.props;
    const { responses, activeKey, endConversation } = intentDetailReducer;
    return (
      <div className="newIntent-response">
        <Tabs
          onChange={this.onChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={this.onEdit}
          hideAdd
          tabBarExtraContent=
          {
            <Dropdown overlay={this.menuPlatform} trigger={['click']}>
              <div>
                <Icon type="plus" />
              </div>
            </Dropdown>
          }
        >
          {responses.map(pane => (
            <TabPane tab={pane.platform} key={pane.platform} closable={pane.closable}>
              <div className="newIntent-response-tab-content">
                {pane.platform === 'Default'
                  ? null
                  : (<div className="newIntent-response-tab-content-default">
                    <Alert
                      message="Response from this tab will be sent to the Hangouts integration."
                      description={(
                        <div className="newIntent-response-tab-content-default-switch">
                          <span>Use response from the DEFAULT tab as the first response.</span>
                          <Switch onChange={(checked) => this.onChangeDefaultResponsePlatform(checked, pane.platform)} checked={pane.default_response_platform === 1 ? false : true} />
                        </div>
                      )}
                      type="info"
                      showIcon
                    />
                  </div>)
                }
                <div className="newIntent-response-message">
                  <DragSortingCard
                    responses={responses}
                    pane={pane}
                    removeResponse={this.removeResponse}
                    dispatchUpdateResponses={dispatchUpdateResponses} />
                </div>
                <div className="newIntent-response-tab-content-button">
                  <Dropdown overlay={() => this.menuResponse(pane.platform)} trigger={['click']}>
                    <button>ADD RESPONSES</button>
                  </Dropdown>
                </div>
              </div>
            </TabPane>
          ))}
        </Tabs>
        <div>
          <Switch onChange={this.onChangeEndConversation} checked={endConversation === 1 ? false : true} />
          <span className="newIntent-response-switch">
            Set this intent as end of conversation
						        <Tooltip title={text} text >
              <Icon
                type="question-circle"
                theme="filled"
                onClick={event => {
                  event.stopPropagation();
                }}
              />
            </Tooltip>
          </span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  intentDetailReducer: state.intentDetailReducer,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateResponses: (response) => dispatch(updateResponses(response)),
  dispatchUpdateActiveKey: (activeKey) => dispatch(updateActiveKey(activeKey)),
  dispatchUpdateEndConversation: (endConversation) => dispatch(updateEndConversation(endConversation)),
  dispatchUpdateDefaultResponsePlatform: (data) => dispatch(updateDefaultResponsePlatform(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Responses);

