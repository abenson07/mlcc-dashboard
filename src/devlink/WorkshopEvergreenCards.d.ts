import * as React from "react";
import * as Types from "./types";

declare function WorkshopEvergreenCards(props: {
  as?: React.ElementType;
  image?: Types.Asset.Image;
  topic?: React.ReactNode;
  title?: React.ReactNode;
  linkText?: React.ReactNode;
  link?: Types.Basic.Link;
}): React.JSX.Element;
