"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NextZoningMeeting.module.css";

export function NextZoningMeeting({
  as: _Component = _Builtin.Block,
  meetingDate = "This is the default text value",
  meetingLocation = "This is the default text value",
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "next-zoningmeeting_card")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "nextmeetingcard-image")}
        id={_utils.cx(
          _styles,
          "w-node-_916da588-c181-caa4-a4c2-73b4fcd01c9e-fcd01c9d"
        )}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-fill", "rounded")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/688b7265bdc1dbb6fc1ce130_moviesbythetower.jpg"
        />
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "nextmeetingcard-text")}
        id={_utils.cx(
          _styles,
          "w-node-_916da588-c181-caa4-a4c2-73b4fcd01ca0-fcd01c9d"
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
            {meetingDate}
          </_Builtin.Heading>
          <_Builtin.Heading
            className={_utils.cx(_styles, "text-size-small")}
            tag="h5"
          >
            {meetingLocation}
          </_Builtin.Heading>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
