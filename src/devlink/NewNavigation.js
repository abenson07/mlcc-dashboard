"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./NewNavigation.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-750":{"id":"e-750","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b890722d-2701-ede1-59bd-13a614ffe91b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b890722d-2701-ede1-59bd-13a614ffe91b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-751":{"id":"e-751","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"b890722d-2701-ede1-59bd-13a614ffe91b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"b890722d-2701-ede1-59bd-13a614ffe91b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-756":{"id":"e-756","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s1_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s1_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-757":{"id":"e-757","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s1_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s1_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-762":{"id":"e-762","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s2_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s2_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-763":{"id":"e-763","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s2_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s2_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-768":{"id":"e-768","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s3_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s3_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-769":{"id":"e-769","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s3_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s3_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-774":{"id":"e-774","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s4_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s4_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-775":{"id":"e-775","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s4_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s4_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-780":{"id":"e-780","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s5_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s5_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-781":{"id":"e-781","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s5_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s5_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-786":{"id":"e-786","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s6_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s6_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-787":{"id":"e-787","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s6_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s6_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-792":{"id":"e-792","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s7_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s7_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-793":{"id":"e-793","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s7_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s7_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-798":{"id":"e-798","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s8_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s8_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-799":{"id":"e-799","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"6540ac58fa7ea7efe56967ef|s8_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"6540ac58fa7ea7efe56967ef|s8_ee2ece63-4833-e1ba-a379-d906d496c2ae","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-804":{"id":"e-804","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-12","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2065"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"25a06ed8-6149-4c18-788b-d146f52ea066","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"25a06ed8-6149-4c18-788b-d146f52ea066","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744651},"e-805":{"id":"e-805","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-13","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-2005"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"25a06ed8-6149-4c18-788b-d146f52ea066","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"25a06ed8-6149-4c18-788b-d146f52ea066","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1626238744652},"e-806":{"id":"e-806","name":"","animationType":"preset","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-20","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-807"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"f2a6ac94-9f06-cd87-25ae-061b572ef95b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"f2a6ac94-9f06-cd87-25ae-061b572ef95b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1749436498996},"e-807":{"id":"e-807","name":"","animationType":"preset","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-21","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-806"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"f2a6ac94-9f06-cd87-25ae-061b572ef95b","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"f2a6ac94-9f06-cd87-25ae-061b572ef95b","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1749436498996}},"actionLists":{"a-12":{"id":"a-12","title":"Navbar 3 menu [Open]","actionItemGroups":[{"actionItems":[{"id":"a-12-n","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":0,"unit":""}}]},{"actionItems":[{"id":"a-12-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":"block"}},{"id":"a-12-n-3","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":1,"unit":""}}]}],"useFirstGroupAsInitialState":true,"createdOn":1626238752650},"a-13":{"id":"a-13","title":"Navbar 3 menu [Close]","actionItemGroups":[{"actionItems":[{"id":"a-13-n","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":0,"unit":""}}]},{"actionItems":[{"id":"a-13-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626238752650},"a-20":{"id":"a-20","title":"Navbar 3 menu [Open] 2","actionItemGroups":[{"actionItems":[{"id":"a-20-n","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":200,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":0,"unit":""}}]},{"actionItems":[{"id":"a-20-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":"block"}},{"id":"a-20-n-3","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":1,"unit":""}}]}],"useFirstGroupAsInitialState":true,"createdOn":1626238752650},"a-21":{"id":"a-21","title":"Navbar 3 menu [Close] 2","actionItemGroups":[{"actionItems":[{"id":"a-21-n","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"ease","duration":400,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":0,"unit":""}}]},{"actionItems":[{"id":"a-21-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".navbar3_menu-background","selectorGuids":["2523293a-956e-7b4e-3631-797cbd781672"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626238752650}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function NewNavigation({
  as: _Component = _Builtin.Block,
  image = "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/684642f8153a9f3137bc5066_logo-white.svg",
  _395D79B6B2E1712554F1F82426E73880 = true,
  e00B2B75Bba1Ea0503Ec04B568Bc598F = true,
  _0Bfd48C3E4C93C22925FCb5Dd9F217B3 = true,
}) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component className={_utils.cx(_styles, "section_hero-nav")} tag="div">
      <_Builtin.Block
        className={_utils.cx(_styles, "hero-banner-container")}
        tag="div"
      >
        <_Builtin.NotSupported _atom="DynamoWrapper" />
      </_Builtin.Block>
      <_Builtin.NavbarWrapper
        className={_utils.cx(_styles, "navigation2")}
        data-w-id="25a06ed8-6149-4c18-788b-d146f52ea066"
        tag="div"
        data-collapse="medium"
        data-animation="over-left"
        data-duration="400"
        fs-scrolldisable-element="smart-nav"
        config={{
          collapse: "medium",
          easing: "ease",
          easing2: "ease",
          duration: 400,
          docHeight: false,
          noScroll: false,
          animation: "default",
        }}
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "navbar3_container")}
          tag="div"
        >
          <_Builtin.NavbarButton
            className={_utils.cx(_styles, "navbar3_menu-button")}
            id={_utils.cx(
              _styles,
              "w-node-_25a06ed8-6149-4c18-788b-d146f52ea068-f52ea062"
            )}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "menu-icon3")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon3_line-top")}
                tag="div"
              />
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon3_line-middle")}
                tag="div"
              />
              <_Builtin.Block
                className={_utils.cx(_styles, "menu-icon3_line-bottom")}
                tag="div"
              />
            </_Builtin.Block>
          </_Builtin.NavbarButton>
          <_Builtin.NavbarMenu
            className={_utils.cx(_styles, "nav2_menu")}
            tag="nav"
            role="navigation"
          >
            <_Builtin.NavbarBrand
              className={_utils.cx(_styles, "navbar3_logo-link-menu")}
              options={{
                href: "#",
              }}
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "nav2_logo")}
                width="auto"
                height="auto"
                loading="eager"
                alt=""
                src="https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f5db9022d8739bdc18b08b_mlcc-logo.svg"
              />
            </_Builtin.NavbarBrand>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "light")}
              options={{
                href: "#",
              }}
            >
              {"Events"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "light")}
              options={{
                href: "#",
              }}
            >
              {"Committees"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "light")}
              options={{
                href: "#",
              }}
            >
              {"Leaflet"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "light")}
              options={{
                href: "#",
              }}
            >
              {"Zoning Workshops"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "hide")}
              options={{
                href: "#",
              }}
            >
              {"Leaflet"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "navigation-link", "hide")}
              options={{
                href: "#",
              }}
            >
              {"ZoningWorkshops"}
            </_Builtin.NavbarLink>
            <_Builtin.Link
              className={_utils.cx(_styles, "navbar3_tablet-menu-button")}
              button={true}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Membership"}
            </_Builtin.Link>
          </_Builtin.NavbarMenu>
          <_Builtin.NavbarBrand
            className={_utils.cx(_styles, "navbar3_logo-link")}
            id={_utils.cx(
              _styles,
              "w-node-_25a06ed8-6149-4c18-788b-d146f52ea07a-f52ea062"
            )}
            options={{
              href: "#",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "nav2_logo")}
              width="auto"
              height="auto"
              loading="lazy"
              alt=""
              src={image}
            />
          </_Builtin.NavbarBrand>
          <_Builtin.Block
            className={_utils.cx(_styles, "button-group", "hide-tablet")}
            id={_utils.cx(
              _styles,
              "w-node-_25a06ed8-6149-4c18-788b-d146f52ea07c-f52ea062"
            )}
            tag="div"
          >
            <_Builtin.Link
              className={_utils.cx(
                _styles,
                "button",
                "is-navbar3-button",
                "autumn"
              )}
              id={_utils.cx(
                _styles,
                "w-node-_25a06ed8-6149-4c18-788b-d146f52ea07d-f52ea062"
              )}
              button={true}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Membership"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "button", "is-navbar3-button")}
              id={_utils.cx(
                _styles,
                "w-node-_25a06ed8-6149-4c18-788b-d146f52ea07f-f52ea062"
              )}
              button={true}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Get Involved"}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "navbar3_menu-background")}
            tag="div"
          />
        </_Builtin.Block>
      </_Builtin.NavbarWrapper>
    </_Component>
  );
}
