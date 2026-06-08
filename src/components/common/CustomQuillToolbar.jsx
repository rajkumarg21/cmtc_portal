import React from "react";

// Undo/Redo icons
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9" />
  </svg>
);

const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5" />
  </svg>
);

// Toolbar Component
const CustomQuillToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <button className="ql-undo" title="Undo">
        <CustomUndo />
      </button>
      <button className="ql-redo" title="Redo">
        <CustomRedo />
      </button>
    </span>

    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="">Normal</option>
      </select>
      <select className="ql-size" defaultValue="">
        <option value="small">Small</option>
        <option value="">Normal</option>
        <option value="large">Large</option>
        <option value="huge">Huge</option>
      </select>
    </span>

    <span className="ql-formats">
      <button className="ql-bold" title="Bold" />
      <button className="ql-italic" title="Italic" />
      <button className="ql-underline" title="Underline" />
      <button className="ql-strike" title="Strike" />
      <button className="ql-blockquote" title="Blockquote" />
    </span>

    <span className="ql-formats">
      <button className="ql-list" value="ordered" title="Ordered List" />
      <button className="ql-list" value="bullet" title="Bullet List" />
      <button className="ql-indent" value="-1" title="Decrease Indent" />
      <button className="ql-indent" value="+1" title="Increase Indent" />
      <button className="ql-script" value="sub" title="Subscript" />
      <button className="ql-script" value="super" title="Superscript" />
      <button className="ql-direction" title="Text Direction" />
    </span>

    <span className="ql-formats">
      <select className="ql-align" />
      <select className="ql-color" />
      <select className="ql-background" />
      <select className="ql-font" />
    </span>

    <span className="ql-formats">
      <button className="ql-link" title="Link" />
      <button className="ql-image" title="Image" />
      <button className="ql-video" title="Video" />
      <button className="ql-clean" title="Remove Formatting" />
    </span>
  </div>
);

export default CustomQuillToolbar;
