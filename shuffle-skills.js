const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const inPlace = args.includes("--in-place") || args.includes("-i");

const skillsPath = path.join(__dirname, "skills.json");
const outputPath = inPlace
  ? skillsPath
  : path.join(__dirname, "skills-shuffled.json");

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

let skills;
try {
  const fileContent = fs.readFileSync(skillsPath, "utf-8");
  skills = JSON.parse(fileContent);
} catch (error) {
  console.error("❌ Error reading file or parsing JSON:", error.message);
  process.exit(1);
}

console.log("=".repeat(70));
console.log("Skills Shuffler");
console.log("=".repeat(70));
console.log(`\nOriginal skills: ${skills.length}`);
if (inPlace) {
  console.log("⚠️  Mode: In-place (will overwrite original file)");
} else {
  console.log("📝 Mode: Safe (will create new file)");
}

const shuffled = shuffleArray(skills);

console.log(`Shuffled skills: ${shuffled.length}`);

console.log("\n📋 Sample comparison (first 10 items):");
console.log("\nBefore:");
skills.slice(0, 10).forEach((skill, i) => {
  console.log(`  ${i + 1}. ${skill.name}`);
});

console.log("\nAfter:");
shuffled.slice(0, 10).forEach((skill, i) => {
  console.log(`  ${i + 1}. ${skill.name}`);
});

try {
  fs.writeFileSync(
    outputPath,
    JSON.stringify(shuffled, null, 2) + "\n",
    "utf-8"
  );
  if (inPlace) {
    console.log(`\n✅ Original file shuffled successfully!`);
  } else {
    console.log(`\n✅ Shuffled skills saved to: ${path.basename(outputPath)}`);
  }
} catch (error) {
  console.error("❌ Error writing file:", error.message);
  process.exit(1);
}

if (!inPlace) {
  console.log("\n" + "=".repeat(70));
  console.log("📌 Options:");
  console.log(
    `   1. Use shuffled file: mv ${path.basename(outputPath)} ${path.basename(
      skillsPath
    )}`
  );
  console.log(
    `   2. Shuffle in-place:  node ${path.basename(__filename)} --in-place`
  );
  console.log("=".repeat(70));
} else {
  console.log("\n" + "=".repeat(70));
  console.log("✨ Done! Run the duplicate checker to verify:");
  console.log("   node check-duplicates.js");
  console.log("=".repeat(70));
}
