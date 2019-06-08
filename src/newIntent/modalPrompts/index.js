import React, { Component, Fragment } from 'react';

import { Card, Icon, Table, Input } from 'antd';
import EmptySpace from '../../emptySpace';

const { Column } = Table;
const { TextArea } = Input;

class ModalPrompts extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [
				{
					key: 1,
					text: '',
				},
			],
		};
	}

	componentDidMount() {
		const { data } = this.props;
		if (data) {
			this.setState({
				data: data,
			});
		}
	}

	handleAdd = () => {
		const { updateModalData, parameterId } = this.props;
		let { data } = this.state;
		const length = data.length;
		const newData = {
			key: length + 1,
			text: '',
		};
		data = [...data, newData];
		this.setState({
			data: data,
		});
		updateModalData(parameterId, data);
	};

	handleDelete = (key) => {
		const { updateModalData, parameterId } = this.props;
		let { data } = this.state;
		data = data.filter((item, index) =>
			item.key !== parseInt(key, 10)
		);
		data = data.map((item, index) => {
			item.key = index + 1;
			return item;
		});
		this.setState({
			data: data
		});
		updateModalData(parameterId, data);
	}

	handleChange = (e, index) => {
		const { updateModalData, parameterId } = this.props;
		let { data } = this.state;
		const { value } = e.target;
		console.log(value);
		data = data.map((item, i) => {
			if (item.key === index.key) {
				item.text = value;
				return item;
			}
			return item;
		});
		this.setState({
			data: data
		});
		updateModalData(parameterId, data);
	}

	render() {
		const { data } = this.state;
		const {title} = this.props;
		return (
			<Fragment>
				<Card title={title}>
					<Table
						dataSource={data}
						pagination={false}
						showHeader={false}
						className="newIntent-response-card-text"
					>
						<Column
							dataIndex='key'
							className="newIntent-response-card-text-column-key"
							render={(record, index) => record}
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

export default ModalPrompts;