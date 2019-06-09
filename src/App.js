import React from 'react';
import './App.css';
import CardDemo from './Card';
import 'antd/dist/antd.css';
import ContentEditable from './ReactContenteditable';

import CardText from './cardText'
function App() {
  return (
    <div className="App">
      <div className="wrap-content">
        {/* <CardDemo /> */}
        NEW hEADER
        <ContentEditable />
        {/* <CardText /> */}
      </div>
    </div>
  );
}

export default App;
