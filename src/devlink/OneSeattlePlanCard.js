"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./OneSeattlePlanCard.module.css";

export function OneSeattlePlanCard({
  as: _Component = _Builtin.Block,
  image = "",
  topic = "This is the default text value",
  title = "This is the default text value",

  link = {
    href: "#",
    target: "_blank",
  },
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "plan-card", "tree")}
      id={_utils.cx(
        _styles,
        "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38aa6-38f38aa6"
      )}
      tag="div"
    >
      <_Builtin.Block className={_utils.cx(_styles, "card-title")} tag="div">
        <_Builtin.Block className={_utils.cx(_styles, "sub-label")} tag="div">
          <_Builtin.Block
            className={_utils.cx(_styles, "label-dot")}
            tag="div"
          />
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-tiny", "light")}
            id={_utils.cx(
              _styles,
              "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38aaa-38f38aa6"
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
            "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38aac-38f38aa6"
          )}
          tag="h1"
        >
          {title}
        </_Builtin.Heading>
      </_Builtin.Block>
      <_Builtin.Block className={_utils.cx(_styles, "card-bottom")} tag="div">
        <_Builtin.Block
          className={_utils.cx(_styles, "update-wrapper")}
          id={_utils.cx(
            _styles,
            "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38aaf-38f38aa6"
          )}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-tiny", "light", "faded")}
            id={_utils.cx(
              _styles,
              "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38ab0-38f38aa6"
            )}
            tag="h1"
          >
            {"Last updated"}
          </_Builtin.Heading>
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-tiny", "light")}
            id={_utils.cx(
              _styles,
              "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38ab2-38f38aa6"
            )}
            tag="h1"
          >
            {"September 15, 2025"}
          </_Builtin.Heading>
        </_Builtin.Block>
        <_Builtin.Link
          className={_utils.cx(_styles, "learn-more-arrow-wrapper")}
          id={_utils.cx(
            _styles,
            "w-node-_4cd937a7-9f12-42bb-a318-f59c38f38ab4-38f38aa6"
          )}
          button={false}
          block="inline"
          options={link}
        >
          <_Builtin.HtmlEmbed
            className={_utils.cx(_styles, "learn-more-arrow")}
            value="%3Csvg%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M12.6893%207.25L6.96967%201.53033L8.03033%200.469666L15.5607%208L8.03033%2015.5303L6.96967%2014.4697L12.6893%208.75H0.5V7.25H12.6893Z%22%20fill%3D%22currentColor%22%2F%3E%0A%3C%2Fsvg%3E"
          />
        </_Builtin.Link>
      </_Builtin.Block>
      <_Builtin.Block className={_utils.cx(_styles, "div-block")} tag="div">
        <_Builtin.Block
          className={_utils.cx(_styles, "image-screen")}
          tag="div"
        />
        <_Builtin.Image
          className={_utils.cx(_styles, "plan-card-image")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src={image}
        />
      </_Builtin.Block>
    </_Component>
  );
}
