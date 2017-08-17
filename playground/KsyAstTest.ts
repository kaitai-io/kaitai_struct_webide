import { KsyAst } from "./KsyAst";
const fs = require("fs");
const yaml = require("yaml-js");
const glob = require("glob");
var mkdirp = require("mkdirp");
const path = require("path");

const outDir = "playground/compare_results";

function testAllKsys() {
  let ksyFns = glob.sync("formats/**/*.ksy");
  //ksyFns = ["playground/test.ksy"];
  //ksyFns = ksyFns.filter(x => x.includes("ttf.ksy"));
  console.log(ksyFns);

  for (const ksyFn of ksyFns) {
    console.log(`processing "${ksyFn}"...`);
    const ksyContent = fs.readFileSync(ksyFn, "utf8");

    try {
      const ast = new KsyAst.Parser(ksyContent).parse();
      const ksyAstRaw = KsyAst.Converter.astToRaw(ast);
      const ksyAstJsonFn = `${outDir}/ksyAst/${ksyFn}`.replace(".ksy", ".json");
      mkdirp.sync(path.dirname(ksyAstJsonFn));
      fs.writeFileSync(ksyAstJsonFn, JSON.stringify(ksyAstRaw, null, 4));
    } catch(e) {
      console.error(ksyFn, e);
    }

    try {
      const yamlJsRaw = yaml.load(ksyContent);
      const yamlJsJsonFn = `${outDir}/yamlJs/${ksyFn}`.replace(".ksy", ".json");
      mkdirp.sync(path.dirname(yamlJsJsonFn));
      fs.writeFileSync(yamlJsJsonFn.replace(".ksy", ".json"), JSON.stringify(yamlJsRaw, null, 4));
    } catch(e) {
      console.error(ksyFn, e);
    }

    const ksyOutFn = `${outDir}/ksy/${ksyFn}`;
    mkdirp.sync(path.dirname(ksyOutFn));
    fs.writeFileSync(ksyOutFn, ksyContent);
  }
}

testAllKsys();
console.log("DONE");

//const ksyContent = fs.readFileSync("playground/test.ksy");
//const yamlRes = yaml.load(ksyContent);
//console.log(yamlRes);
//const ast = new KsyAst.Parser(ksyContent).parse();
//const astJson = JSON.stringify(ast, (k,v) => k === "parent" || k === "range" ? undefined : v, 4);
//const ksy = KsyAst.Converter.astToRaw(ast);
//console.log(ksy);
//console.log(ast);
