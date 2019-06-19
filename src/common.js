import { getListAgent } from './userService';
import React from 'react';
import history from '../utils/history';
import { PATH_PAGE } from "../config/constants";
import { openNotificationWithIcon } from "./notifications";
import { Icon } from "antd";

let timeout;
let countcheckAuthent = 0;

export const checkLocalStorage = (storage) => {
  const dataLocalStorage = localStorage.getItem(storage);
  return dataLocalStorage !== null && dataLocalStorage !== undefined && dataLocalStorage !== '';
};

export const checkCurrentAgent = async () => {
  const listAgent = await getListAgent();
  if (listAgent.data.status === 1) {
    if (listAgent.data.data) {
      const currentAgent = localStorage.getItem('currentAgent');
      if (currentAgent === null || currentAgent === undefined) {
        localStorage.setItem('currentAgent', listAgent.data.data[0] ? listAgent.data.data[0]._id : '');
        return true;
      }
    } else {
      return false;
    }
  }
};

export const checkIntentExistParamRequire = (intents, listIntent, intentExist) => {
  let exist = false;
  intents.map(intent => {
    if (listIntent.indexOf(intent._id) !== -1) {
      if (intent._id !== intentExist) {
        if (intent.parameters) {
          intent.parameters.map(param => {
            if (param.required === 2) {
              exist = intent._id;
            }
            return false;
          });
        }
      }
    }
    return false;
  });
  return exist;
};
export const convertHtmlToTrainingPharse = (listHtml) => {
  const training_phrase = [];
  listHtml.forEach(item => {
    let data = convertHtmlToData(item);
    training_phrase.push({
      data: data
    });
  });
  return training_phrase;
};

export const getNewDataTraining = (childList) => {
  let newData = [];
  let data = {};
  let alias = '', entity_id = '', user_defined = "1";

  childList.forEach(
    function (currentValue, currentIndex) {
      switch (currentValue.nodeType) {
        case 1:
          for (let item of currentValue.attributes) {
            switch (item.name) {
              case "selection-user-defined":
                user_defined = item.value;
                break;
              case "selection-alias":
                alias = item.value;
                break;
              case "selection-entity-id":
                entity_id = item.value;
                break;
              default:
                break;
            }
          }
          data = {
            text: currentValue.textContent,
            alias: alias,
            user_defined: user_defined,
            entity_id: entity_id,
          };
          break;
        case 3:
          data = {
            text: currentValue.textContent,
          };
          break;
        default:
          break;
      }
      newData = [...newData, data];
    },
    'myThisArg'
  );

  return newData;
};

export const convertHtmlToData = (html) => {
  let div = document.createElement('div');
  div.innerHTML = html;
  const childList = div.childNodes;
  const data = getNewDataTraining(childList);
  return data;
};

export const convertErrorMessage = (data) => {
  const errorArr = Object.values(data);
  return (
    <div>
      {errorArr.map((item, index) => <p key={index}>{item}</p>)}
    </div>
  );
};

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const convertArraySelectedTextToHtml = (arraySelectedText, textValue) => {
  arraySelectedText = sortByStart(arraySelectedText);
  arraySelectedText.reverse();
  arraySelectedText.forEach(item => {
    textValue = replaceAt(textValue, item.newStr, item.indexStart, item.indexEnd);
  });
  return textValue;
};

export const sortByStart = (array) => {
  return array.sort((a, b) => (a.indexStart > b.indexStart) ? 1 : ((b.indexStart > a.indexStart) ? -1 : 0));
};

export const replaceAt = (input, replace, start, end) => {
  return input.slice(0, start)
    + replace
    + input.slice(end);
};

export const findEntityOnTrainingPhrase = (entities, textValue) => {
  var entitiesMap = {};

  // index entities
  for (let i = 0; i < entities.length; i++) {
    for (let k = 0; k < entities[i]['content'].length; k++) {
      if (!entitiesMap[entities[i]['content'][k]['name']]) {
        entitiesMap[entities[i]['content'][k]['name']] = {
          "_id": entities[i]['_id'],
          "name": entities[i]['name'],
          "type": entities[i]['type'],
        };
      }
      for (let j = 0; j < entities[i]['content'][k]['same_value'].length; j++) {
        if (!entitiesMap[entities[i]['content'][k]['same_value'][j]]) {
          entitiesMap[entities[i]['content'][k]['same_value'][j]] = {
            "_id": entities[i]['_id'],
            "name": entities[i]['name'],
            "type": entities[i]['type'],
          };
        }
      }
    }
  }

  // TODO process input
  textValue = textValue.trim().replace(/\s+/g, ' ');

  var entityMark = new Array(textValue.length);
  var entityCount = 1;
  var entityFound = {};

  for (let key in entitiesMap) {
    let start = textValue.indexOf(key);
    while (parseInt(start, 10) !== -1 && !(entityMark[start] || entityMark[start + key.length - 1])) {
      for (let i = start; i < start + key.length; i++) {
        entityMark[i] = entityCount;
      }
      entityFound[entityCount++] = entitiesMap[key];
      start = textValue.indexOf(key, start + 1);
    }
  }

  var result = [];
  var start = 0, end = 1;
  while (start < textValue.length) {
    if (parseInt(end, 10) === textValue.length || entityMark[end] !== entityMark[start]) {
      let preparedData = {
        "text": textValue.slice(start, end),
      };
      if (entityMark[start]) {
        preparedData['alias'] = entityFound[entityMark[start]]['name'];
        preparedData['entity_id'] = entityFound[entityMark[start]]['_id'];
        preparedData['user_defined'] = 2;
        preparedData['color'] = entityFound[entityMark[start]]['color'];
        preparedData['meta'] = entityFound[entityMark[start]]['name'];
      }
      result.push(preparedData);
      start = end;
    }
    end++;
  }

  console.log(result);
};

export const debounce = (func, wait, immediate) => {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    if (immediate && !timeout) func.apply(this, [...args]);
  };
};

export const checkTokenUser = (resultDate) => {
  if (countcheckAuthent === 0) {
    countcheckAuthent++;
    setTimeout(() => {
      countcheckAuthent = 0;
    }, 5000);
    if (resultDate.data.optional && resultDate.data.optional.code === 999) {
      openNotificationWithIcon('open', 'User Error', resultDate.data.message,
        <Icon type="close-circle" style={{ color: '#f5222d' }} />
      );
      localStorage.clear();
      sessionStorage.clear();
      history.push(PATH_PAGE.LOGIN);
      return false;
    }

  }

  return true;
};

export const convertPhraseToHtml = (phrases, entities, idSpan, keyOfItem) => {
  var result = {
    html: '',
    textValue: '',
    arraySelected: [],
  };
  var data = phrases.phrases;
  var lastCuttingIndex = 0;
  for (let indexToken = 0; indexToken < data.length; indexToken++) {
    let token = data[indexToken];
    let entity = entities.find(item => item._id === token.entity_id);//check entity exist after delete
    result.textValue += token.text;
    if ((token.entity_id !== undefined || token.entity_id) && entity !== undefined) {
      let color = entity.color;
      let newStr =
        `<span class="selection" id="selection${idSpan}" contenteditable="false" keyofitem="${keyOfItem}" style="background:${color}" selection-user-defined="2" selection-alias="${token.alias}" selection-meta="${token.alias}" selection-entity-id="${token.entity_id}" key="${idSpan}" selection-bg="${color}">${token.text.trim()}</span>`;
      result.arraySelected.push({
        indexStart: lastCuttingIndex,
        indexEnd: lastCuttingIndex + token.text.trim().length,
        selection: token.text.trim(),
        key: idSpan,
        alias: token.alias,
        meta: token.alias,
        entity_id: token.entity_id,
        keyOfItem: keyOfItem,
        color: color,
        newStr: newStr
        //thiếu keyOfitem,  newStr
      });
      idSpan++;
    }
    lastCuttingIndex += token.text.length;
  }

  return {
    idSpan: idSpan,
    phrases: result
  };
};

export const convertParamUniqueFromApi = (param, paramFromApi, entities) => {
  let optional_entity = paramFromApi.entity_ids.length > 1 ? paramFromApi.entity_ids.slice(1) : [];
  let optional_entity_name = [];

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
};

export const convertParamFromApi = (paramFromApi, entities) => {
  // check entity exist after delete
  // let entity_ids = paramFromApi.entity_ids;
  // if (entity_ids.length > 0) {
  //   entity_ids = entity_ids.filter(item => entities.findIndex(entity => entity === item) === -1 ? true : false);
  // }

  let optional_entity = paramFromApi.entity_ids.length > 1 ? paramFromApi.entity_ids.slice(1) : [];
  let optional_entity_name = [];

  if (optional_entity.length > 0) {
    optional_entity.forEach(item => {
      let entity = entities.find(function (element) {
        return element._id === item;
      });
      optional_entity_name.push(entity.name);
    });
  }

  let entity_id = paramFromApi.entity_ids.length > 0 ? paramFromApi.entity_ids[0] : '';
  let entity_name = "";
  if (entity_id !== '') {
    entity_name = entities.find(item => item._id === entity_id).name;
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
    key: paramFromApi.id,
    id: paramFromApi.id,
    name: paramFromApi.name,
    is_list: paramFromApi.is_list,
    required: paramFromApi.required,
    use_from_text: paramFromApi.use_from_text,
    value: paramFromApi.value,
    entity_id: entity_id,
    entity_name: entity_name,
    optional_entity: optional_entity,
    optional_entity_name: optional_entity_name,
    prompt: prompt,
    wrong: wrong,
    prompts: prompts,
    wrong_prompts: wrong_prompts,
    idSpan: [],
  };
  return data;
};

export const checkIntentExist = (intents, step) => {
  let result = false;
  intents.map(intent => {
    if (step.intent_ids.indexOf(intent._id) !== -1) {
      result = true;
    }
  });
  return result;
};

export const generateUuid = () => {
  const a = () => {
    return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
  };
  return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a();
};

export const activeMenu = (pathPage) => {
  pathPage = pathPage.includes('editEntity') || pathPage.includes('editAgent') || pathPage.includes('story/edit') ||
  pathPage.includes('intents') ? pathPage.split('/') : pathPage;
  if(typeof pathPage === 'object') {
    pathPage.pop();
    pathPage = pathPage.join('/');
  }
  switch (pathPage) {
    case PATH_PAGE.INTENTS:
    case PATH_PAGE.NEW_INTENT:
    case PATH_PAGE.EDIT_INTENT: return 2;
    case PATH_PAGE.EDIT_ENTITY:
    case PATH_PAGE.ENTITIES:
    case PATH_PAGE.UPLOAD_ENTITY:
    case PATH_PAGE.NEW_ENTITY: return 3;
    case PATH_PAGE.STORY:
    case PATH_PAGE.STORY_RESOLVE:
    case PATH_PAGE.STORY_EDIT:
    case PATH_PAGE.STORY_CREATE: return 15;
    case PATH_PAGE.FULFILLMENT: return 5;
    case PATH_PAGE.TRAINING:
    case PATH_PAGE.TRAINING_UPLOAD: return 7;
    case PATH_PAGE.HISTORY: return 9;
    case PATH_PAGE.SMALL_TALK: return 13;
    case PATH_PAGE.ACCOUNT: return 14;
  }
};
