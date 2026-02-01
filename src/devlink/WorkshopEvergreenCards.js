"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./WorkshopEvergreenCards.module.css";

export function WorkshopEvergreenCards({
  as: _Component = _Builtin.Link,
  image = "",
  topic = "Topic",
  title = "This is the default text value",
  linkText = "This is where it links to",

  link = {
    href: "#",
    target: "_blank",
  },
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "blog-item-card")}
      id={_utils.cx(
        _styles,
        "w-node-c25fb5a1-67e4-8e99-95de-de8726db66e5-26db66e5"
      )}
      button={false}
      block="inline"
      options={link}
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "blog-item-image-wrapper")}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-fill")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src={image}
        />
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "blog-item-contentwrapper")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "margin-bottom")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "card-title")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "sub-label")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "label-dot")}
                tag="div"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "text-size-tiny", "light")}
                id={_utils.cx(
                  _styles,
                  "w-node-c25fb5a1-67e4-8e99-95de-de8726db66ed-26db66e5"
                )}
                tag="h1"
              >
                {topic}
              </_Builtin.Heading>
            </_Builtin.Block>
            <_Builtin.Heading
              className={_utils.cx(_styles, "header-style-h5")}
              id={_utils.cx(
                _styles,
                "w-node-c25fb5a1-67e4-8e99-95de-de8726db66ef-26db66e5"
              )}
              tag="h1"
            >
              {title}
            </_Builtin.Heading>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
