import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import "./CustomQuillTooltip.css";

import Quill from "quill";

// ---------------------------------------------------------
// 1. Register HR Blot (compatible with Quill 2)
// ---------------------------------------------------------
const BlockEmbed = Quill.import("blots/block/embed");
class Hr extends BlockEmbed {}
Hr.blotName = "hr";
Hr.tagName = "hr";
Quill.register(Hr);

// ---------------------------------------------------------
// 2. Custom Image Blot (safe in Quill 2)
// ---------------------------------------------------------
const BaseImage = Quill.import("formats/image");
class CustomImage extends BaseImage {
  static formats(domNode) {
    const formats = super.formats(domNode) || {};
    const style = domNode.style;

    if (style.width) formats.width = style.width;
    if (style.height) formats.height = style.height;
    if (style.float) formats.float = style.float;
    if (style.display) formats.display = style.display;
    if (style.margin) formats.margin = style.margin;

    return formats;
  }

  format(name, value) {
    if (name === "width" && value) {
      this.domNode.style.width = value;
      return;
    }
    if (name === "height" && value) {
      this.domNode.style.height = value;
      return;
    }
    if (["float", "display", "margin"].includes(name)) {
      this.domNode.style[name] = value || "";
      return;
    }

    super.format(name, value);
  }
}
Quill.register("formats/image", CustomImage);

// ---------------------------------------------------------
// 3. Use Quill 2 Native Resize Module (no external plugin)
// ---------------------------------------------------------
const modules = {
  toolbar: [
    [{ font: [] }, { size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }, { align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"]
  ],

  clipboard: { matchVisual: false },
  history: { delay: 1000, maxStack: 50, userOnly: true },

  // Fully Quill-2-native resize module
  resize: {
    locale: {}
  }
};

// ---------------------------------------------------------
// 4. Formats Array
// ---------------------------------------------------------
const formats = [
  "font",
  "size",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "align",
  "direction",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
  "hr",
  "width",
  "height",
  "float",
  "display",
  "margin"
];

// ---------------------------------------------------------
// 5. Component
// ---------------------------------------------------------
const CustomReactQuill = ({ value, onChange }) => {
  const { t } = useTranslation();

  // Multilingual tooltips (your existing behavior)
  useEffect(() => {
    const tooltipsMap = {
      "ql-bold": t("quill.bold"),
      "ql-italic": t("quill.italic"),
      "ql-underline": t("quill.underline"),
      "ql-strike": t("quill.strike"),
      "ql-link": t("quill.link"),
      "ql-image": t("quill.image"),
      "ql-video": t("quill.video"),
      "ql-clean": t("quill.clean"),
      "ql-list": t("quill.orderedList"),
      "ql-list.ql-bullet": t("quill.bulletList"),
      "ql-indent.ql--1": t("quill.decreaseIndent"),
      "ql-indent.ql-1": t("quill.increaseIndent"),
      "ql-script.ql-sub": t("quill.subscript"),
      "ql-script.ql-super": t("quill.superscript"),
      "ql-direction": t("quill.textDirection"),
      "ql-align": t("quill.textAlign"),
      "ql-header": t("quill.header"),
      "ql-color": t("quill.textColor"),
      "ql-background": t("quill.backgroundColor"),
      "ql-font": t("quill.font"),
      "ql-size": t("quill.fontSize"),
      "ql-blockquote": t("quill.blockquote"),
      "ql-code-block": t("quill.codeBlock"),
      "ql-hr": t("quill.horizontalLine"),
    };

    const toolbarButtons = document.querySelectorAll(".ql-toolbar button, .ql-toolbar .ql-picker");
    toolbarButtons.forEach((btn) => {
      Object.keys(tooltipsMap).forEach((cls) => {
        if (btn.classList.contains(cls.replace(/\./g, " "))) {
          btn.dataset.tooltip = tooltipsMap[cls];
        }
      });
    });
  }, [t]);

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      className="bg-white rounded-md shadow-sm"
      modules={modules}
      formats={formats}
    />
  );
};

export default CustomReactQuill;
