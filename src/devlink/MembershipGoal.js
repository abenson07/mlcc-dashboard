"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./MembershipGoal.module.css";

export function MembershipGoal({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(_styles, "margin-top", "margin-xsmall")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "goal-progress-wrapper", "center")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "goal-progress-fill")}
          tag="div"
        />
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "margin-top", "margin-xxsmall")}
        tag="div"
      >
        <_Builtin.Paragraph className={_utils.cx(_styles, "text-size-tiny")}>
          {
            "Our goal: Represent at least 80% of our neighborhood (3195 members)"
          }
        </_Builtin.Paragraph>
      </_Builtin.Block>
    </_Component>
  );
}
