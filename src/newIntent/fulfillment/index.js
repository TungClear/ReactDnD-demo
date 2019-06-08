import React, { Component } from 'react';
import { Switch } from 'antd';

import { connect } from 'react-redux';

import {
	updateEnableWebhook,
	updateSlotFilling
} from '../../../actions/intentDetailAction';

class Fulfillment extends Component {

	constructor(props) {
		super(props);
		this.state = {
			checkedFirst: false,
			checkedSecond: false,
			disabled: true,
		};
	}

	onChangeWebhook = (checked) => {
		const { dispatchUpdateEnableWebhook } = this.props;
		if (checked) {
			dispatchUpdateEnableWebhook(checked === true ? 2 : 1);
			this.setState({
				disabled: false,
			});
			return;
		}
		dispatchUpdateEnableWebhook(checked === true ? 2 : 1);
		this.setState({
			disabled: true,
		});
	}

	onChangeSlotFilling = (checked) => {
		const { dispatchUpdateSlotFilling } = this.props;
		dispatchUpdateSlotFilling(checked === true ? 2 : 1);
	}

	render() {
		const { disabled } = this.state;
		const { intentDetailReducer } = this.props;
		const { enableWebhook, slotFilling } = intentDetailReducer;

		return (
			<div className="newIntent-fulfillment">
				<div className="newIntent-fulfillment-first">
					<Switch onChange={this.onChangeWebhook} checked={enableWebhook === 1 ? false : true} />
					<span>
						Enable webhook call for this intent
          </span>
				</div>
				<div className="newIntent-fulfillment-second">
					<Switch
						onChange={this.onChangeSlotFilling}
						disabled={disabled}
						checked={slotFilling === 1 ? false : true}
					/>
					<span>
						Enable webhook call for slot filling
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
	dispatchUpdateEnableWebhook: (data) => dispatch(updateEnableWebhook(data)),
	dispatchUpdateSlotFilling: (data) => dispatch(updateSlotFilling(data)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Fulfillment);
