import fs from "fs";
import path from "path";

export function loadJSON(fileName: string) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

