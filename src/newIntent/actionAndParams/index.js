
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { Table, Input, Icon, Tooltip, Checkbox, Dropdown, Menu, Modal, Select } from 'antd';
import { DragSource, DropTarget } from 'react-dnd';
import update from 'immutability-helper';

import { updateParameter, changeInputAction, updateListHtml, } from '../../../actions/intentDetailAction';
import { getAllEntity, } from '../../../actions/entityAction';
import { PREFIX_SYSTEM_ENTITY } from '../../../config/constants';
import ModalPrompts from '../modalPrompts';

import { convertArraySelectedTextToHtml } from '../../../utils/common';
import { checkParamUnique } from '../../../utils/userService';
import { openNotificationWithIcon } from '../../../utils/notifications';
// import sanitizeHtml from "sanitize-html";

const { Column } = Table;
const { TextArea } = Input;
const confirm = Modal.confirm;
const PARAMETER = 'name';
// const ENTITY = 'data_type';
const VALUE = 'value';

let dragingIndex = -1;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow =
  DropTarget('row', rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }))(
    DragSource('row', rowSource, connect => ({
      connectDragSource: connect.dragSource(),
    }))(BodyRow),
  );

class DragSortingTable extends React.Component {

  constructor(props) {
    super(props);
    this.updatePrompt = this.updatePrompt.bind(this);
    this.state = {
      parameters: [],
      components: {
        body: {
          row: DragableBodyRow,
        },
      },
      isFetched: false,
      visibleModalPrompt: true,
      action: '',
      selectedItemEntity: [],
    };
  }

  sanitizeConf = {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "h1"],
    allowedAttributes: { a: ["href"] }
  };

  componentWillReceiveProps(nextProps) {
  }

  componentDidMount() {
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const dragRow = parameters[dragIndex];
    parameters = update(parameters, { $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]] });
    // this.setState(
    //   // update(this.state, {
    //   //   data: {
    //   //     $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    //   //   },
    //   // }),
    //   { parameters: parameters }
    // );
    dispatchUpdateParameter(parameters);
  };

  handleClickRequired = (event) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { value } = event.target;
    const { name, id } = value;
    parameters = parameters.map((item, index) => {
      if (item.id === id) {
        if (item.required === 1) {
          item.required = 2;
        } else {
          item.required = 1;
        }
        if (name !== '' && item.required === 2) {
          item.prompt = 'Define prompts...';
          item.wrong = 'Define wrong prompts...';
        } else {
          item.prompt = '—';
          item.wrong = '—';
        }
        return item;
      } else {
        return item;
      }
    });
    dispatchUpdateParameter(parameters);
  }

  handleClickIsList = (event) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { value } = event.target;
    const { id } = value;
    parameters = parameters.map((item, index) => {
      if (item.id === id) {
        if (item.is_list === 1) {
          item.is_list = 2;
        } else {
          item.is_list = 1;
        }
        return item;
      } else {
        return item;
      }
    });
    dispatchUpdateParameter(parameters);
  }

  handleClickUseFromText = (event) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { value } = event.target;
    const { id } = value;
    parameters = parameters.map((item, index) => {
      if (item.id === id) {
        if (item.use_from_text === 1) {
          item.use_from_text = 2;
        } else {
          item.use_from_text = 1;
        }
        return item;
      } else {
        return item;
      }
    });
    dispatchUpdateParameter(parameters);
  }

  handleAdd = () => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const newData = {
      key: parameters.length,
      id: parameters.length,
      required: 1,
      is_list: 1,
      use_from_text: 1,
      name: '',
      value: '',

      wrong: '—',
      wrong_prompts: [],
      prompt: '—',
      prompts: [],

      entity_id: '',
      optional_entity: [],
      entity_name: '',
      optional_entity_name: [],

      idSpan: [],
    };
    dispatchUpdateParameter([...parameters, newData]);
  };

  handleChangeInput = (event, parameter, dataRow) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { id } = dataRow;
    const { value } = event.target;
    switch (parameter) {
      case 'name':
        parameters = parameters.map((item, index) => {
          if (item.id === id) {
            item.name = value;
            if (value === '') {
              item.prompt = '—';
              item.wrong = '—';
            } else if (value !== '' && item.required === 2) {
              item.prompt = 'Define prompts...';
              item.wrong = 'Define wrong prompts...';
            }
            return item;
          }
          return item;
        });
        dispatchUpdateParameter(parameters);
        break;
      case 'value':
        parameters = parameters.map((item, index) => {
          if (item.id === id) {
            item.value = value;
            return item;
          } else {
            return item;
          }
        });
        dispatchUpdateParameter(parameters);
        break;
      default:
        break;
    }
  }

  menuParam = (record, rowValue) => (
    <Menu className="newIntent-param-dropdown-menu">
      <Menu.Item key="0">
        Default value
      </Menu.Item>
      <Menu.Item key="1" onClick={() => this.deleteParameter(record, rowValue)} >
        Delete
      </Menu.Item>
    </Menu>
  )

  deleteParameter = (record, rowValue) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;

    if (rowValue.keyOfItem !== undefined) {
      // sẽ confirm xem delete hay không 
      // const _this = this;
      // confirm({
      //   title: `Delete parameter`,
      //   content:
      //     `Caution: this parameter is bound to parameters in the ‘Training phrases’ section. 
      //   If you remove it here, it will be removed from all ‘Training phrases’ templates/examples.`,
      //   okText: 'Yes',
      //   okType: 'primary',
      //   cancelText: 'Close',
      //   width: '50%',
      //   className: "newIntent-action-modal-delete",
      //   onOk() {
      //     _this.deleteParameterIncludeEntity(rowValue);
      //     return;
      //   },
      //   onCancel() {
      //     return;
      //   }
      // });

      parameters = parameters.filter(item => item.key !== rowValue.key);
      parameters = parameters.map((item, index) => {
        item.key = index;
        return item;
      });
      dispatchUpdateParameter(parameters);
    } else {
      parameters = parameters.filter(item => item.key !== rowValue.key);
      parameters = parameters.map((item, index) => {
        item.key = index;
        return item;
      });
      dispatchUpdateParameter(parameters);
    }
  }

  isNode = (o) => {
    return (
      typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
  }

  deleteParameterIncludeEntity = async (rowValue) => {
    const { dispatchUpdateListHtml, dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters, listHtml } = intentDetailReducer;
    const { entity_id } = rowValue;
    listHtml = await listHtml.map(item => {
      return {
        ...item,
        arraySelected: item.arraySelected.filter(item2 => item2.entity_id !== entity_id)
      };
    });

    listHtml = listHtml.map(item => {
      return {
        ...item,
        html: convertArraySelectedTextToHtml(item.arraySelected, item.textValue)
      };
    });

    parameters = parameters.filter(item => item.key !== rowValue.key);
    parameters = parameters.map((item, index) => {
      item.key = index;
      return item;
    });

    dispatchUpdateParameter(parameters);
    dispatchUpdateListHtml(listHtml);

  };

  checkListRequired = () => {
    const { intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    let isEmpty = true;
    parameters.forEach((item, index) => {
      if (item.required === 2)
        isEmpty = false;
      return;
    });
    return !isEmpty;
  }

  updatePrompt = (parameterId, prompts) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    parameters = parameters.map((item, index) => {
      if (item.id === parameterId) {
        item.prompts = prompts;
        if (prompts[0].text.length < 10) {
          item.prompt = prompts[0].text + ' ...';
        }
        return item;
      }
      return item;
    });
    dispatchUpdateParameter(parameters);
  }

  showModalPrompts = (index) => {
    const updatePrompt = this.updatePrompt;
    confirm({
      title: `Prompts for ${index.name}`,
      content: <ModalPrompts data={index.prompts} parameterId={index.id} updateModalData={updatePrompt} title="PROMPTS" />,
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'Close',
      width: '50%',
      className: "editIntent-action-modal-prompts",
      onOk() {
        return;
      },
      onCancel() {
        return;
      }
    });
  }

  updateWrongPrompt = (parameterId, wrongPrompts) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    parameters = parameters.map((item, index) => {
      if (item.id === parameterId) {
        item.wrong_prompts = wrongPrompts;
        if (wrongPrompts[0].text.length < 10) {
          item.wrong = wrongPrompts[0].text + ' ...';
        }
        return item;
      }
      return item;
    });
    dispatchUpdateParameter(parameters);
  }

  showModalWrongPrompts = (index) => {
    const updateWrongPrompt = this.updateWrongPrompt;
    confirm({
      title: `Wrong Prompts for ${index.name}`,
      content:
        <ModalPrompts
          data={index.wrong_prompts}
          parameterId={index.id}
          updateModalData={updateWrongPrompt} title="WRONG PROMPTS"
        />,
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'Close',
      width: '50%',
      className: "editIntent-action-modal-prompts",
      onOk() {
        return;
      },
      onCancel() {
        return;
      }
    });
  }

  handleChangeActionName = (e) => {
    const { dispatchChangeInputAction } = this.props;
    const { value } = e.target;
    dispatchChangeInputAction(value);
  }

  onChangeEntity = (value, rowValue) => {
    const { dispatchUpdateParameter, intentDetailReducer, entityReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { entities } = entityReducer;
    const entity_id = entities.find(item => item.name === value)._id;

    parameters = parameters.map(item => {
      if (item.key === rowValue.key) {
        item.entity_name = value;
        item.entity_id = entity_id;
        return item;
      }
      return item;
    });
    dispatchUpdateParameter(parameters);
  }

  onChangeOptionalEntity = (selectItem, rowValue) => {
    const { dispatchUpdateParameter, intentDetailReducer, entityReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const { entities } = entityReducer;
    let optional_entity = [];
    selectItem.forEach(item => {
      let entity = entities.find(function (ele) {
        return ele.name === item;
      });
      let entity_id = entity._id;
      optional_entity.push(entity_id);
    });
    parameters = parameters.map(item => {
      if (item.key === rowValue.key) {
        item.optional_entity_name = selectItem;
        item.optional_entity = optional_entity;
        return item;
      }
      return item;
    });
    dispatchUpdateParameter(parameters);
  }

  checkParamUnique = async (e, index) => {
    const { dispatchUpdateParameter, intentDetailReducer } = this.props;
    let { parameters } = intentDetailReducer;
    const param_name = index.name;
    const entity_id = index.entity_id;
    const param = parameters.find(item => item.key === index.key);
    if (param_name !== "" && entity_id !== "") {
      try {
        let body = {
          param_name: param_name,
          entity_id: entity_id
        };
        const response = await checkParamUnique(body);
        const { data } = response;
        if (data.status === 1) {
          if (data.data.id) {
            let abc = this.convertParamFromApi(param, data.data);
            parameters = parameters.map(item => {
              if (item.key === index.key) {
                item = abc;
                return item;
              }
              return item;
            });
            dispatchUpdateParameter(parameters);
          }
        } else {
          openNotificationWithIcon('error', data.message);
        }
      } catch (error) {
        openNotificationWithIcon('error', error);
      }
    }
  }

  convertParamFromApi = (param, paramFromApi) => {
    let optional_entity = paramFromApi.entity_ids.length > 1 ? paramFromApi.entity_ids.slice(1) : [];
    let optional_entity_name = [];
    const { entities } = this.props.entityReducer;
    if (optional_entity.length > 0) {
      optional_entity.forEach(item => {
        let entity = entities.find(function (element) {
          return element._id === item;
        });
        optional_entity_name.push(entity.name);
      });
    }
    let prompt = '', wrong = '', prompts = [], wrong_prompts = [];
    if (paramFromApi.prompts !== undefined) {
      if (paramFromApi.prompts.length > 0) {
        prompt = paramFromApi.prompts[0].substring(0, 9) + ' ....';
        paramFromApi.prompts.forEach((item, index) => {
          prompts.push({
            key: index + 1,
            text: item
          });
        });
        
      } else {
        prompt = 'Define prompt';
      }
    }
    if (paramFromApi.wrong_prompts !== undefined) {
      if (paramFromApi.wrong_prompts.length > 0) {
        wrong = paramFromApi.wrong_prompts[0].substring(0, 9) + ' ....';
        paramFromApi.wrong_prompts.forEach((item, index) => {
          wrong_prompts.push({
            key: index + 1,
            text: item
          });
        });
      } else {
        wrong = 'Define wrong prompt';
      }
    }
    let data = {
      ...param,
      id: paramFromApi.id,
      is_list: paramFromApi.is_list,
      required: paramFromApi.required,
      use_from_text: paramFromApi.use_from_text ? paramFromApi.use_from_text : 1,
      value: paramFromApi.value ? paramFromApi.value : 1,
      optional_entity: optional_entity,
      optional_entity_name: optional_entity_name,
      prompt: prompt,
      wrong: wrong,
      prompts: prompts,
      wrong_prompts: wrong_prompts,
    };
    return data;
  }

  render() {
    const { components } = this.state;
    const { intentDetailReducer, entityReducer } = this.props;
    let { parameters, action } = intentDetailReducer;
    const { entities } = entityReducer;
    parameters = parameters.map((item, index) => {
      item.key = item.id = index;
      return item;
    });

    return (
      <div className="newIntent-action">
        <TextArea
          className="newIntent-action-input"
          autosize={{ minRows: 1, maxRows: 2 }}
          placeholder="Enter action name"
          value={action}
          onChange={this.handleChangeActionName}
        />
        <Table
          dataSource={parameters}
          pagination={false}
          components={components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
        >
          <Column
            width={115}
            title={(
              <Tooltip title="REQUIRED" text>
                REQUIRED
                <Icon
                  type="question-circle"
                  theme="filled"
                />
              </Tooltip>
            )}
            dataIndex="required"
            render={(record, index) =>
              <Checkbox
                checked={record === 1 ? false : true}
                onChange={this.handleClickRequired}
                value={index} />
            }
          />
          <Column
            title={(
              <Tooltip title="PARAMETER NAME" text>
                PARAMETER NAME
              <Icon
                  type="question-circle"
                  theme="filled"
                />
              </Tooltip>
            )}
            dataIndex='name'
            render={(record, index) => {
              return (<Input
                placeholder="Enter name"
                className="input-none"
                value={record}
                onChange={(e) => this.handleChangeInput(e, PARAMETER, index)}
                // readOnly={index.keyOfItem !== undefined ? true : false}
                onBlur={(e) => this.checkParamUnique(e, index)}
              />);
            }
            }
          />
          <Column
            title={(
              <Tooltip title="ENTITY" text>
                ENTITY
              <Icon
                  type="question-circle"
                  theme="filled"
                />
              </Tooltip>
            )}
            dataIndex='entity_id'
            width='25%'
            render={(record, index) => {
              return (
                // <Select
                //   mode="multiple"
                //   placeholder="Enter entity"
                //   value={this.convertObjectEntityToArrayName(parameters[index.key])}
                //   onDeselect={(selectItem) => this.onDeselectEntity(selectItem, index)}
                //   onSelect={selectItem => this.onSelectEntitiy(selectItem, index)}
                //   // onChange={selectItem => this.handleChangeListEntity(selectItem, index)}
                //   style={{ width: '100%' }}
                //   disabled={index.required === 2 ? false : true}
                // >
                //   {entities.map(item => (
                //     <Select.Option key={item._id} value={item.name} className="newIntent-event-select-dropdown-item">
                //       {item.name}
                //     </Select.Option>
                //   ))}
                // </Select>
                <Select
                  showSearch
                  placeholder="Enter entity"
                  optionFilterProp="children"
                  onChange={(selectItem) => this.onChangeEntity(selectItem, index)}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  value={index.entity_name}
                >
                  {entities.map(item => (
                    <Select.Option key={item._id} value={item.name} className="newIntent-event-select-dropdown-item">
                      {item.type === 1 ? item.name : item.type === 2 ? `@${PREFIX_SYSTEM_ENTITY}${item.name}` : item.name}
                    </Select.Option>
                  ))}
                </Select>
              );
            }}
          />
          <Column
            title={(
              <Tooltip title="OPTIONAL ENTITY" text>
                OPTIONAL ENTITY
              <Icon
                  type="question-circle"
                  theme="filled"
                />
              </Tooltip>
            )}
            dataIndex='id'
            width='25%'
            render={(record, index) => {
              const { entity_id } = index;
              const filterList = entities.filter(item => item.name !== entity_id);
              return (
                <Select
                  mode="multiple"
                  placeholder="Enter entity"
                  onChange={(selectedItems) => this.onChangeOptionalEntity(selectedItems, index)}
                  style={{ width: '100%' }}
                  value={index.optional_entity_name}

                  disabled={index.required === 2 ? false : true}
                >
                  {filterList.map(item => (
                    <Select.Option key={item._id} value={item.name} className="newIntent-event-select-dropdown-item">
                      {item.type === 1 ? item.name : item.type === 2 ? `@${PREFIX_SYSTEM_ENTITY}${item.name}` : item.name}
                    </Select.Option>
                  ))}
                </Select>
              );
            }}
          />
          <Column
            title='VALUE'
            dataIndex='value'
            render={(record, index) =>
              <Input
                placeholder="Enter entity"
                className="input-none"
                value={index.keyOfItem !== undefined ? `{${record}}` : record}
                onChange={(e) => this.handleChangeInput(e, VALUE, index)}
                readOnly={index.keyOfItem !== undefined ? false : false}
              />
            }
          />
          <Column
            title={(
              <Tooltip title="IS LIST" text>
                IS LIST
                <Icon
                  type="question-circle"
                  theme="filled"
                />
              </Tooltip>
            )}
            dataIndex='is_list'
            render={(record, index) =>
              <Checkbox
                checked={record === 1 ? false : true}
                onChange={this.handleClickIsList}
                value={index} />
            }
          />
          {this.checkListRequired() ?
            <Column
              title={(
                <Tooltip title="USE FROM TEXT" text>
                  USE FROM TEXT
                <Icon
                    type="question-circle"
                    theme="filled"
                  />
                </Tooltip>
              )}
              dataIndex='use_from_text'
              render={(record, index) => {
                return (
                  <Checkbox
                    checked={record === 1 ? false : true}
                    onChange={this.handleClickUseFromText}
                    value={index}
                    disabled={index.required === 2 ? false : true}
                  />
                );
              }

              }
            /> : null
          }
          {this.checkListRequired() ?
            <Column
              title={(
                <Tooltip title="WRONG PROMPTS" text>
                  WRONG PROMPTS
                <Icon
                    type="question-circle"
                    theme="filled"
                  />
                </Tooltip>
              )}
              dataIndex='wrong'
              render={
                (record, index) => record === '—'
                  ? (<span className="newIntent-action-prompts">{record}</span>)
                  : (<span
                    className="newIntent-action-prompts-on"
                    onClick={() => this.showModalWrongPrompts(index)}>{record}</span>
                  )
              }
            /> : null
          }
          {this.checkListRequired() ?
            <Column
              title={(
                <Tooltip title="PROMPTS" text>
                  PROMPTS
                <Icon
                    type="question-circle"
                    theme="filled"
                  />
                </Tooltip>
              )}
              dataIndex='prompt'
              render={
                (record, index) => record === '—'
                  ? (<span className="newIntent-action-prompts">{record}</span>)
                  : (<span
                    className="newIntent-action-prompts-on"
                    onClick={() => this.showModalPrompts(index)}>{record}</span>
                  )
              }
            /> : null
          }
          <Column
            width='6%'
            title={''}
            dataIndex='prompts'
            render={
              (record, index) => (
                <Fragment>
                  <Icon type="drag" />
                  <Dropdown
                    overlay={this.menuParam(record, index)}
                    trigger={['click']}
                  >
                    <Icon type="more" />
                  </Dropdown>
                </Fragment>
              )
            }
          />
        </Table>
        <div onClick={this.handleAdd} type="primary" className="newIntent-action-add-param">
          <Icon type="plus" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  intentDetailReducer: state.intentDetailReducer,
  entityReducer: state.entityReducer,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateParameter: (array) => dispatch(updateParameter(array)),
  dispatchChangeInputAction: (name) => dispatch(changeInputAction(name)),
  dispatchGetAllEntity: () => dispatch(getAllEntity()),
  dispatchUpdateListHtml: (listHtml) => dispatch(updateListHtml(listHtml)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragSortingTable);

