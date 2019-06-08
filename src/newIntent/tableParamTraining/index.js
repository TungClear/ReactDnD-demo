import React, { Component } from 'react';

import { Table, Icon } from 'antd';

const { Column } = Table;
class TableParamTraining extends Component {

	convertHtmlToData = (html) => {
		let div = document.createElement('div');
		div.innerHTML = html;
		const childList = div.childNodes;
		const data = this.getNewDataTraining(childList);
		return data;
	}

	getNewDataTraining = (childList) => {
		let newData = [];
		let data = {};
		let alias = '', entity_id = '', user_defined = "1", color = '', key = '', meta = '';
		childList.forEach(
			function (currentValue, currentIndex) {
				if (currentValue.nodeType === 1) {
					for (let item of currentValue.attributes) {
						switch (item.name) {
							case "selection-user-defined":
								user_defined = item.value;
								break;
							case "selection-alias":
								alias = item.value;
								break;
							case "selection-meta":
								meta = item.value;
								break;
							case "selection-entity-id":
								entity_id = item.value;
								break;
							case "selection-bg":
								color = item.value;
								break;
							case "key":
								key = item.value;
								break;
							default:
								break;
						}
					}
					data = {
						text: currentValue.textContent,
						alias: alias,
						entity_id: entity_id,
						user_defined: user_defined,
						key: key,
						color: color,
						meta: meta,
					};
					newData = [...newData, data];
				}
			},
			'myThisArg'
		);
		return newData;
	}

	render() {
		const { html, deleteEntityInPharse, keyOfItem } = this.props;
		const dataNewTraining = this.convertHtmlToData(html);

		return (
			(dataNewTraining.length
				? (<div className="newIntent-training-wrap-table-param">
					<Table
						bordered={false}
						className="newIntent-training-table-param"
						dataSource={dataNewTraining}
						pagination={false}
					>
						{/* <Column
							title="PARAMETER NAME"
							dataIndex="alias"
							bordered={false}
						/> */}
						<Column
							title="ENTITY"
							dataIndex="meta"
							render={(record, index) => (
								<span style={{ background: `${index.color}` }}>@{record}</span>
							)}
						/>
						<Column
							title="RESOLVED VALUE"
							dataIndex="text"
						/>
						<Column
							title=""
							dataIndex="key"
							render={(record, index) => (
								<Icon type="delete" style={{ cursor: "pointer" }} onClick={() => deleteEntityInPharse(record, keyOfItem)} />
							)}
						/>
					</Table>
				</div>) : null)
		);
	}
}

export default TableParamTraining;