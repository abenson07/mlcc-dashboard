"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./MembershipAllocationCard.module.css";

export function MembershipAllocationCard({
  as: _Component = _Builtin.Block,
  whatItGoesTowards = "Activity",
  ofMembershipJustWriteNumber = "20",
  description = "This is where you can put a description of what it covers",
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "membership_allocation_text-wrapper")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "margin-bottom", "margin-xxsmall")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "heading-style-h5")}
          tag="div"
        >
          {whatItGoesTowards}
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "membership-allocation-warpper")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "text-size-small")}
            tag="div"
          >
            {ofMembershipJustWriteNumber}
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "text-size-small")}
            tag="div"
          >
            {"% of membership"}
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Paragraph>{description}</_Builtin.Paragraph>
    </_Component>
  );
}
