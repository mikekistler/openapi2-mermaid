#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const converter = require('swagger2openapi');
const generator = require('openapi-mermaid');
const temp = require('temp');

program
    .name("diagram")
    .description("Generate a diagram from an OpenAPI spec")
    .argument('<spec>')
    .option('-o, --outputFolder <dir>');

program.parse();
const options = program.opts();

// Automatically track and cleanup files at exit
temp.track();

let converterOptions = {
    patch: true, // fix up small errors in the source definition
    warnOnly: true, // Do not throw on non-patchable errors
};
converter.convertFile(program.args[0], converterOptions, function(err, result) {
    // result.openapi contains the converted definition
    if (err) {
        console.error(err);
        process.exit(1);
    }
    // Process the data (note: error handling omitted)
    const oas3File = temp.path({suffix: '.json'});
    fs.writeFileSync(oas3File, JSON.stringify(result.openapi,null,2));

    generator.generateDiagrams({
        openApiJsonFileName: oas3File,
        outputPath: options.outputFolder,
        });
});
