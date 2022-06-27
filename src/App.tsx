import React from 'react';
import { Editor } from 'amis-editor';

// value: any 值，amis 的 json 配置。
// onChange: (value: any) => void。 当编辑器修改的时候会触发。
// preview?: boolean 是否为预览状态。
// autoFocus?: boolean 是否自动聚焦第一个可编辑的组件。
// plugins 插件类集合
class App extends React.Component {
  state = {
    jsonData: {}
  }
  constructor(props: any) {
    super(props)
  }
  handleChange(e: any) {
    if (e) {
      console.log("handleChange", JSON.stringify(e));
    }
  }

  render() {
    return (
      <>
        <button>发送JSON文件</button>
        <Editor
          value={JSON.parse(JSON.stringify({}))}
          onChange={this.handleChange}
        />
      </>
    )
  }
}

export default App;
