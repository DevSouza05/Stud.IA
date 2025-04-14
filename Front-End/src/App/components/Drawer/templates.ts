import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

export interface ResumeTemplate {
  name: string;
  description: string;
  generate: (data: any) => Document;
}

const modernTemplate: ResumeTemplate = {
  name: 'Moderno',
  description: 'Layout moderno com cores e espaçamento otimizados',
  generate: (data) => {
    return new Document({
      sections: [{
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            children: [
              new TextRun({
                text: data.name.toUpperCase(),
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.email,
                size: 24,
              }),
              new TextRun({
                text: " | ",
                size: 24,
              }),
              new TextRun({
                text: data.phone,
                size: 24,
              }),
              new TextRun({
                text: " | ",
                size: 24,
              }),
              new TextRun({
                text: data.location,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Objetivo Profissional
          new Paragraph({
            children: [
              new TextRun({
                text: "OBJETIVO PROFISSIONAL",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.professionalObjective,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Experiência Profissional
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERIÊNCIA PROFISSIONAL",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          ...data.experience.map(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.position,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.company} | ${exp.startDate} - ${exp.endDate}`,
                  size: 24,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]).flat(),
        ],
      }],
    });
  },
};

const classicTemplate: ResumeTemplate = {
  name: 'Clássico',
  description: 'Layout tradicional e profissional',
  generate: (data) => {
    return new Document({
      sections: [{
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.name.toUpperCase(),
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.email,
                size: 24,
              }),
              new TextRun({
                text: " • ",
                size: 24,
              }),
              new TextRun({
                text: data.phone,
                size: 24,
              }),
              new TextRun({
                text: " • ",
                size: 24,
              }),
              new TextRun({
                text: data.location,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Experiência Profissional
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERIÊNCIA PROFISSIONAL",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          ...data.experience.map(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.position,
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: ` - ${exp.company}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.startDate} - ${exp.endDate}`,
                  size: 24,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]).flat(),
        ],
      }],
    });
  },
};

const minimalTemplate: ResumeTemplate = {
  name: 'Minimalista',
  description: 'Layout limpo e direto',
  generate: (data) => {
    return new Document({
      sections: [{
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            children: [
              new TextRun({
                text: data.name,
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.email,
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.phone,
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.location,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Experiência Profissional
          new Paragraph({
            children: [
              new TextRun({
                text: "Experiência",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          ...data.experience.map(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.position,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]).flat(),
        ],
      }],
    });
  },
};

export const templates: ResumeTemplate[] = [
  modernTemplate,
  classicTemplate,
  minimalTemplate,
]; 