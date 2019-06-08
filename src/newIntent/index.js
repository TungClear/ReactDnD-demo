import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form } from "antd";

import { genExtra, genExtraTraining } from './extraHeader';
import TopPanel from './topPanel';
import ActionAndParams from './actionAndParams';
import Training from './training';
import Events from './events';
import Responses from './responses';
import Fulfillment from './fulfillment';

import { getAllEntity } from '../../actions/entityAction';
import { createIntent } from '../../actions/intentAction';
import { fetchInitIntent, changeDisplayDropdown } from '../../actions/intentDetailAction';
import {
  convertHtmlToTrainingPharse,
} from '../../utils/common';

const Panel = Collapse.Panel;

class NewIntentPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFetchEntities: false,
    };
  }

  componentDidMount() {
    const { dispatchGetAllEntity, dispatchFetchInitIntent } = this.props;
    let data = {
      action: '',
      name: '',
      parameters: [],
      responses: [
        {
          platform: "Default",
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
            },
          ],
          closable: false,
          default_response_platform: 1,
        }
      ],
      training_phrase: [],
      id: '',
      dataNewTraining: [],
      html: '',//html of input training pharse
      listHtml: [],//list html of table training pharse
      selectedText: '',
      keyOfItem: -1,//key of item in table list entity in pharse
      dataFromPhrases: [],
      activeKey: 'Default',
      intentName: '',
      rangeItem: '',

      endConversation: 1,
      enableWebhook: 1,
      defaultFallback: 1,
      slotFilling: 1,
      language: '',
      entities: [],
      isDisplayDropdown: false,
    };
    dispatchGetAllEntity();
    dispatchFetchInitIntent(data);
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { intentDetailReducer, dispatchCreateIntent } = this.props;
        const { listHtml, parameters, action, responses, endConversation, enableWebhook, defaultFallback, name } = intentDetailReducer;
        const training_phrase = convertHtmlToTrainingPharse(listHtml);
        const data = {
          name: name,
          language: "vi",
          end_conversation: endConversation,
          enable_webhook: enableWebhook,
          default_fallback: defaultFallback,
          training_phrase: training_phrase,
          parameters: parameters,
          action: action,
          responses: responses,
        };
        dispatchCreateIntent(data);
      }
    });

  };

  getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  }

  hideDropdown = () => {
    const { dispatchChangeDisplayDropdown } = this.props;
    dispatchChangeDisplayDropdown(false);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    // const { intentDetailReducer } = this.props;
    // const { isDisplayDropdown } = intentDetailReducer;

    return (
      <Form>

        <TopPanel handleSubmit={this.handleSubmit} getFieldDecorator={getFieldDecorator} />
        <div className="newIntent">
          <Collapse bordered={false} defaultActiveKey={["3", "4", "5"]} expandIconPosition='right'>
            <Panel
              header="Contexts"
              key="1"
              extra={genExtra(
                `Can be used to “remember” parameter values, 
                                    so they can be passed between intents.`)}
            >
              <span className="newIntent-title">Contexts</span>
            </Panel>
            <Panel
              header="Event"
              key="2"
              extra={genExtra(`Optional way to trigger intent without the need for matched 
                                            text or spoken input. Use predefined platform 
                                            specific events or define your custom ones.`)}
            >
              <Events />
            </Panel>
            <Panel
              header="Training phrases"
              key="3"
              extra={genExtraTraining(`Phrases you can expect from users, 
                                    that will trigger the intent.`)}
            >
              <Training />
            </Panel>
            <Panel
              header="Action and parameters"
              key="4"
            >
              <ActionAndParams />
            </Panel>
            <Panel
              header="Responses"
              key="5"
              extra={genExtra(`Text, spoken and media rich responses the agent 
                                    will deliver to a user.`)}>
              <Responses />
            </Panel>
            <Panel header="Fulfillment"
              key="6"
              extra={genExtra(`Code deployed through a web service to 
                                    provide data to a user.`)}>
              <Fulfillment />
            </Panel>
          </Collapse> ,
                </div >
        {/* {isDisplayDropdown ? <div className="test" onClick={this.hideDropdown}>
        </div> : null} */}
        {/* <div className={isDisplayDropdown ? `test` : `test hidden`} onClick={this.hideDropdown}>
        </div> */}
      </Form>
    );
  }
}

const mapStateToProps = (state) => ({
  entientityReducer: state.entityReducer,
  intentDetailReducer: state.intentDetailReducer,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchGetAllEntity: () => dispatch(getAllEntity()),
  dispatchCreateIntent: (data) => dispatch(createIntent(data)),
  dispatchFetchInitIntent: (data) => dispatch(fetchInitIntent(data)),
  dispatchChangeDisplayDropdown: (data) => dispatch(changeDisplayDropdown(data)),
});

const NewIntent = Form.create({ name: 'New_Intent' })(NewIntentPage);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewIntent);



