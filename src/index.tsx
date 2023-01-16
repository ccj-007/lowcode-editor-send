import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { hot } from 'react-hot-loader/root';
import "amis/sdk/iconfont.css";
import "amis/lib/themes/cxd.css";
import "amis/lib/helper.css";

import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/css/v4-shims.css";

import "../node_modules/amis-editor/dist/style.css";

// ReactDOM.render(<App />, document.getElementById("root"));
hot(App);

const render = (Component: any) => {
  ReactDOM.render(
      <Component />,
    document.getElementById('root'));
}

render(App);

reportWebVitals();