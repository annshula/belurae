"use client";

import { useEffect } from "react";

import { captureAttribution } from "@/lib/attribution";

/** Stores the landing URL's UTM params so checkout can forward them to Shopify. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
