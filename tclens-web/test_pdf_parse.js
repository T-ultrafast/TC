const { PDFParse } = require('pdf-parse');

async function test() {
    try {
        console.log("Instantiating PDFParse...");
        // Incorrect: pdf-parse v2+ is a class, not a function

        const buffer = Buffer.from("Not a PDF, just text");

        // Guessing usage:
        const parser = new PDFParse({ data: buffer });
        console.log("Instance created.");

        // Just calling load to see if it accepts parameters
        // It might throw InvalidPDF, which is good (means we reached the library)
        await parser.getText();

    } catch (e) {
        console.log("Caught error:", e.name, e.message);
    }
}

test();
