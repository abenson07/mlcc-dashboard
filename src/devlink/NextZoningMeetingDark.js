"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NextZoningMeetingDark.module.css";

export function NextZoningMeetingDark({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(_styles, "next-zoningmeeting_card", "dark")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "nextmeetingcard-image")}
        id={_utils.cx(
          _styles,
          "w-node-_649fc2ef-40e4-e5c4-5708-ba8f24901001-24901000"
        )}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-fill", "rounded")}
          width="auto"
          height="auto"
          loading="lazy"
          alt=""
          src="https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/688b7265bdc1dbb6fc1ce130_moviesbythetower.jpg"
        />
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "nextmeetingcard-text")}
        id={_utils.cx(
          _styles,
          "w-node-_649fc2ef-40e4-e5c4-5708-ba8f24901003-24901000"
        )}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "text-size-tiny")}
          tag="div"
        >
          {"Next meeting"}
        </_Builtin.Block>
        <_Builtin.Block tag="div">
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-medium")}
            tag="h5"
          >
            {"September 15th"}
          </_Builtin.Heading>
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-small")}
            tag="h5"
          >
            {"Eagles Nest"}
          </_Builtin.Heading>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
