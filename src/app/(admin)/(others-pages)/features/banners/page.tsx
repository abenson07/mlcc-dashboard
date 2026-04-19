import BannersManager from "@/components/banners/BannersManager";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Website banners",
  description: "Manage Webflow CMS banners for the public site",
};

export default function WebsiteBannersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Website banners" />
      <BannersManager />
    </div>
  );
}
