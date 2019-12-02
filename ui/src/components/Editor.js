import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';

const Editor = ({ readOnly, onChange, value, width, height }) => (
  <AceEditor
    // ref={this.editorRef}
    highlightActiveLine
    focus
    // annotations={getAnnotations(error)
    // markers={getMarkers(error)}
    fontSize={14}
    mode="yaml"
    theme="chrome"
    showPrintMargin={false}
    width={width}
    height={height}
    tabSize={2}
    setOptions={{ showLineNumbers: true }}
    editorProps={{ $blockScrolling: Infinity }}
    readOnly={readOnly}
    value={value}
    onChange={onChange}
    // onLoad={this.handleLoad}
  />
);

export default Editor;
