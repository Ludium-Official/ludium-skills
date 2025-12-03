const fs = require("fs");
const path = require("path");

const skillsPath = path.join(__dirname, "skills.json");

let skills;
try {
  const fileContent = fs.readFileSync(skillsPath, "utf-8");
  skills = JSON.parse(fileContent);
} catch (error) {
  console.error("❌ Error reading file or parsing JSON:", error.message);
  process.exit(1);
}

console.log("=".repeat(70));
console.log("Skills.json Duplicate Checker");
console.log("=".repeat(70));
console.log(`\nTotal skills: ${skills.length}\n`);

function checkExactDuplicates(skills) {
  const nameMap = new Map();
  const duplicates = [];

  skills.forEach((skill, index) => {
    const name = skill.name;
    if (nameMap.has(name)) {
      duplicates.push({
        name,
        indices: [nameMap.get(name), index],
        lineNumbers: [nameMap.get(name) + 2, index + 2],
      });
    } else {
      nameMap.set(name, index);
    }
  });

  return duplicates;
}

function checkCaseInsensitiveDuplicates(skills) {
  const nameMap = new Map();
  const duplicates = [];

  skills.forEach((skill, index) => {
    const lowerName = skill.name.toLowerCase();
    if (nameMap.has(lowerName) && nameMap.get(lowerName).name !== skill.name) {
      duplicates.push({
        name1: nameMap.get(lowerName).name,
        name2: skill.name,
        index1: nameMap.get(lowerName).index,
        index2: index,
        line1: nameMap.get(lowerName).index + 2,
        line2: index + 2,
      });
    } else if (!nameMap.has(lowerName)) {
      nameMap.set(lowerName, { name: skill.name, index });
    }
  });

  return duplicates;
}

function checkSimilarNames(skills) {
  const normalizeMap = new Map();
  const similar = [];

  skills.forEach((skill, index) => {
    const normalized = skill.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (normalizeMap.has(normalized)) {
      const existing = normalizeMap.get(normalized);
      if (!existing.some((e) => e.name === skill.name)) {
        similar.push({
          normalized,
          items: [...existing, { name: skill.name, index, line: index + 2 }],
        });
        normalizeMap.set(normalized, [
          ...existing,
          { name: skill.name, index, line: index + 2 },
        ]);
      }
    } else {
      normalizeMap.set(normalized, [
        { name: skill.name, index, line: index + 2 },
      ]);
    }
  });

  return similar.filter((s) => s.items.length > 1);
}

function checkKeywordDuplicates(skills) {
  const checkList = [
    "Bun",
    "tRPC",
    "Ethers.js",
    "Wagmi",
    "Viem",
    "Hardhat",
    "Foundry",
    "Truffle",
    "IPFS",
    "The Graph",
    "Chainlink",
    "Polygon",
    "Solana",
    "Sui",
    "Aptos",
    "Cosmos SDK",
    "Substrate",
    "Astro",
    "Qwik",
    "Ethereum",
    "React",
    "Node.js",
    "Next.js",
  ];

  const found = [];
  checkList.forEach((keyword) => {
    const matches = skills
      .map((skill, idx) => ({ skill, idx }))
      .filter(
        ({ skill }) => skill.name.toLowerCase() === keyword.toLowerCase()
      );

    if (matches.length > 1) {
      found.push({
        keyword,
        count: matches.length,
        locations: matches.map((m) => ({
          index: m.idx,
          line: m.idx + 2,
          name: m.skill.name,
        })),
      });
    }
  });

  return found;
}

console.log("1️⃣  Exact Match Duplicates");
console.log("-".repeat(70));
const exactDuplicates = checkExactDuplicates(skills);
if (exactDuplicates.length === 0) {
  console.log("✅ No duplicates\n");
} else {
  console.log(`❌ Found ${exactDuplicates.length} duplicates:\n`);
  exactDuplicates.forEach((dup, i) => {
    console.log(`   ${i + 1}. "${dup.name}"`);
    console.log(`      Location: lines ${dup.lineNumbers.join(", ")}`);
  });
  console.log();
}

console.log("2️⃣  Case-Insensitive Duplicates");
console.log("-".repeat(70));
const caseInsensitiveDups = checkCaseInsensitiveDuplicates(skills);
if (caseInsensitiveDups.length === 0) {
  console.log("✅ No duplicates\n");
} else {
  console.log(`⚠️  Found ${caseInsensitiveDups.length} duplicates:\n`);
  caseInsensitiveDups.forEach((dup, i) => {
    console.log(
      `   ${i + 1}. "${dup.name1}" (line ${dup.line1}) ↔ "${dup.name2}" (line ${
        dup.line2
      })`
    );
  });
  console.log();
}

console.log("3️⃣  Similar Names (Special Characters Ignored)");
console.log("-".repeat(70));
const similarNames = checkSimilarNames(skills);
if (similarNames.length === 0) {
  console.log("✅ No similar names\n");
} else {
  console.log(`⚠️  Found ${similarNames.length} groups:\n`);
  similarNames.forEach((group, i) => {
    console.log(`   ${i + 1}. Normalized: "${group.normalized}"`);
    group.items.forEach((item) => {
      console.log(`      - "${item.name}" (line ${item.line})`);
    });
    console.log();
  });
}

console.log("4️⃣  Common Keyword Duplicates");
console.log("-".repeat(70));
const keywordDups = checkKeywordDuplicates(skills);
if (keywordDups.length === 0) {
  console.log("✅ No keyword duplicates\n");
} else {
  console.log(`❌ Found ${keywordDups.length} duplicates:\n`);
  keywordDups.forEach((dup, i) => {
    console.log(`   ${i + 1}. "${dup.keyword}" - appears ${dup.count} times`);
    dup.locations.forEach((loc) => {
      console.log(`      - line ${loc.line}: "${loc.name}"`);
    });
    console.log();
  });
}

console.log("=".repeat(70));
console.log("📊 Summary");
console.log("=".repeat(70));
console.log(`Total skills: ${skills.length}`);
console.log(`Exact match duplicates: ${exactDuplicates.length}`);
console.log(`Case-insensitive duplicates: ${caseInsensitiveDups.length}`);
console.log(`Similar name groups: ${similarNames.length}`);
console.log(`Common keyword duplicates: ${keywordDups.length}`);
console.log("=".repeat(70));

const hasIssues = exactDuplicates.length > 0 || keywordDups.length > 0;
if (hasIssues) {
  console.log("\n⚠️  Duplicates found!");
  process.exit(1);
} else {
  console.log("\n✅ All checks passed!");
  process.exit(0);
}
