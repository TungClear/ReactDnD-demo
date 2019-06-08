import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { Menu, Dropdown, Icon } from 'antd';

import { createIntent } from '../../../actions/intentAction';
import { updateIntentName } from '../../../actions/intentDetailAction';
import { sortByStart, } from '../../../utils/common';

import history from '../../../utils/history';
const menuNewIntentTopPanel = (
  <Menu className="tpr-dropdown-menu">
    <Menu.Item key="0" onClick={() => history.goBack()}>
      Cancel
    </Menu.Item>
    <Menu.Item key="1">
      Disable ML
    </Menu.Item>
  </Menu>
);
class TopPanel extends Component {

  handleClick = () => {
    const { intentDetailReducer, dispatchCreateIntent } = this.props;
    let { listHtml, parameters, action, responses, endConversation, enableWebhook, defaultFallback, name } = intentDetailReducer;
    const training_phrase = this.convertListHtmlToTrainingPhrase(listHtml);
    const language = localStorage.getItem('languageAgent');
    const parametersT = this.convertParameters(parameters);
    responses = this.convertResponse(responses);
    const data = {
      name: name,
      language: language,
      end_conversation: endConversation,
      enable_webhook: enableWebhook,
      default_fallback: defaultFallback,
      training_phrase: training_phrase,
      parameters: parametersT,
      action: action,
      responses: responses,
    };
    dispatchCreateIntent(data);
  }

  handleChange = (event) => {
    const { value } = event.target;
    const { dispatchUpdateIntentName } = this.props;
    dispatchUpdateIntentName(value);
  }

  convertParameters = (parameters) => {
    parameters = parameters.map(item => {
      let entity_ids = [];
      if (item.entity_id !== "") {
        entity_ids.push(item.entity_id);
      }
      entity_ids = entity_ids.concat(item.optional_entity);
      return {
        ...item,
        entity_ids: entity_ids
      };
    });

    parameters = parameters.map(item => {
      item.prompts = item.prompts.map((prompts) => prompts.text);
      item.wrong_prompts = item.wrong_prompts.map((wrong_prompts) => wrong_prompts.text);
      return {
        ...item,
      };
    });
    return parameters;
  }

  convertListHtmlToTrainingPhrase = (listHtml) => {
    let result = [];
    listHtml.forEach(item => {
      item.arraySelected = sortByStart(item.arraySelected);
      let data = this.convertArray(item.arraySelected, item.textValue);
      result.push({
        data: data,
      });
    });
    return result;
  }

  // convertArray = (arraySelected, text) => {
  //   let result = [];
  //   for (let i = 0; i < arraySelected.length; i++) {
  //     let checkNear;
  //     if (i < arraySelected.length - 1) {
  //       checkNear = arraySelected[i + 1].indexStart - arraySelected[i].indexEnd === 1;
  //       if (checkNear) {
  //         if (i === 0) {
  //           if (text.slice(0, arraySelected[i].indexStart) !== "") {
  //             result.push({
  //               text: text.slice(0, arraySelected[i].indexStart)
  //             });
  //           }
  //         }
  //         result.push({
  //           text: text.slice(arraySelected[i].indexStart, arraySelected[i].indexEnd),
  //           entity_id: arraySelected[i].entity_id,
  //           alias: arraySelected[i].alias,
  //           user_defined: 2,
  //         });
  //       } else {
  //         if (i === 0) {
  //           if (text.slice(0, arraySelected[i].indexStart) !== "") {
  //             result.push({
  //               text: text.slice(0, arraySelected[i].indexStart)
  //             });
  //           }
  //         }
  //         result.push({
  //           text: text.slice(arraySelected[i].indexStart, arraySelected[i].indexEnd),
  //           entity_id: arraySelected[i].entity_id,
  //           alias: arraySelected[i].alias,
  //           user_defined: 2,
  //         });
  //         if (text.slice(arraySelected[i].indexEnd + 1, arraySelected[i + 1].indexStart) !== "") {
  //           result.push({
  //             text: text.slice(arraySelected[i].indexEnd + 1, arraySelected[i + 1].indexStart)
  //           });
  //         }
  //       }
  //     } else {
  //       result.push({
  //         text: text.slice(arraySelected[i].indexStart, arraySelected[i].indexEnd),
  //         entity_id: arraySelected[i].entity_id,
  //         alias: arraySelected[i].alias,
  //         user_defined: 2,
  //       });
  //       if (text.slice(arraySelected[i].indexEnd + 1) !== "") {
  //         result.push({
  //           text: text.slice(arraySelected[i].indexEnd + 1)
  //         });
  //       }
  //     }
  //   }
  //   result = result.filter(elm => {
  //     if (typeof elm === 'string') {
  //       return elm.trim();
  //     }
  //     return elm;
  //   });
  //   return result;
  // }

  sortByStart = (array) => {
    return array.sort((a, b) => (a.indexStart > b.indexStart) ? 1 : ((b.indexStart > a.indexStart) ? -1 : 0));
  }

  convertArray = (arraySelected, textValue) => {
    let result = [];
    let lastCutIndex = 0;
    for (let i = 0; i < arraySelected.length; i++) {
      let text = textValue.substring(lastCutIndex, arraySelected[i].indexStart);
      if (text !== "") {
        result.push({
          text: text,
        });
      }
      text = textValue.substring(arraySelected[i].indexStart, arraySelected[i].indexEnd + 1);
      result.push({
        text: text,
        alias: arraySelected[i].alias,
        entity_id: arraySelected[i].entity_id,
        user_defined: 2
      });
      lastCutIndex = arraySelected[i].indexEnd + 1;
    }
    if (textValue.substring(lastCutIndex) !== "") {
      result.push({
        text: textValue.substring(lastCutIndex)
      });
    }
    return result;
  }

  convertResponse = (responses) => {
    responses = responses.map((item, index, array) => {
      const test = item.messages.map((objMsg) =>
        (objMsg.type === 0
          ? { ...objMsg, speech: objMsg.speech.filter(objSpeech => objSpeech.text !== "").map(objSpeech => objSpeech.text) }
          : objMsg)
      );
      return {
        ...item,
        messages: test,
      };
    });
    return responses;
  }

  render() {
    const { intentDetailReducer } = this.props;
    const { name } = intentDetailReducer;
    return (
      <div className="cb-top-panel">
        <div className="top-panel-center">
          <div className="newIntent-tp-left">
            <h1>
              <div className="newIntent-tp-left-prefix"></div>
              <input
                className="newIntent-tp-left-input"
                placeholder="Intent name"
                onChange={this.handleChange}
                value={name}
                required
              />
              {/* <Form.Item>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: 'Please input your intent name!' }],
                })(
                  <Input
                    className="newIntent-tp-left-input"
                    placeholder="Intent name"
                    onChange={this.handleChange}
                  />,
                )}
              </Form.Item> */}
            </h1>
          </div>
          <div className="newIntent-tp-right">
            <h1>
              <Button
                type="primary"
                size="large"
                style={{ marginRight: '15px' }}
                onClick={this.handleClick}
              >
                Save
                </Button>
              <Dropdown overlay={menuNewIntentTopPanel} trigger={['click']}>
                <Icon type="more" style={{ verticalAlign: '-0.5rem' }} />
              </Dropdown>
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  intentDetailReducer: state.intentDetailReducer,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCreateIntent: (data) => dispatch(createIntent(data)),
  dispatchUpdateIntentName: (name) => dispatch(updateIntentName(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopPanel);
