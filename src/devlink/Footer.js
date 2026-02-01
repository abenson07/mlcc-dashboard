"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Footer.module.css";

export function Footer({
  as: _Component = _Builtin.Block,
  e3F19F7428BcC73052B6E52C62E67B4D = true,
  b4835C3A6804B236Fb5C87677872090C = true,
  f2F1C39F1D156Bec712DF1806A655399 = true,
}) {
  return (
    <_Component className={_utils.cx(_styles, "section_footer")} tag="footer">
      <_Builtin.Block
        className={_utils.cx(_styles, "padding-global")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "padding-section-medium")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "footer-grid")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "footer_newsletter_wrapper")}
              id={_utils.cx(
                _styles,
                "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b6d3-dfdc4c0e"
              )}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "text-size-small")}
                tag="div"
              >
                {
                  "Subscribe to learn about our latest news in the neighborhood, updates from the council, and more."
                }
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "margin-top", "margin-small")}
                tag="div"
              >
                <_Builtin.FormWrapper>
                  <_Builtin.FormForm
                    name="wf-form-Footer-Newsletter-Sign-Up"
                    data-name="Footer Newsletter Sign Up"
                    method="get"
                    id="wf-form-Footer-Newsletter-Sign-Up"
                  >
                    <_Builtin.FormTextInput
                      className={_utils.cx(_styles, "footer_form_input")}
                      name="Name"
                      maxLength={256}
                      data-name="Name"
                      placeholder="Your full name*"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      id="Name"
                    />
                    <_Builtin.FormTextInput
                      className={_utils.cx(_styles, "footer_form_input")}
                      name="Email"
                      maxLength={256}
                      data-name="Email"
                      placeholder="Your email*"
                      disabled={false}
                      type="email"
                      required={true}
                      autoFocus={false}
                      id="Email"
                    />
                    <_Builtin.FormTextInput
                      className={_utils.cx(_styles, "footer_form_input")}
                      name="Zip-Code"
                      maxLength={256}
                      data-name="Zip Code"
                      placeholder="Your zip code"
                      disabled={false}
                      type="text"
                      required={true}
                      autoFocus={false}
                      id="Zip-Code"
                    />
                    <_Builtin.FormButton
                      className={_utils.cx(_styles, "button", "is-secondary")}
                      type="submit"
                      value="Sign up for news"
                      data-wait="Please wait..."
                    />
                  </_Builtin.FormForm>
                  <_Builtin.FormSuccessMessage>
                    <_Builtin.Block tag="div">
                      {"Thank you! Your submission has been received!"}
                    </_Builtin.Block>
                  </_Builtin.FormSuccessMessage>
                  <_Builtin.FormErrorMessage>
                    <_Builtin.Block tag="div">
                      {"Oops! Something went wrong while submitting the form."}
                    </_Builtin.Block>
                  </_Builtin.FormErrorMessage>
                </_Builtin.FormWrapper>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "footer_contact-wrapper")}
              id={_utils.cx(
                _styles,
                "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b6e3-dfdc4c0e"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "footer_logo")}
                loading="lazy"
                width="auto"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f5db9022d8739bdc18b08b_mlcc-logo.svg"
              />
              <_Builtin.Block
                className={_utils.cx(_styles, "footer-contact_info-wrapper")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "footer-contact_info-item")}
                  tag="div"
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "icon-embed-xsmall-2")}
                    value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M20%204H4c-1.1%200-1.99.9-1.99%202L2%2018c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2m0%2014H4V8l8%205l8-5zm-8-7L4%206h16z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                  />
                  <_Builtin.Link
                    className={_utils.cx(_styles, "text-size-small")}
                    button={false}
                    block=""
                    options={{
                      href: "mailto:hello@mapleleafcommunity.org?subject=Contact%20from%20Website",
                    }}
                  >
                    {"hello@mapleleafcommunity.org"}
                  </_Builtin.Link>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "footer-contact_info-item")}
                  tag="div"
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "icon-embed-xsmall-4")}
                    value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--ic%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%202c-4.2%200-8%203.22-8%208.2c0%203.18%202.45%206.92%207.34%2011.23c.38.33.95.33%201.33%200C17.55%2017.12%2020%2013.38%2020%2010.2C20%205.22%2016.2%202%2012%202m0%2010c-1.1%200-2-.9-2-2s.9-2%202-2s2%20.9%202%202s-.9%202-2%202%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small")}
                    tag="div"
                  >
                    {"75595 P.O. Box"}
                    <br />
                    {"Seattle, WA 98175"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-size-small", "faded")}
                tag="div"
              >
                {
                  "The Maple Leaf Community Council is a registered 501c3. All funds go towards the operation of the organization and all board members and committee volunteers are non-paid."
                }
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "footer_links-wrapper")}
              id={_utils.cx(
                _styles,
                "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b6f6-dfdc4c0e"
              )}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "footer-testimonial")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-size-small", "faded")}
                  tag="div"
                >
                  {"From your neighbors..."}
                </_Builtin.Block>
                <_Builtin.Heading
                  className={_utils.cx(_styles, "heading-style-h4")}
                  tag="h2"
                >
                  {
                    "“I love having the council active in our neighborhood, it brings us all a little closer together.”"
                  }
                </_Builtin.Heading>
                <_Builtin.Block
                  className={_utils.cx(
                    _styles,
                    "footer-testimonial_attribution"
                  )}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(
                      _styles,
                      "text-size-small",
                      "text-weight-semibold"
                    )}
                    tag="div"
                  >
                    {"Danielle, neighbor"}
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small")}
                    tag="div"
                  >
                    {"Resident of 6 years"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "divider-horizontal")}
                tag="div"
              />
              <_Builtin.Block
                className={_utils.cx(_styles, "footer-links-wrapper")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "footer-links-group_wrapper")}
                  id={_utils.cx(
                    _styles,
                    "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b703-dfdc4c0e"
                  )}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small", "faded")}
                    tag="div"
                  >
                    {"Support"}
                  </_Builtin.Block>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "https://buy.stripe.com/28E00kdTpdo9gN0cJs3sI0D",
                      target: "_blank",
                    }}
                  >
                    {"Donate"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Become a member"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                      target: "_blank",
                    }}
                  >
                    {"Business memberships"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "mailto:treasurer@mapleleafcommunity.org?subject=Event%20Sponsorship",
                    }}
                  >
                    {"Sponsor an event"}
                  </_Builtin.Link>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "footer-links-group_wrapper")}
                  id={_utils.cx(
                    _styles,
                    "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b70e-dfdc4c0e"
                  )}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small", "faded")}
                    tag="div"
                  >
                    {"Events"}
                  </_Builtin.Block>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Summer Social"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Movies by the Tower"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Halloween Parade"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Silent Book Club"}
                  </_Builtin.Link>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "footer-links-group_wrapper")}
                  id={_utils.cx(
                    _styles,
                    "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b719-dfdc4c0e"
                  )}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-size-small", "faded")}
                    tag="div"
                  >
                    {"Get Involved"}
                  </_Builtin.Block>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Join a committee"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Volunteer for an event"}
                  </_Builtin.Link>
                  <_Builtin.Link
                    className={_utils.cx(_styles, "footer-link")}
                    button={false}
                    block=""
                    options={{
                      href: "#",
                    }}
                  >
                    {"Shape the future of zoning"}
                  </_Builtin.Link>
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "footer_sublinks-wrapper")}
              id={_utils.cx(
                _styles,
                "w-node-fabde3a8-6e57-5e0f-8953-bf836d67b72d-dfdc4c0e"
              )}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "footer_social-wrapper")}
                tag="div"
              >
                <_Builtin.Link
                  className={_utils.cx(_styles, "footer_social-link")}
                  button={false}
                  block="inline"
                  options={{
                    href: "https://www.instagram.com/mapleleafcommunitycouncil/?hl=en",
                    target: "_blank",
                  }}
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "icon-embed-xsmall-5")}
                    value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--simple-icons%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M7.03.084c-1.277.06-2.149.264-2.91.563a5.9%205.9%200%200%200-2.124%201.388a5.9%205.9%200%200%200-1.38%202.127C.321%204.926.12%205.8.064%207.076s-.069%201.688-.063%204.947s.021%203.667.083%204.947c.061%201.277.264%202.149.563%202.911c.308.789.72%201.457%201.388%202.123a5.9%205.9%200%200%200%202.129%201.38c.763.295%201.636.496%202.913.552c1.278.056%201.689.069%204.947.063s3.668-.021%204.947-.082c1.28-.06%202.147-.265%202.91-.563a5.9%205.9%200%200%200%202.123-1.388a5.9%205.9%200%200%200%201.38-2.129c.295-.763.496-1.636.551-2.912c.056-1.28.07-1.69.063-4.948c-.006-3.258-.02-3.667-.081-4.947c-.06-1.28-.264-2.148-.564-2.911a5.9%205.9%200%200%200-1.387-2.123a5.9%205.9%200%200%200-2.128-1.38c-.764-.294-1.636-.496-2.914-.55C15.647.009%2015.236-.006%2011.977%200S8.31.021%207.03.084m.14%2021.693c-1.17-.05-1.805-.245-2.228-.408a3.7%203.7%200%200%201-1.382-.895a3.7%203.7%200%200%201-.9-1.378c-.165-.423-.363-1.058-.417-2.228c-.06-1.264-.072-1.644-.08-4.848c-.006-3.204.006-3.583.061-4.848c.05-1.169.246-1.805.408-2.228c.216-.561.477-.96.895-1.382a3.7%203.7%200%200%201%201.379-.9c.423-.165%201.057-.361%202.227-.417c1.265-.06%201.644-.072%204.848-.08c3.203-.006%203.583.006%204.85.062c1.168.05%201.804.244%202.227.408c.56.216.96.475%201.382.895s.681.817.9%201.378c.165.422.362%201.056.417%202.227c.06%201.265.074%201.645.08%204.848c.005%203.203-.006%203.583-.061%204.848c-.051%201.17-.245%201.805-.408%202.23c-.216.56-.477.96-.896%201.38a3.7%203.7%200%200%201-1.378.9c-.422.165-1.058.362-2.226.418c-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44%201.44%200%201%200%201.437-1.442a1.44%201.44%200%200%200-1.437%201.442M5.839%2012.012a6.161%206.161%200%201%200%2012.323-.024a6.162%206.162%200%200%200-12.323.024M8%2012.008A4%204%200%201%201%2012.008%2016A4%204%200%200%201%208%2012.008%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                  />
                </_Builtin.Link>
                <_Builtin.Link
                  className={_utils.cx(_styles, "footer_social-link")}
                  button={false}
                  block="inline"
                  options={{
                    href: "https://www.facebook.com/MapleLeafCC/",
                    target: "_blank",
                  }}
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "icon-embed-xsmall-6")}
                    value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--simple-icons%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M9.101%2023.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085%201.848-5.978%205.858-5.978c.401%200%20.955.042%201.468.103a9%209%200%200%201%201.141.195v3.325a9%209%200%200%200-.653-.036a27%2027%200%200%200-.733-.009c-.707%200-1.259.096-1.675.309a1.7%201.7%200%200%200-.679.622c-.258.42-.374.995-.374%201.752v1.297h3.919l-.386%202.103l-.287%201.564h-3.246v8.245C19.396%2023.238%2024%2018.179%2024%2012.044c0-6.627-5.373-12-12-12s-12%205.373-12%2012c0%205.628%203.874%2010.35%209.101%2011.647%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                  />
                </_Builtin.Link>
                <_Builtin.Link
                  className={_utils.cx(_styles, "footer_social-link")}
                  button={false}
                  block="inline"
                  options={{
                    href: "https://us.nextdoor.com/pages/maple-leaf-community-council-seattle-wa/",
                    target: "_blank",
                  }}
                >
                  <_Builtin.HtmlEmbed
                    className={_utils.cx(_styles, "icon-embed-medium")}
                    value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20aria-hidden%3D%22true%22%20role%3D%22img%22%20class%3D%22iconify%20iconify--simple-icons%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M14.65%209.997a.07.07%200%200%200-.07.069v1.415c-.123-.177-.42-.37-.805-.37c-.745%200-1.316.659-1.316%201.445c0%20.787.571%201.447%201.316%201.447c.386%200%20.682-.194.806-.372v.221c0%20.05.04.09.09.09h.607a.07.07%200%200%200%20.07-.07v-3.806a.07.07%200%200%200-.07-.069zm-3.913.404a.07.07%200%200%200-.069.07c0%20.779.064.7-.504.7a.09.09%200%200%200-.09.09v.486c0%20.05.04.089.09.089h.504v1.136c0%20.676.476%201.003%201.07%201.003c.183%200%20.32-.017.434-.046a.07.07%200%200%200%20.052-.067v-.526a.07.07%200%200%200-.086-.066a1%201%200%200%201-.227.023c-.33%200-.476-.133-.476-.47v-.987h.608a.07.07%200%200%200%20.07-.069v-.527a.07.07%200%200%200-.07-.069h-.608v-.701a.07.07%200%200%200-.069-.07zm-8.396.676c-.516%200-.955.236-1.201.598c-.02.03-.055.095-.102.095c-.226.002-.24-.276-.247-.524a.07.07%200%200%200-.069-.066l-.653-.004a.07.07%200%200%200-.069.07c.014.606.126%201.018.86%201.181c.04.01.068.045.068.087v1.36c0%20.037.03.068.069.068h.634a.07.07%200%200%200%20.069-.07V12.47c0-.312.221-.667.64-.667c.4%200%20.642.355.642.667v1.404c0%20.038.03.069.069.069h.634a.07.07%200%200%200%20.069-.07v-1.508c0-.72-.616-1.287-1.413-1.287zm3.207.033c-.851%200-1.472.626-1.472%201.446c0%20.876.65%201.431%201.483%201.447c.655.012%201.09-.363%201.194-.494a.07.07%200%200%200-.015-.097l-.435-.34c-.047-.047-.084-.021-.112.001c-.07.057-.203.22-.626.237c-.37.015-.7-.205-.745-.576h2.03a.07.07%200%200%200%20.069-.065c.006-.082.006-.142.006-.196c0-.897-.644-1.363-1.377-1.363m11.652%200c-.812%200-1.472.637-1.472%201.446c0%20.81.66%201.447%201.472%201.447s1.472-.638%201.472-1.447s-.66-1.446-1.472-1.446m3.229%200c-.812%200-1.472.637-1.472%201.446c0%20.81.66%201.447%201.472%201.447s1.472-.638%201.472-1.447s-.66-1.446-1.472-1.446m3.314.028a.745.745%200%200%200-.695.476v-.374a.07.07%200%200%200-.069-.069h-.628a.07.07%200%200%200-.07.07v2.632a.07.07%200%200%200%20.07.069h.628a.07.07%200%200%200%20.07-.07v-1.255c0-.454.24-.737.604-.737c.092%200%20.175.013.26.035A.07.07%200%200%200%2024%2011.85v-.624a.07.07%200%200%200-.056-.068a1%201%200%200%200-.201-.02m-16.666.033a.069.069%200%200%200-.058.108l.88%201.305L7%2013.832a.07.07%200%200%200%20.056.11h.745a.07.07%200%200%200%20.056-.03l.564-.79l.563.79a.07.07%200%200%200%20.056.03h.74a.069.069%200%200%200%20.057-.11l-.899-1.248l.88-1.305a.069.069%200%200%200-.058-.108h-.738a.07.07%200%200%200-.058.03l-.548.818l-.549-.817a.07.07%200%200%200-.057-.03zm-1.552.565c.286%200%20.566.155.633.482h-1.31c.073-.338.392-.482.677-.482m8.412.067c.42%200%20.705.321.705.753c0%20.433-.285.754-.705.754s-.705-.321-.705-.754c0-.432.285-.753.705-.753m3.263.016c.403%200%20.694.31.694.737s-.291.737-.694.737s-.7-.31-.7-.737c0-.426.297-.737.7-.737m3.229%200c.403%200%20.694.31.694.737s-.291.737-.694.737s-.7-.31-.7-.737c0-.426.297-.737.7-.737%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                  />
                </_Builtin.Link>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "footer_copyright-wrapper")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-size-small", "faded")}
                  tag="div"
                >
                  {"© 2025 Maple Leaf Community Council. All rights reserved."}
                </_Builtin.Block>
                <_Builtin.Link
                  className={_utils.cx(_styles, "text-size-tiny")}
                  button={false}
                  block=""
                  options={{
                    href: "#",
                  }}
                >
                  {"Made by MWO"}
                </_Builtin.Link>
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
