import { NextRequest, NextResponse } from "next/server";
import HTMLtoDOCX from 'html-to-docx';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { html, title } = await req.json();

        if (!html) {
            return NextResponse.json({ error: "No HTML content provided" }, { status: 400 });
        }

        // Clean up the HTML to ensure proper parsing
        const cleanHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: "Times New Roman", Times, serif; font-size: 11pt; }
                    h1 { font-size: 16pt; font-weight: bold; text-align: center; }
                    h2 { font-size: 14pt; font-weight: bold; }
                    h3 { font-size: 12pt; font-weight: bold; }
                    p { margin-bottom: 12pt; line-height: 1.5; }
                    ul, ol { margin-bottom: 12pt; }
                    li { margin-bottom: 6pt; }
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        const fileBuffer = await HTMLtoDOCX(cleanHtml, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        // Set headers for file download
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${(title || 'Document').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx"`,
            },
        });
    } catch (error: any) {
        console.error("DOCX Export Error:", error);
        return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
    }
}
