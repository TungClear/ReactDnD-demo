import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Card } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';

import EmptySpace from '../emptySpace';
import {
	updateResponses
} from '../../actions/intentDetailAction';

const jsonlint = require('jsonlint-mod');
window.jsonlint = jsonlint;

require('codemirror/lib/codemirror.css');
require('codemirror/theme/xq-light.css');
require('codemirror/addon/lint/lint.css');

require('codemirror/lib/codemirror');
require('codemirror/mode/javascript/javascript');

require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');

// const text = `Supported for Facebook Messenger, Kik, Slack, 
// Skype and Telegram one-click integrations. For other platforms, 
// it can be handled in custom integrations.`;
class CardPayload extends Component {

	handleChange = () => {
		const { keyItem, intentDetailReducer, platform, dispatchUpdateResponses, payload } = this.props;
		let { responses } = intentDetailReducer;
		let platformData = responses.find(item => item.platform === platform);
		let messages = platformData.messages.map(item => {
			if (item.key === keyItem) {
				item.payload = payload;
				return item;
			}
			return item;
		});
		responses = responses.map((item, index) => {
			if (item.platform === platform) {
				item.messages = messages;
				return item;
			}
			return item;
		});
		dispatchUpdateResponses(responses);
	}

	updatePayload = (value) => {
		const { keyItem, intentDetailReducer, platform, dispatchUpdateResponses } = this.props;
		let { responses } = intentDetailReducer;
		let platformData = responses.find(item => item.platform === platform);
		let messages = platformData.messages.map(item => {
			if (item.key === keyItem) {
				item.payload = value;
				return item;
			}
			return item;
		});
		responses = responses.map((item, index) => {
			if (item.platform === platform) {
				item.messages = messages;
				return item;
			}
			return item;
		});
		dispatchUpdateResponses(responses);
	}

	render() {
		const { extraHeaderCardText, payload } = this.props;
		return (
			<Fragment>
				<Card title="Custom payload" extra={extraHeaderCardText()}>
					<CodeMirror
						value={payload}
						options={{
							theme: 'xq-light',
							lineNumbers: true,
							mode: "application/json",
							gutters: ["CodeMirror-lint-markers"],
							lint: true,
						}}
						onBeforeChange={(editor, data, value) => {
							// this.setState({ payload: value });
							this.updatePayload(value);
						}}
						onChange={this.handleChange}
					/>
				</Card>
				<EmptySpace size={1} />
			</Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	intentDetailReducer: state.intentDetailReducer,
});

const mapDispatchToProps = (dispatch) => ({
	dispatchUpdateResponses: (response) => dispatch(updateResponses(response)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CardPayload);
