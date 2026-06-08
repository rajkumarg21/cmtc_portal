import fs from "fs";
import { execSync } from "child_process";

// 1. Read template
let envTemplate = fs.readFileSync(".env.template", "utf8");

// 2. Generate build values
const buildNumber = new Date()
  .toISOString()
  .replace(/[-T:Z.]/g, "")
  .slice(0, 12); // YYYYMMDDHHMM

const buildDate = new Date()
  .toISOString()
  .replace("T", " ")
  .split(".")[0]; // YYYY-MM-DD HH:MM:SS UTC

console.log("Build no:", buildNumber);
console.log("Build date:", buildDate);

// 3. Replace placeholders
let envContent = envTemplate
  .replace("PLACEHOLDER_BUILD_NUMBER", buildNumber)
  .replace("PLACEHOLDER_BUILD_DATE", buildDate);

// 4. Write to .env
fs.writeFileSync(".env", envContent);

console.log(`✅ Build Number: ${buildNumber}`);
console.log(`✅ Build Date: ${buildDate}`);

// 5. Run Vite build
execSync("npx vite build", {
  stdio: "inherit",
  shell: true
});



console.log("\n🎉 Build complete! Check the 'dist' folder.");
