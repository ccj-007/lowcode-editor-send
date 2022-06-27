import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '/node_modules/amis-editor/dist/style.css'
import '/node_modules/amis/sdk/iconfont.css'
import '/node_modules/amis/lib/themes/default.css'

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
