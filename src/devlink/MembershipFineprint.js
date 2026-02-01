"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./MembershipFineprint.module.css";

export function MembershipFineprint({
  as: _Component = _Builtin.Block,
  d198A49D7E75A4738B6E2757Ff151Af7 = true,
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "margin-top", "margin-large")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "text-align-center")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "max-width-large", "align-center")}
          tag="div"
        >
          <_Builtin.Paragraph className={_utils.cx(_styles, "text-size-small")}>
            <_Builtin.Strong>{"Other ways to have an impact:"}</_Builtin.Strong>
            {
              " There are lots of ways to support the Maple Leaf community, and we appreciate them all. If you are not in a position to "
            }
            <_Builtin.Link
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"donate"}
            </_Builtin.Link>
            {", you can sign up to "}
            <_Builtin.Link
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"volunteer"}
            </_Builtin.Link>
            {
              ", or enroll in a time-matching sponsorship from your business. Learn more."
            }
          </_Builtin.Paragraph>
          <_Builtin.Block
            className={_utils.cx(_styles, "margin-top", "margin-xsmall")}
            tag="div"
          >
            <_Builtin.Paragraph
              className={_utils.cx(_styles, "text-size-small")}
            >
              {
                "* All memberships are annual and renew after 1 year. If you want to buy a one-off membership, contact us at hello@mapleleafcommunity.org"
              }
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
