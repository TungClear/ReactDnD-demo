import React, { Component } from 'react';
import { Input } from 'antd';

class DropdownEntity extends Component {

	// componentDidUpdate() {
	// 	if (document.getElementsByClassName('training-input-dropdown-menu')[0]) {
	// 		document.getElementsByClassName('training-input-dropdown-menu')[0].focus();
	// 	}
	// }

	render() {
		const {
			// selection,
			xCoords, yCoords, entities, addEntity, isDisplay, keyOfItem
			// selectedText,  
		} = this.props;
		return (
			(
				// (selection !== '' || selectedText !== '') && 
				((xCoords && yCoords) && isDisplay)
					? (
						<React.Fragment>
							<div
								// className={(xCoords && yCoords && isDisplay) ? `training-input-dropdown-menu` : `training-input-dropdown-menu hidden`}
								className="training-input-dropdown-menu"
								style={{ top: `${yCoords + window.pageYOffset}px`, left: `${xCoords + 2}px` }}
							>
								<div className="training-input-dropdown-menu-search">
									<Input placeholder="Filter" id="input-filter" />
								</div>
								<div className="training-input-dropdown-menu-list">
									<ul>
										{
											entities.map((item, index) =>
												item.type === 3 ? null : (<li
													key={index}
													onClick={() =>
														addEntity(item.name, item._id, item.name, keyOfItem)}>@{item.name}
												</li>)
											)}
									</ul>
								</div>
								<div className="training-input-dropdown-menu-new">
									NEW
              				</div>
							</div>

						</React.Fragment>
					) : null
			)
		);
	}
}

export default DropdownEntity;