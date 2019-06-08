import React from 'react';
import { Select } from 'antd';

const OPTIONS = [
	'Apples',
	'Nails',
	'Bananas',
	'Helicopters',
	'Google Assistant',
	'Facebook Welcome',
	'Slack Welcome',
	'Messenger Welcome',
];

class Events extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedItems: [],
		};
	}

	handleChange = selectedItems => {
		this.setState({ selectedItems });
	};

	render() {
		const { selectedItems } = this.state;
		const filteredOptions = OPTIONS.filter(o => !selectedItems.includes(o));
		return (
			<div className="newIntent-event">
				<Select
					mode="multiple"
					placeholder="Inserted are removed"
					value={selectedItems}
					onChange={this.handleChange}
					style={{ width: '100%' }}
				>
					{filteredOptions.map(item => (
						<Select.Option key={item} value={item} className="newIntent-event-select-dropdown-item">
							{item}
						</Select.Option>
					))}
				</Select>
			</div>
		);
	}
}

export default Events;
