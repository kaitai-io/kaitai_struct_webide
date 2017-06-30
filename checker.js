if(process.argv.length < 5){
    console.log('Usage: node checker.js <formatYaml> <inputBinary> <checkJson>');
    return;
}

var yamlFn = process.argv[2];
var inputFn = process.argv[3];
var checkJsonFn = process.argv[4];

var fs = require("fs");
require('./lib/kaitai/kaitai-struct-compiler-fastopt.js');
var YAML = require('./lib/kaitai/yaml_practice.js');
var KaitaiStream = require('./lib/_npm/kaitai-struct/KaitaiStream.js');
var requireFromString = require('./lib/require-from-string/require-from-string.js');
var practiceModeChecker = require('./js/practiceModeChecker.js');

var ks = io.kaitai.struct.MainJs();

var srcYaml = fs.readFileSync(yamlFn, 'utf8');
var src = YAML.parse(srcYaml);
var compiled = ks.compile('javascript', src, false)[0];

var root = requireFromString(compiled);

var inputData = fs.readFileSync(inputFn);
var inputStream = new KaitaiStream(inputData);
var parsed = new root(inputStream);

var checkJson = JSON.parse(fs.readFileSync(checkJsonFn, 'utf8'));

//console.log(parsed);
//console.log(checkJson);
var checkResult = practiceModeChecker(parsed, checkJson);
console.log(JSON.stringify({success: checkResult.allMatch}));