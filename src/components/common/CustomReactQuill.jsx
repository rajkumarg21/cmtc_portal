import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CustomQuillTooltip.css"; // Custom tooltip styles
import ImageResize from "quill-image-resize-module-react";

// Register image resize module
Quill.register("modules/imageResize", ImageResize);

// HR blot for horizontal line
const BlockEmbed = Quill.import("blots/block/embed");
class Hr extends BlockEmbed { }
Hr.blotName = "hr";
Hr.tagName = "hr";
Quill.register(Hr);

// Custom image blot to preserve width/height styles
const BaseImage = Quill.import("formats/image");
class CustomImage extends BaseImage {
  static formats(domNode) {
    const formats = super.formats(domNode) || {};
    const style = domNode.style;
    if (style.width) formats.width = style.width;
    else if (domNode.hasAttribute('width')) formats.width = domNode.getAttribute('width') + 'px'; // read from attribute

    if (style.height) formats.height = style.height;
    else if (domNode.hasAttribute('height')) formats.height = domNode.getAttribute('height') + 'px';

    if (style.float) formats.float = style.float;
    if (style.display) formats.display = style.display;
    if (style.margin) formats.margin = style.margin;
    if (style.marginLeft) formats.marginLeft = style.marginLeft;
    if (style.marginRight) formats.marginRight = style.marginRight;
    if (style.marginTop) formats.marginTop = style.marginTop;
    if (style.marginBottom) formats.marginBottom = style.marginBottom;

    return formats;
  }

  format(name, value) {
    if (name === "width" && value) {
      this.domNode.setAttribute("width", parseInt(value, 10)); // store as attribute
      this.domNode.style.removeProperty("width");              // clear style
    } else if (name === "height" && value) {
      this.domNode.setAttribute("height", parseInt(value, 10));
      this.domNode.style.removeProperty("height");
    } else if (["float", "display"].includes(name)) {
      if (value) {
        this.domNode.style[name] = value;
      } else {
        this.domNode.style.removeProperty(name);
      }
    } else if (name === "margin" && value === "auto") {
      this.domNode.style.display = "block";
      this.domNode.style.margin = "auto";
    } else {
      super.format(name, value);
    }
  }


}
Quill.register(CustomImage, true);

// Register style attributors
const Parchment = Quill.import("parchment");
const WidthStyle = new Parchment.Attributor.Style("width", "width", { scope: Parchment.Scope.INLINE });
const HeightStyle = new Parchment.Attributor.Style("height", "height", { scope: Parchment.Scope.INLINE });
const FloatStyle = new Parchment.Attributor.Style("float", "float", { scope: Parchment.Scope.INLINE });
const DisplayStyle = new Parchment.Attributor.Style("display", "display", { scope: Parchment.Scope.INLINE });

Quill.register(WidthStyle, true);
Quill.register(HeightStyle, true);
Quill.register(FloatStyle, true);
Quill.register(DisplayStyle, true);



const CustomReactQuill = ({ value, onChange }) => {
  const { t } = useTranslation();

  // Add translated tooltips
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
      ["clean"],
    ],
    clipboard: { matchVisual: false },
    history: { delay: 1000, maxStack: 50, userOnly: true },
    imageResize: { parchment: Quill.import("parchment"), modules: ["Resize", "DisplaySize", "Toolbar"] },
  };

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
