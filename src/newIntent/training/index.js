import React, { Component } from 'react';
import { connect } from 'react-redux';
import ContentEditable from "react-contenteditable";
import sanitizeHtml from "sanitize-html";

import { List, Icon, Menu } from "antd";

import DropdownEntity from '../dropdownEntity';
import TableParamTraining from '../tableParamTraining';

import {
	updateTrainingPharse,
	// updateDataNewTraining,
	updateListHtml,
	updateSelectedText,
	updateKeyOfItem,
	updateParameter,
	updateHtml,
	updateDataFromPhares,
	addEventClickToSpan,
	addEventPasteToDiv,
	updateRange,
	changeDisplayDropdown,
	// UPDATE_LIST_HTML,
	// UPDATE_HTML,
	// ADD_EVENT_CLICK_TO_SPAN,
	ADD_EVENT_PASTE_TO_DIV,
	// UPDATE_KEY_OF_ITEM
} from '../../../actions/intentDetailAction';

// import { GET_ALL_ENTITY_SUCCESS } from '../../../actions/entityAction';
// import { arrayColor } from '../../../config/constants';

class Training extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isDislayEntity: false,
			xCoords: 0,
			yCoords: 0,
			selection: '',//selected text in input phrase đang luu tại state local
			textValue: '',//giá trị plain text của input
			html: '',
			countColor: 0,
			dataNewTraining: [],
			clickedNode: '',//span node người dùng click
			modeClick: false,
			keyItemListPhrase: 0,
			idSpan: 0,
			range: '',
			arraySelectedText: [],
		};
	}

	menuEntity = (
		<Menu className="">
			<Menu.Item key="0">
				All
      </Menu.Item>
			<Menu.Item key="1">
				Regular
      </Menu.Item>
			<Menu.Item key="2">
				Fallback
      </Menu.Item>
		</Menu>
	)

	componentDidMount() {
		// const { intentDetailReducer } = this.props;
		// const { html } = this.state;
		this.setState({
			// textValue: sanitizeHtml(html, this.sanitizeConf),
		});
		const div = document.getElementById("editable0");
		div.addEventListener('paste', this.handlePaste);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.intentDetailReducer.type === ADD_EVENT_PASTE_TO_DIV) {
			this.addEventPasteToDiv();
		}
	}

	getRandomInt = (max) => {
		return Math.floor(Math.random() * Math.floor(max));
	}

	getSelection = (selectionStart, selectionEnd, value) => {
		const words = value.split(/\s+/);
		const indexStart = words[0].length, indexEnd = value.length - words[words.length - 1].length;
		if (selectionStart === selectionEnd && selectionStart === 0) return "";
		if (selectionStart < indexStart) {
			selectionStart = 0;
		} else {
			for (let i = selectionStart; i >= 0; i--) {
				if (value.charAt(i) === ' ') {
					selectionStart = i + 1;
					break;
				}
				// if (value.charCodeAt(i) === 30 || value.charCodeAt(i) === 160) {
				// 	selectionStart = i + 1;
				// 	break;
				// }
			}
		}
		if (selectionEnd > indexEnd) {
			selectionEnd = value.length;
		} else {
			for (let i = selectionEnd - 1; i < value.length; i++) {
				if (value.charAt(i) === ' ') {
					selectionEnd = i;
					break;
				}
				// if (value.charCodeAt(i) === 30 || value.charCodeAt(i) === 160) {
				// 	selectionEnd = i;
				// 	break;
				// }
			}
		}
		// const selection = value.substring(selectionStart, selectionEnd).trim();
		const selection = value.substring(selectionStart, selectionEnd);
		const data = {
			selection, selectionStart, selectionEnd
		};
		return data;
	}

	sanitizeConf = {
		allowedTags: ["b", "i", "em", "strong", "a", "p", "h1"],
		allowedAttributes: { a: ["href"] }
	};

	addEventPasteToDiv = () => {
		const divList = document.getElementsByClassName('editable');
		if (divList.length > 0) {
			Array.from(divList).forEach(element => {
				element.addEventListener('paste', this.handlePaste);
			});
		}
	}

	handlePaste = (event, id) => {
		// var clipboardData, pastedData;
		event.stopPropagation();
		event.preventDefault();
		// Get pasted data via clipboard API
		// clipboardData = event.clipboardData || window.clipboardData;
		// pastedData = clipboardData.getData('Text');
		let space = '';
		document.execCommand("insertHTML", false, space);
	}

	displayDropdownMenu = (selected) => {
		const { dispatchChangeDisplayDropdown } = this.props;
		dispatchChangeDisplayDropdown(true);
		this.setState({
			clickedNode: selected, modeClick: true
		});
		// event.stopPropagation();
	}

	clearAllRanges = () => {
		if (window.getSelection) {
			if (window.getSelection().empty) {  // Chrome
				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {  // Firefox
				window.getSelection().removeAllRanges();
			}
		} else if (document.selection) {  // IE?
			document.selection.empty();
		}
	}

	handleChange = evt => {
		const { dispatchUpdateHtml, dispatchChangeDisplayDropdown } = this.props;
		let { textValue, arraySelectedText } = this.state;

		const value = sanitizeHtml(evt.target.value, this.sanitizeConf);
		const newLength = value.length, oldLength = textValue.length;
		const position = window.getSelection().getRangeAt(0).startOffset;
		// const end = window.getSelection().getRangeAt(0).endOffset;

		//bug xóa toàn bộ text
		if (newLength === 0) {
			this.setState({
				textValue: value,
				arraySelectedText: [],
			});
			let html = '';
			dispatchUpdateHtml(html);
			dispatchChangeDisplayDropdown(false);
			return;
		}

		//bug trỏ vào span và không cho chỉnh sửa
		// if (this.checkIndexBetweenIgnoreBound(position, arraySelectedText) ||
		// 	this.checkIndexBetweenIgnoreBound(end, arraySelectedText)) {
		// 	const { html } = this.props.intentDetailReducer;
		// 	dispatchUpdateHtml(html);
		// 	dispatchChangeDisplayDropdown(false);
		// 	return;
		// }

		if (newLength > oldLength) {
			let size = newLength - oldLength;
			arraySelectedText = this.sortByStart(arraySelectedText);
			if (this.checkIndexBetween(position - 1, arraySelectedText)) {
				// const { html } = this.props.intentDetailReducer;
				// dispatchUpdateHtml(html);
				// dispatchChangeDisplayDropdown(false);
				// return;
				let selected = this.getItemBetWeen(position, arraySelectedText);
				arraySelectedText = arraySelectedText.filter(item => item !== selected);
				arraySelectedText = arraySelectedText.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart + size;
						item.indexEnd = item.indexEnd + size;
						return item;
					}
					return item;
				});
				this.setState({
					arraySelectedText
				});
			}
			else {
				arraySelectedText = this.sortByStart(arraySelectedText);
				arraySelectedText = arraySelectedText.map(item => {
					if (position - 1 <= item.indexStart) {
						item.indexStart = item.indexStart + size;
						item.indexEnd = item.indexEnd + size;
						return item;
					}
					return item;
				});
			}
		} else {
			let size = oldLength - newLength;
			arraySelectedText = this.sortByStart(arraySelectedText);
			if (this.checkIndexBetween(position, arraySelectedText)) {
				let selected = this.getItemBetWeen(position, arraySelectedText);
				arraySelectedText = arraySelectedText.filter(item => item !== selected);
				arraySelectedText = arraySelectedText.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart - size;
						item.indexEnd = item.indexEnd - size;
						return item;
					}
					return item;
				});
				// this.setState({
				// 	arraySelectedText
				// });
			} else {
				arraySelectedText = arraySelectedText.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart - size;
						item.indexEnd = item.indexEnd - size;
						return item;
					}
					return item;
				});
			}
		}
		this.setState({
			textValue: value,
			arraySelectedText: arraySelectedText,
		});

		let html = this.convertArraySelectedTextToHtml(arraySelectedText, value);
		dispatchUpdateHtml(html);
	};

	handleOnMouseDown = (event) => {
		// this.clearAllRanges();
		// event.preventdefault();
		// const { dispatchAddEventClickToSpan } = this.props;
		// window.getSelection().removeAllRanges();
		// const { clientX, clientY } = event;
		// this.setState({
		// 	selection: '',
		// 	xCoords: clientX,
		// 	yCoords: clientY,
		// 	// range: '',
		// });
		const { dispatchChangeDisplayDropdown } = this.props;
		// window.getSelection().removeAllRanges();
		dispatchChangeDisplayDropdown(false);
		// dispatchAddEventClickToSpan();
	}

	handleOnMouseUp = (event) => {
		const { dispatchUpdateKeyOfItem, dispatchChangeDisplayDropdown, dispatchUpdateHtml } = this.props;
		const { clientX } = event;
		let { arraySelectedText, textValue } = this.state;
		if (window.getSelection) {
			const sel = window.getSelection();
			const range = sel.getRangeAt(0);
			const indexStart = range.startOffset, indexEnd = range.endOffset;
			let selected = '';

			if (indexStart === indexEnd && indexStart === textValue.length) {
				return;
			}
			if (indexStart === indexEnd && indexStart === 0) {
				let html = this.convertArraySelectedTextToHtml(arraySelectedText, textValue);
				dispatchUpdateHtml(html);
				return;
			}
			if (indexStart === indexEnd && this.checkIndexBetween(indexStart, arraySelectedText)) {
				selected = this.getItemBetWeen(indexStart, arraySelectedText);
				this.displayDropdownMenu(selected);
			} else {
				if (sel.toString().trim() === "" || sel.toString() === "") {
					return;
				}
				if (sel.toString() !== " ") {
					let position = this.getPosition(event.target);
					this.setState({
						selection: sel.toString(),
						// xCoords: clientX,
						// yCoords: clientY,
						xCoords: clientX,
						yCoords: position.y,
						range: range
					});
					// this.clearAllRanges();
					// window.getSelection().removeAllRanges();
					dispatchChangeDisplayDropdown(true);
				}
			}
		}
		dispatchUpdateKeyOfItem(-1);
	}

	handleOnKeyDown = (event) => {
		const { intentDetailReducer, dispatchAddEventPasteToDiv } = this.props;
		const { parameters, isDisplayDropdown } = intentDetailReducer;
		if (isDisplayDropdown === true) {
			event.preventDefault();
			return;
		} else {
			if (event.keyCode === 13 || event.which === 13) {
				const { intentDetailReducer, dispatchUpdateListHtml, dispatchUpdateHtml, dispatchUpdateParameter } = this.props;
				let { listHtml, html } = intentDetailReducer;
				let { keyItemListPhrase, textValue, arraySelectedText } = this.state;
				if (textValue === "") {
					event.preventDefault();
					return;
				} else {
					// if (html === "") {
					// 	newData = {
					// 		key: keyItemListPhrase, html: textValue, textValue: textValue, arraySelected: arraySelectedText,
					// 	};
					// } else {
					console.log(html);

					let newData = {
						key: keyItemListPhrase, html: html, textValue: textValue, arraySelected: arraySelectedText,
					};
					// }
					listHtml.unshift(newData);

					let cuongngu = this.convertArraySelectedTextToParameter(arraySelectedText);
					cuongngu.forEach(item => {
						let index = parameters.findIndex(item2 => item2.entity_id === item.entity_id);
						if (index === -1) {
							parameters.push(item);
						} else {
							//update idSPan tại entity của parameter
							let index = parameters.findIndex(item2 => item2.entity_id === item.entity_id);
							parameters[index].idSpan.push(item.key);
						}
					});

					dispatchUpdateHtml('');
					dispatchUpdateListHtml(listHtml);
					dispatchUpdateParameter(parameters);
					dispatchAddEventPasteToDiv();
					this.setState({
						keyItemListPhrase: keyItemListPhrase + 1,
						textValue: '',
						arraySelectedText: [],
					});
					event.preventDefault();
				}
			}
		}
	}

	convertArraySelectedTextToParameter = (arraySelectedText) => {
		let cuongngu = Array.from(new Set(arraySelectedText.map(s => s.entity_id))).map(entity_id => {
			return {
				entity_id: entity_id,
				indexStart: arraySelectedText.find(s => s.entity_id === entity_id).indexStart,
				indexEnd: arraySelectedText.find(s => s.entity_id === entity_id).indexEnd,
				selection: arraySelectedText.find(s => s.entity_id === entity_id).selection,
				key: arraySelectedText.find(s => s.entity_id === entity_id).key,
				alias: arraySelectedText.find(s => s.entity_id === entity_id).alias,
				meta: arraySelectedText.find(s => s.entity_id === entity_id).meta,
				keyOfItem: arraySelectedText.find(s => s.entity_id === entity_id).keyOfItem,
				color: arraySelectedText.find(s => s.entity_id === entity_id).color,

				required: 1,
				is_list: 1,
				use_from_text: 1,
				wrong: '—',
				wrong_prompts: [],
				prompt: '—',
				prompts: [],
				id: arraySelectedText.find(s => s.entity_id === entity_id).key,
				name: arraySelectedText.find(s => s.entity_id === entity_id).alias,
				value: arraySelectedText.find(s => s.entity_id === entity_id).alias,
				optional_entity: [],
				optional_entity_name: [],
				entity_name: arraySelectedText.find(s => s.entity_id === entity_id).alias,
				idSpan: [arraySelectedText.find(s => s.entity_id === entity_id).key],

			};
		});
		return cuongngu;
	}

	handleChangeItem = (event, key) => {
		const { dispatchUpdateListHtml, intentDetailReducer } = this.props;
		let { listHtml } = intentDetailReducer;
		const value = sanitizeHtml(event.target.value, this.sanitizeConf);
		const textValue = listHtml.find(item => item.key === key).textValue;
		let arraySelected = listHtml.find(item => item.key === key).arraySelected;

		const newLength = value.length, oldLength = textValue.length;
		const position = window.getSelection().getRangeAt(0).startOffset;
		// const end = window.getSelection().getRangeAt(0).endOffset;

		if (newLength === 0) {
			listHtml = listHtml.map((item, index) => {
				if (item.key === key) {
					item.textValue = '';
					item.html = '';
					return item;
				}
				return item;
			});
			dispatchUpdateListHtml(listHtml);
			return;
		}

		//bug trỏ vào span và không cho chỉnh sửa
		// if (this.checkIndexBetweenIgnoreBound(position, arraySelected) ||
		// 	this.checkIndexBetweenIgnoreBound(end, arraySelected)) {
		// 	dispatchUpdateListHtml(listHtml);
		// 	dispatchChangeDisplayDropdown(false);
		// 	return;
		// }

		if (newLength > oldLength) {
			let size = newLength - oldLength;
			arraySelected = this.sortByStart(arraySelected);
			if (this.checkIndexBetween(position - 1, arraySelected)) {
				// dispatchUpdateListHtml(listHtml);
				// dispatchChangeDisplayDropdown(false);
				// return;.
				let selected = this.getItemBetWeen(position, arraySelected);
				arraySelected = arraySelected.filter(item => item !== selected);
				arraySelected = arraySelected.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart + size;
						item.indexEnd = item.indexEnd + size;
						return item;
					}
					return item;
				});
			}
			else {
				arraySelected = this.sortByStart(arraySelected);
				arraySelected = arraySelected.map(item => {
					if (position - 1 <= item.indexStart) {
						item.indexStart = item.indexStart + size;
						item.indexEnd = item.indexEnd + size;
						return item;
					}
					return item;
				});
			}
		} else {
			let size = oldLength - newLength;
			arraySelected = this.sortByStart(arraySelected);
			if (this.checkIndexBetween(position, arraySelected)) {
				let selected = this.getItemBetWeen(position, arraySelected);
				arraySelected = arraySelected.filter(item => item !== selected);

				arraySelected = arraySelected.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart - size;
						item.indexEnd = item.indexEnd - size;
						return item;
					}
					return item;
				});

				// let index = parameters.findIndex(item => item.entity_id === selected.entity_id);
				// if (index === -1) {
				// 	return;
				// } else {
				// 	parameters[index].idSpan = parameters[index].idSpan.filter(item => item + '' !== selected.key + '');
				// 	if (parameters[index].idSpan.length === 0) {
				// 		parameters = parameters.filter(item => item.entity_id !== selected.entity_id);
				// 	}
				// }
			} else {
				arraySelected = arraySelected.map(item => {
					if (position <= item.indexStart) {
						item.indexStart = item.indexStart - size;
						item.indexEnd = item.indexEnd - size;
						return item;
					}
					return item;
				});
			}
		}

		let html = this.convertArraySelectedTextToHtml(arraySelected, value);
		listHtml = listHtml.map((item, index) => {
			if (item.key === key) {
				item.textValue = value;
				item.arraySelected = arraySelected;
				item.html = html;
				return item;
			}
			return item;
		});

		dispatchUpdateListHtml(listHtml);
		// dispatchUpdateParameter(parameters);
	}

	handleOnMouseDownItem = (event, key) => {
		// this.clearAllRanges();
		// const { clientX, clientY } = event;
		const { dispatchChangeDisplayDropdown } = this.props;
		// this.setState({
		// 	xCoords: clientX,
		// 	yCoords: clientY,
		// });
		// dispatchUpdateSelectedText('');
		// dispatchUpdateRange('');
		dispatchChangeDisplayDropdown(false);
	}

	handleOnMouseUpItem = (event, key) => {
		const { clientX } = event;
		const { dispatchUpdateSelectedText, dispatchUpdateKeyOfItem, dispatchUpdateRange, intentDetailReducer, dispatchChangeDisplayDropdown, dispatchUpdateListHtml } = this.props;
		let { listHtml } = intentDetailReducer;

		let arraySelected = listHtml.find(item => item.key === key).arraySelected;
		let textValue = listHtml.find(item => item.key === key).textValue;
		if (window.getSelection) {
			const sel = window.getSelection();
			try {
				const range = sel.getRangeAt(0);
				const indexStart = range.startOffset, indexEnd = range.endOffset;

				if (indexStart === indexEnd && indexStart === textValue.length) {
					return;
				}
				if (indexStart === indexEnd && indexStart === 0) {
					let html = this.convertArraySelectedTextToHtml(arraySelected, textValue);
					listHtml = listHtml.map((item, index) => {
						if (item.key === key) {
							item.html = html;
							return item;
						}
						return item;
					});
					dispatchUpdateListHtml(listHtml);
					return;
				}
				if (indexStart === indexEnd && this.checkIndexBetween(indexStart, arraySelected)) {
					let selected = this.getItemBetWeen(indexStart, arraySelected);
					this.displayDropdownMenu(selected);
				} else {
					if (sel.toString().trim() === "" || sel.toString() === "") {
						return;
					}
					if (sel.toString() !== "") {
						let position = this.getPosition(event.target);
						this.setState({
							// xCoords: clientX,
							// yCoords: clientY,
							xCoords: clientX,
							yCoords: position.y,
						});
					}
					dispatchUpdateRange(range);
					dispatchUpdateSelectedText(sel.toString());
					dispatchChangeDisplayDropdown(true);
				}
			} catch (err) {
				return;
			}
			dispatchUpdateKeyOfItem(key);
		}
	}

	handleOnKeyDownItem = (event, key) => {
		const { isDisplayDropdown } = this.props.intentDetailReducer;
		if (isDisplayDropdown === true) {
			event.preventDefault();
			return;
		} else {
			if (event.keyCode === 13 || event.which === 13) {
				event.preventDefault();
				return;
			}
		}
	}

	addEntity = (alias, entity_id, meta, keyOfItem) => {
		const {
			intentDetailReducer, dispatchUpdateListHtml, dispatchUpdateSelectedText, dispatchUpdateParameter,
			dispatchUpdateHtml, entityReducer, dispatchChangeDisplayDropdown
		} = this.props;
		let { listHtml, parameters, rangeItem } = intentDetailReducer;
		const { entities } = entityReducer;
		let {
			countColor, textValue, modeClick, clickedNode, keyItemListPhrase,
			idSpan, range, arraySelectedText,
		} = this.state;

		if (keyOfItem > -1) {
			if (modeClick) {
				let color = entities.find(item => item._id === entity_id).color;
				let arraySelected = listHtml.find(item => item.key === keyOfItem).arraySelected;
				let text = listHtml.find(item => item.key === keyOfItem).textValue;
				const currentObject = {
					indexStart: clickedNode.indexStart, indexEnd: clickedNode.indexEnd, selection: clickedNode.selection,
					key: clickedNode.key, alias: alias, meta: meta, entity_id: entity_id,
					keyOfItem: clickedNode.keyOfItem, color: color,
				};
				let beforeUpdate = arraySelected.find(item => item.key === clickedNode.key);
				if (beforeUpdate === undefined) {
					return;
				}
				if (arraySelected.length > 0) {
					arraySelected = arraySelected.filter(item => item.key !== clickedNode.key);
					arraySelected.push(currentObject);
					arraySelected = arraySelected.map(item => {
						let newStr =
							`<span class="selection" id="selection${item.key}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${item.color}" selection-user-defined="2" selection-alias="${item.alias}" selection-meta="${item.meta}" selection-entity-id="${item.entity_id}" key="${item.key}" selection-bg="${item.color}">${item.selection}</span>`;
						item = { ...item, newStr: newStr };
						return item;
					});
					text = this.convertArraySelectedTextToHtml(arraySelected, text);
				}

				listHtml = listHtml.map(item => {
					if (item.key === keyOfItem) {
						item.textValue = sanitizeHtml(text, this.sanitizeConf);
						item.arraySelected = arraySelected;
						item.html = text;
						return item;
					}
					return item;
				});

				//update parameters
				//tìm kiếm entity_id rồi add thêm idSpan vô, nếu không có thì add thêm mới vào para
				beforeUpdate = {
					...beforeUpdate,
					required: 1,
					is_list: 1,
					use_from_text: 1,
					wrong: '—',
					wrong_prompts: [],
					prompt: '—',
					prompts: [],

					id: beforeUpdate.key,
					name: beforeUpdate.alias,
					value: beforeUpdate.alias,
					optional_entity: [],
					entity_name: beforeUpdate.alias,
					idSpan: [beforeUpdate.key],
				};
				let index = parameters.findIndex(item2 => item2.entity_id === beforeUpdate.entity_id);
				if (index === -1) {
					parameters.push(beforeUpdate);
				} else {
					parameters[index].idSpan.push(beforeUpdate.key);
				}

				this.setState({
					modeClick: false,
					clickedNode: '',
					textValue: sanitizeHtml(textValue, this.sanitizeConf)
					, arraySelectedText: arraySelectedText,
				});

				dispatchUpdateListHtml(listHtml);
				dispatchUpdateSelectedText('');
				dispatchChangeDisplayDropdown(false);
				dispatchUpdateParameter(parameters);
				// this.clearAllRanges();
				return;
			} else {
				let color = entities.find(item => item._id === entity_id).color;
				let arraySelected = listHtml.find(item => item.key === keyOfItem).arraySelected;
				let text = listHtml.find(item => item.key === keyOfItem).textValue;
				const indexStart = rangeItem.startOffset, indexEnd = rangeItem.endOffset;
				let select = this.getSelection(indexStart, indexEnd, text);
				if (select === " ") {
					return;
				}
				let currentObject = {
					indexStart: select.selectionStart, indexEnd: select.selectionEnd, selection: select.selection,
					key: idSpan, alias: alias, meta: meta, entity_id: entity_id, keyOfItem: keyOfItem, color: color,
				};
				if (arraySelected.length > 0) {
					arraySelected = this.checkOut(currentObject, arraySelected);
					arraySelected = arraySelected.map(item => {
						let newStr =
							`<span class="selection" id="selection${item.key}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${item.color}" selection-user-defined="2" selection-alias="${item.alias}" selection-meta="${item.meta}" selection-entity-id="${item.entity_id}" key="${item.key}" selection-bg="${item.color}">${item.selection}</span>`;
						item = { ...item, newStr: newStr };
						return item;
					});
					text = this.convertArraySelectedTextToHtml(arraySelected, text);
				} else {
					let newStr =
						`<span class="selection" id="selection${idSpan}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${color}" selection-user-defined="2" selection-alias="${alias}" selection-meta="${meta}" selection-entity-id="${entity_id}" key="${idSpan}" selection-bg="${color}">${select.selection}</span>`;
					text = this.replaceAt(text, newStr, select.selectionStart, select.selectionEnd);
					currentObject = { ...currentObject, newStr: newStr };
					arraySelected = [...arraySelected, currentObject];
				}
				//update listHtml
				listHtml = listHtml.map(item => {
					if (item.key === keyOfItem) {
						item.textValue = sanitizeHtml(text, this.sanitizeConf);
						item.arraySelected = arraySelected;
						item.html = text;
						return item;
					}
					return item;
				});

				//update parameters
				let cuongngu = this.convertArraySelectedTextToParameter(arraySelected);
				cuongngu.forEach(item => {
					let index = parameters.findIndex(item2 => item2.entity_id === item.entity_id);
					if (index === -1) {
						parameters.push(item);
					} else {
						//update idSPan tại entity của parameter
						parameters[index].idSpan.push(item.key);
					}
				});
				dispatchUpdateParameter(parameters);

				this.setState({
					// textValue: sanitizeHtml(html, this.sanitizeConf),
					countColor: countColor + 1, keyItemListPhrase: keyItemListPhrase + 1,
					idSpan: idSpan + 1,
				});
				dispatchUpdateListHtml(listHtml);
				dispatchUpdateSelectedText('');
				dispatchChangeDisplayDropdown(false);
				// this.clearAllRanges();
				return;
			}
		}

		if (modeClick) {
			let color = entities.find(item => item._id === entity_id).color;
			const currentObject = {
				indexStart: clickedNode.indexStart, indexEnd: clickedNode.indexEnd, selection: clickedNode.selection,
				key: clickedNode.key, alias: alias, meta: meta, entity_id: entity_id,
				keyOfItem: clickedNode.keyOfItem, color: color,
			};
			if (arraySelectedText.length > 0) {
				arraySelectedText = arraySelectedText.filter(item => item.key !== clickedNode.key);
				arraySelectedText.push(currentObject);
				arraySelectedText = arraySelectedText.map(item => {
					let newStr =
						`<span class="selection" id="selection${item.key}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${item.color}" selection-user-defined="2" selection-alias="${item.alias}" selection-meta="${item.meta}" selection-entity-id="${item.entity_id}" key="${item.key}" selection-bg="${item.color}">${item.selection}</span>`;
					item = { ...item, newStr: newStr };
					return item;
				});
				textValue = this.convertArraySelectedTextToHtml(arraySelectedText, textValue);
			}

			this.setState({
				modeClick: false,
				clickedNode: '',
				textValue: sanitizeHtml(textValue, this.sanitizeConf),
				// selection: '', range: '' , 
				arraySelectedText: arraySelectedText,
			});

			dispatchChangeDisplayDropdown(false);
			dispatchUpdateHtml(textValue);
			// this.clearAllRanges();
			return;
		} else {
			const indexStart = range.startOffset, indexEnd = range.endOffset;
			if (indexStart === indexEnd && indexStart === 0) {
				dispatchChangeDisplayDropdown(false);
				return;
			}
			let select = this.getSelection(indexStart, indexEnd, textValue);
			if (select === " ") {
				return;
			}
			let color = entities.find(item => item._id === entity_id).color;
			let currentObject = {
				indexStart: select.selectionStart, indexEnd: select.selectionEnd, selection: select.selection,
				key: idSpan, alias: alias, meta: meta, entity_id: entity_id, keyOfItem: keyOfItem, color: color,
			};
			if (arraySelectedText.length > 0) {
				arraySelectedText = this.checkOut(currentObject, arraySelectedText);
				arraySelectedText = arraySelectedText.map(item => {
					let newStr =
						`<span class="selection" id="selection${item.key}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${item.color}" selection-user-defined="2" selection-alias="${item.alias}" selection-meta="${item.meta}" selection-entity-id="${item.entity_id}" key="${item.key}" selection-bg="${item.color}">${item.selection}</span>`;
					item = { ...item, newStr: newStr };
					return item;
				});
				textValue = this.convertArraySelectedTextToHtml(arraySelectedText, textValue);
			} else {
				let newStr =
					`<span class="selection" id="selection${idSpan}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${color}" selection-user-defined="2" selection-alias="${alias}" selection-meta="${meta}" selection-entity-id="${entity_id}" key="${idSpan}" selection-bg="${color}">${select.selection}</span>`;
				textValue = this.replaceAt(textValue, newStr, select.selectionStart, select.selectionEnd);
				currentObject = { ...currentObject, newStr: newStr };
				arraySelectedText = [...arraySelectedText, currentObject];
			}
			dispatchUpdateHtml(textValue);
			this.setState({
				selection: '',
				textValue: sanitizeHtml(textValue, this.sanitizeConf),
				// keyItemListPhrase: keyItemListPhrase + 1,
				idSpan: idSpan + 1, range: "", arraySelectedText: arraySelectedText,
			});
			dispatchChangeDisplayDropdown(false);
			// this.clearAllRanges();
			return;
		};
	}

	deleteEntityInPharse = (key, keyOfItem) => {
		//key là key của span trong html item
		const { intentDetailReducer, dispatchUpdateListHtml, dispatchUpdateHtml } = this.props;
		let { listHtml, html } = intentDetailReducer;
		let { arraySelectedText } = this.state;
		if (parseInt(keyOfItem, 10) > -1) {
			let textValue = listHtml.find(item => item.key + '' === keyOfItem + '').textValue;
			let arraySelected = listHtml.find(item => item.key + '' === keyOfItem + '').arraySelected;
			// let entity_id = arraySelected.find(item => item.key === parseInt(key, 10)).entity_id;

			arraySelected = arraySelected.filter(item => item.key !== parseInt(key, 10));
			arraySelected = this.sortByStart(arraySelected);
			arraySelected.reverse();
			arraySelected.forEach(item => {
				textValue = this.replaceAt(textValue, item.newStr, item.indexStart, item.indexEnd);
			});

			listHtml = listHtml.map(item => {
				if (item.key + '' === keyOfItem + '') {
					item.html = textValue;
					item.arraySelected = arraySelected;
					item.textValue = sanitizeHtml(textValue, this.sanitizeConf);
					return item;
				}
				return item;
			});

			//update parameter
			// let index = parameters.findIndex(item => item.entity_id === entity_id);
			// if (index === -1) {
			// 	return;
			// } else {
			// 	parameters[index].idSpan = parameters[index].idSpan.filter(item => item + '' !== key + '');
			// 	if (parameters[index].idSpan.length === 0) {
			// 		parameters = parameters.filter(item => item.entity_id !== entity_id);
			// 	}
			// }

			dispatchUpdateListHtml(listHtml);
			// dispatchUpdateParameter(parameters);
			return;
		} else {
			arraySelectedText = arraySelectedText.filter(item => item.key !== parseInt(key, 10));
			arraySelectedText = this.sortByStart(arraySelectedText);
			arraySelectedText.reverse();
			let textValue = sanitizeHtml(html, this.sanitizeConf);
			arraySelectedText.forEach(item => {
				textValue = this.replaceAt(textValue, item.newStr, item.indexStart, item.indexEnd);
			});
			dispatchUpdateHtml(textValue);
			this.setState({
				arraySelectedText: arraySelectedText,
			});
		}
	}

	deletePhrase = (key) => {
		const { intentDetailReducer, dispatchUpdateListHtml } = this.props;
		let { listHtml } = intentDetailReducer;
		// const arraySelected = listHtml.find(item => item.key === key).arraySelected;
		listHtml = listHtml.filter(item => item.key !== key);
		// listHtml = listHtml.map((item, index) => {
		// 	item.key = index;
		// 	return item;
		// });

		// update parameter
		// arraySelected.forEach(item => {
		// 	let index = parameters.findIndex(item2 => item2.entity_id === item.entity_id);
		// 	if (index === -1) {
		// 		return;
		// 	} else {
		// 		parameters[index].idSpan = parameters[index].idSpan.filter(item3 => item3 + '' !== item.key + '');
		// 		if (parameters[index].idSpan.length === 0) {
		// 			parameters = parameters.filter(item4 => item4.entity_id !== item.entity_id);
		// 		}
		// 	}
		// });

		dispatchUpdateListHtml(listHtml);
		// dispatchUpdateParameter(parameters);
	}

	sortByStart = (array) => {
		return array.sort((a, b) => (a.indexStart > b.indexStart) ? 1 : ((b.indexStart > a.indexStart) ? -1 : 0));
	}

	checkOut = (currentObject, arraySelected) => {
		//xem selection vừa chọn có nằm trong selection đã có nào khong
		let array = [];
		arraySelected.forEach(item => {
			if (!(currentObject.indexStart >= item.indexEnd || currentObject.indexEnd <= item.indexStart)) {
				array.push(item);
			}
		});
		array.forEach(item => {
			arraySelected = arraySelected.filter(item2 => item2 !== item);
		});
		arraySelected.push(currentObject);
		return arraySelected;
	}

	replaceAt = (input, replace, start, end) => {
		return input.slice(0, start)
			+ replace
			+ input.slice(end);
	}

	convertArraySelectedTextToHtml = (arraySelectedText, textValue) => {
		arraySelectedText = this.sortByStart(arraySelectedText);
		arraySelectedText.reverse();
		arraySelectedText.forEach(item => {
			textValue = this.replaceAt(textValue, item.newStr, item.indexStart, item.indexEnd);
		});
		return textValue;
	}

	checkIndexBetween = (index, object) => {
		let check = false;
		object.forEach(item => {
			if (index >= item.indexStart && index <= item.indexEnd) {
				check = true;
			}
		});
		return check;
	}

	checkIndexBetweenIgnoreBound = (index, object) => {
		let check = false;
		object.forEach(item => {
			if (index > item.indexStart && index < item.indexEnd - 1) {
				check = true;
			}
		});
		return check;
	}

	getItemBetWeen = (index, object) => {
		let ele = '';
		object.forEach(item => {
			if (index >= item.indexStart && index <= item.indexEnd) {
				ele = item;
			}
		});
		return ele;
	}

	getPosition = (el) => {
		var xPosition = 0;
		var yPosition = 0;
		while (el) {
			if (el.tagName + '' === "BODY") {
				// deal with browser quirks with body/window/document and page scroll
				var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
				var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

				xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
				yPosition += (el.offsetTop - yScrollPos + el.clientTop);
			} else {
				xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
				yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
			}
			el = el.offsetParent;
		}
		return {
			x: xPosition,
			y: yPosition
		};
	}

	render() {
		const {
			xCoords, yCoords,
			selection,
			textValue,
		} = this.state;
		const { intentDetailReducer, entityReducer } = this.props;
		const { listHtml, selectedText, keyOfItem, html, isDisplayDropdown } = intentDetailReducer;
		const { entities } = entityReducer;

		return (
			<div className="newIntent-training">
				<div className="newIntent-training-inputPharse">
					<Icon type="info-circle" className="icon-quote-right" />
					<div style={{ position: 'relative' }}>
						<ContentEditable
							className="newIntent-training-inputPharse-editable"
							html={html} // innerHTML of the editable div
							placeholder={"A"}
							maxLength={400}
						/>
						<ContentEditable
							className="newIntent-training-inputPharse-editable double"
							html={textValue} // innerHTML of the editable div
							onChange={this.handleChange} // handle innerHTML change
							onMouseUp={this.handleOnMouseUp}
							onMouseDown={this.handleOnMouseDown}
							onKeyDown={this.handleOnKeyDown}
							placeholder={"Add user expression"}
							maxLength={400}
							id={`editable0`}
						// disabled={isDisplayDropdown ? true : false}
						/>
					</div>

					<TableParamTraining html={html} deleteEntityInPharse={this.deleteEntityInPharse} keyOfItem={-1} />
				</div>
				{
					listHtml.length ? <List
						bordered
						dataSource={listHtml}
						renderItem={(item, index) => (
							<React.Fragment>
								<List.Item className="newIntent-training-list-pharse">
									<Icon type="info-circle" />
									<div style={{ position: 'relative', width: '100%' }}>
										<ContentEditable
											className="editable"
											html={item.html} // innerHTML of the editable div
											placeholder={"A"}
											maxLength={400}
										/>
										<ContentEditable
											className="editable double"
											html={item.textValue} // innerHTML of the editable div
											placeholder={"Add user expression"}
											onChange={(event) => this.handleChangeItem(event, item.key)} // handle innerHTML change
											onMouseUp={(event) => this.handleOnMouseUpItem(event, item.key)}
											onMouseDown={(event) => this.handleOnMouseDownItem(event, item.key)}
											onKeyDown={(event) => this.handleOnKeyDownItem(event, item.key)}
											id={`editable${index + 1}`}
										/>
									</div>
									<Icon type="delete" className="newIntent-training-list-pharse-delete" onClick={() => this.deletePhrase(item.key)} />
								</List.Item>
								<TableParamTraining html={item.html} deleteEntityInPharse={this.deleteEntityInPharse} keyOfItem={item.key} />
							</React.Fragment>
						)}
					/> : null
				}
				<DropdownEntity
					xCoords={xCoords}
					yCoords={yCoords}
					selection={selection}
					entities={entities}
					addEntity={this.addEntity}
					isDisplay={isDisplayDropdown}
					selectedText={selectedText}
					keyOfItem={keyOfItem}
				/>
			</div >
		);
	}
}

const mapStateToProps = (state) => ({
	intentDetailReducer: state.intentDetailReducer,
	entityReducer: state.entityReducer,
});

const mapDispatchToProps = (dispatch) => ({
	dispatchUpdateTrainingPharse: (training_pharse) => dispatch(updateTrainingPharse(training_pharse)),
	// dispatchUpdateDataNewTraining: (dataNewTrainig) => dispatch(updateDataNewTraining(dataNewTrainig)),
	dispatchUpdateListHtml: (listHtml) => dispatch(updateListHtml(listHtml)),
	dispatchUpdateSelectedText: (selectedText) => dispatch(updateSelectedText(selectedText)),
	dispatchUpdateKeyOfItem: (keyOfItem) => dispatch(updateKeyOfItem(keyOfItem)),
	dispatchUpdateParameter: (array) => dispatch(updateParameter(array)),
	dispatchUpdateHtml: (html) => dispatch(updateHtml(html)),
	dispatchUpdateDataFromPhares: (data) => dispatch(updateDataFromPhares(data)),
	dispatchAddEventClickToSpan: () => dispatch(addEventClickToSpan()),
	dispatchAddEventPasteToDiv: () => dispatch(addEventPasteToDiv()),
	dispatchUpdateRange: (data) => dispatch(updateRange(data)),
	dispatchChangeDisplayDropdown: (data) => dispatch(changeDisplayDropdown(data)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Training);
