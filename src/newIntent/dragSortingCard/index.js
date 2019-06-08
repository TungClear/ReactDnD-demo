
import React, { Component } from 'react';
import update from 'immutability-helper';
import { Icon, Tooltip } from 'antd';

import CardText from '../../cardText';
import CardPayload from '../../cardPayload';
import DragCard from './dragCard';

const text = `Use Shift+Enter for a new line. 
					Supported for Facebook Messenger, 
					Kik, Slack, Skype and Telegram integrations.`;

class DragSortingCard extends Component {
	
	moveCard = (dragIndex, hoverIndex) => {
		console.log(this.props);
		let { pane, dispatchUpdateResponses, responses } = this.props;
		let messages = pane.messages;
		let message = messages[dragIndex];
		messages = update(messages, { $splice: [[dragIndex, 1], [hoverIndex, 0, message]] });

		responses = responses.map(item => {
			if (item.platform === pane.platform) {
				pane.messages = messages;
				return item;
			}
			return item;
		});
		dispatchUpdateResponses(responses);

	}

	addPropKeyInArray = (array) => {
		return array.map((item, index) => item.key = index);
	}

	extraHeaderCardText = (key) => {
		const { removeResponse, pane } = this.props;
		return (
			<div className="newIntent-response-card-header-right">
				<Tooltip title={text} text>
					<Icon type="question-circle" theme="filled" />
				</Tooltip>
				<Icon type="delete" theme="filled" onClick={() => removeResponse(pane.platform, key)} />
			</div>
		);
	}

	render() {
		const { pane } = this.props;
		const { platform } = pane;
		return (
			<div>
				{pane.messages.map((item, index) => {
					switch (item.type) {
						case 0:
							return (
								<DragCard
									key={item.key}
									index={index}
									moveCard={this.moveCard}
								>
									<CardText
										extraHeaderCardText={() => this.extraHeaderCardText(item.key)}
										title='Text response'
										speech={item.speech}
										keyItem={item.key}
										platform={platform}
									/>
								</DragCard>
							);
						case 1:
							return (
								<DragCard
									key={item.key}
									index={index}
									moveCard={this.moveCard}
								>
									<CardPayload
										extraHeaderCardText={() => this.extraHeaderCardText(item.key)}
										payload={item.payload}
										keyItem={item.key}
										platform={platform}
									/>
								</DragCard>
							);
						default:
							return <p>Error</p>;
					}
				})}
			</div>
		);
	}
}

export default DragSortingCard;