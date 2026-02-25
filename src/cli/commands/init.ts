import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as out from "../output.js";

const TEMPLATE = {
  defaults: {
    model: "gemini-3-pro-image-preview",
    outputDir: "./generated-images",
    aspectRatio: "1:1",
  },
};

export function runInit(): void {
  const filePath = resolve(".imgxrc");

  if (existsSync(filePath)) {
    out.fail(".imgxrc already exists in current directory");
  }

  writeFileSync(filePath, JSON.stringify(TEMPLATE, null, 2) + "\n", "utf-8");
  out.success({ created: filePath });
}
