import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { Card, Icon, Table, Input } from 'antd';
import EmptySpace from '../emptySpace';

import {
	updateResponses
} from '../../actions/intentDetailAction';

const { Column } = Table;
const { TextArea } = Input;

class CardText extends Component {


	handleAdd = () => {
		let { dispatchUpdateResponses, intentDetailReducer, platform, keyItem, speech } = this.props;
		let { responses } = intentDetailReducer;
		const length = speech.length;
		const newData = {
			key: length + 1,
			text: '',
		};
		speech = [...speech, newData];
		let platformData = responses.find(item => item.platform === platform);
		let messages = platformData.messages.map(item => {
			if(item.key === keyItem){
				item.speech = speech;
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
	};

	handleDelete = (keySpeech) => {
		let { dispatchUpdateResponses, intentDetailReducer, platform, keyItem, speech } = this.props;
		let { responses } = intentDetailReducer;
		speech = speech.filter((item, index) =>
			item.key !== parseInt(keySpeech, 10)
		);
		speech = speech.map((item, index) => {
			item.key = index + 1;
			return item;
		});

		let platformData = responses.find(item => item.platform === platform);
		let messages = platformData.messages.map(item => {
			if(item.key === keyItem){
				item.speech = speech;
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

	handleChange = (e, index) => {
		//keu la key cua message do
		let { dispatchUpdateResponses, intentDetailReducer, platform, keyItem, speech } = this.props;
		let { responses } = intentDetailReducer;
		const { value } = e.target;

		speech = speech.map((item, i) => {
			if (item.key === index.key) {
				item.text = value;
				return item;
			}
			return item;
		});

		let platformData = responses.find(item => item.platform === platform);
		let messages = platformData.messages.map(item => {
			if(item.key === keyItem){
				item.speech = speech;
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
		const { title, extraHeaderCardText, speech } = this.props;
		return (
			<Fragment>
				<Card title={title} extra={extraHeaderCardText()}>
					<Table
						dataSource={speech}
						pagination={false}
						showHeader={false}
						className="newIntent-response-card-text"
					>
						<Column
							dataIndex='key'
							className="newIntent-response-card-text-column-key"
							// render={(record, index) => record}
						/>
						<Column
							dataIndex='text'
							className="newIntent-response-card-text-column-area"
							render={(record, index) =>
								<TextArea
									autosize={{ minRows: 1 }}
									placeholder="Enter a text response"
									value={record}
									onChange={(e) => this.handleChange(e, index)}
								/>
							}
						/>
						<Column
							dataIndex='icon'
							className="newIntent-response-card-text-column-icon"
							render={(record, index) =>
								<Icon type="delete" theme="filled" onClick={() => this.handleDelete(index.key)} />
							}
						/>
					</Table>
					<div type="primary" className="newIntent-response-card-text-add-row" onClick={this.handleAdd}>
						<Icon type="plus" />
					</div>
				</Card>
				<EmptySpace size={1} />
			</Fragment >
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
)(CardText);
