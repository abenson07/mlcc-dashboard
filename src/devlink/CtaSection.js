"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./CtaSection.module.css";

export function CtaSection({
  as: _Component = _Builtin.Block,
  _06C849C5E0491Fd24B3D41D4A486894A = true,
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "section_cta28", "text-color-white")}
      tag="section"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "padding-global")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "container-large")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "padding-section-large")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "cta28_component")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "text-align-center")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(
                    _styles,
                    "max-width-large",
                    "align-center"
                  )}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "margin-bottom",
                      "margin-small"
                    )}
                    tag="div"
                  >
                    <_Builtin.Heading
                      className={_utils.cx(
                        _styles,
                        "heading-style-h2",
                        "_21char"
                      )}
                      tag="h2"
                    >
                      {"Abetter neighborhood starts with you"}
                    </_Builtin.Heading>
                  </_Builtin.Block>
                  <_Builtin.Paragraph
                    className={_utils.cx(_styles, "text-size-medium")}
                  >
                    {
                      "Sign up to get notified of events and volunteer opportunities"
                    }
                  </_Builtin.Paragraph>
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "margin-top",
                      "margin-medium"
                    )}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(
                        _styles,
                        "button-group",
                        "is-center"
                      )}
                      tag="div"
                    >
                      <_Builtin.Link
                        className={_utils.cx(_styles, "button")}
                        button={true}
                        block=""
                        options={{
                          href: "#",
                        }}
                      >
                        {"Become a supporting member"}
                      </_Builtin.Link>
                      <_Builtin.Link
                        className={_utils.cx(
                          _styles,
                          "button",
                          "is-secondary",
                          "is-alternate"
                        )}
                        button={true}
                        block=""
                        options={{
                          href: "#",
                        }}
                      >
                        {"Volunteer to help"}
                      </_Builtin.Link>
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "cta_prefooter_background-image-wrapper")}
        tag="div"
      />
    </_Component>
  );
}
