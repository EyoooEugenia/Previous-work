import { useRef, useEffect, useState } from 'react';

export function TextEditor({ value = '', onChange, placeholder = 'Type text here...' }) {
  const editorRef = useRef(null);

  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value === '' || editorRef.current.innerHTML === '') {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const updateToolbarState = () => {
    try {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
      });
    } catch (e) {
    }
  };

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateToolbarState();
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateToolbarState();
  };

  const preventBlur = (e) => {
    e.preventDefault();
  };

  return (
    <div className="text-block-wrapper">
      <div className="rich-toolbar">
        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => execCmd('bold')}
          className={`toolbar-btn ${activeStates.bold ? 'active' : ''}`}
          title="Bold"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => execCmd('italic')}
          className={`toolbar-btn ${activeStates.italic ? 'active' : ''}`}
          title="Italic"
        >
          <i>I</i>
        </button>

        <div className="toolbar-divider" />

        <select
          className="toolbar-select"
          onChange={(e) => execCmd('fontSize', e.target.value)}
          defaultValue="3"
          title="Font Size"
        >
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="6">Huge</option>
        </select>

        <div className="toolbar-divider" />

        <label className="toolbar-color-btn" onMouseDown={preventBlur} title="Text Color">
          Color
          <input
            type="color"
            onChange={(e) => execCmd('foreColor', e.target.value)}
          />
        </label>

        <label className="toolbar-color-btn" onMouseDown={preventBlur} title="Highlight Color">
          Highlight
          <input
            type="color"
            defaultValue="#fef08a"
            onChange={(e) => execCmd('hiliteColor', e.target.value)}
          />
        </label>

        <div className="toolbar-divider" />

        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => execCmd('justifyLeft')}
          className={`toolbar-btn ${activeStates.justifyLeft ? 'active' : ''}`}
          title="Align Left"
        >
          Left
        </button>

        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => execCmd('justifyCenter')}
          className={`toolbar-btn ${activeStates.justifyCenter ? 'active' : ''}`}
          title="Align Center"
        >
          Center
        </button>

        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => execCmd('justifyRight')}
          className={`toolbar-btn ${activeStates.justifyRight ? 'active' : ''}`}
          title="Align Right"
        >
          Right
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="editor-contenteditable"
        data-placeholder={placeholder}
        onInput={handleInput}
        onSelect={updateToolbarState}
        onClick={updateToolbarState}
        onKeyUp={updateToolbarState}
      />
    </div>
  );
}