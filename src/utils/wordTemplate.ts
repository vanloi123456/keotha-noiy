/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  Packer,
  ShadingType
} from 'docx';
import mammoth from 'mammoth';
import { GameData, GameMode, MatchingPair, CategoryGroup, CategorizeCard } from '../types/game';

/**
 * Generate and download a formatted Microsoft Word (.docx) template
 */
export async function downloadWordTemplate(mode: GameMode = 'matching', existingGame?: GameData) {
  const modeName = 
    mode === 'matching' 
      ? 'Dạng 1: Nối ý (Cột Trái - Cột Phải)' 
      : mode === 'image_drop'
      ? 'Dạng 2: Kéo thả câu trả lời vào hình ảnh'
      : 'Dạng 3: Phân loại nhóm tự do';

  const docTitle = existingGame?.title || 'Bài tập học tập tương tác';
  const docSubject = existingGame?.subject || 'Tiếng Việt / Tự nhiên và Xã hội / Toán';
  const docInstructions = existingGame?.instructions || 'Bé hãy đọc kỹ và kéo thả các ý tương ứng với nhau.';

  const children: Array<Paragraph | Table> = [];

  // Title & Header
  children.push(
    new Paragraph({
      text: 'BẢNG THIẾT KẾ BÀI TẬP TƯƠNG TÁC TIỂU HỌC',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: '“THỬ TÀI KÉO THẢ – NỐI Ý”',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '💡 HƯỚNG DẪN DÀNH CHO GIÁO VIÊN: ', bold: true, color: '0284C7' }),
        new TextRun({
          text: 'Thầy cô điền thông tin bài học và nội dung vào bảng bên dưới. Sau khi soạn xong, lưu lại file Word (.docx) này và tải lên hệ thống để bài tập được tự động khởi tạo!',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Metadata Section Table
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Tên trò chơi / Bài tập:', bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: docTitle })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Dạng bài tập:', bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: modeName })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Chủ đề / Môn học:', bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: docSubject })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Hướng dẫn cho học sinh:', bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: docInstructions })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Thời gian làm bài (giây):', bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: existingGame?.timeLimitSeconds ? String(existingGame.timeLimitSeconds) : '0 (0 = không giới hạn)' })],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 200 } })
  );

  // Content Table based on Mode
  if (mode === 'matching') {
    children.push(
      new Paragraph({
        text: 'BẢNG CẶP NỐI Ý (Mỗi hàng là một cặp tương ứng chính xác)',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 120 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: '0284C7', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: '0284C7', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'CỘT TRÁI (Ý A)', bold: true, color: 'FFFFFF' })] })],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: '0284C7', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'CỘT PHẢI (Ý B TƯƠNG ỨNG)', bold: true, color: 'FFFFFF' })] })],
          }),
        ],
      }),
    ];

    // If existing pairs exist, populate them; otherwise provide 5 empty rows
    const pairsToRender = existingGame?.matchingPairs && existingGame.matchingPairs.length > 0 
      ? existingGame.matchingPairs 
      : [
          { leftText: '', rightText: '' },
          { leftText: '', rightText: '' },
          { leftText: '', rightText: '' },
          { leftText: '', rightText: '' },
          { leftText: '', rightText: '' },
        ];

    pairsToRender.forEach((p, idx) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: p.leftText || '' })],
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: p.rightText || '' })],
            }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
  } else if (mode === 'categorize') {
    children.push(
      new Paragraph({
        text: 'BẢNG PHÂN LOẠI NHÓM VÀ THẺ NỘI DUNG',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 120 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: '7C3AED', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: '7C3AED', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'TÊN NHÓM / GIỎ PHÂN LOẠI', bold: true, color: 'FFFFFF' })] })],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            shading: { fill: '7C3AED', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'CÁC THẺ THUỘC NHÓM NÀY (Cách nhau bởi dấu phẩy hoặc xuống dòng)', bold: true, color: 'FFFFFF' })] })],
          }),
        ],
      }),
    ];

    const categories = existingGame?.categories || [];
    if (categories.length > 0) {
      categories.forEach((cat, idx) => {
        const cards = existingGame?.categorizeCards.filter(c => c.targetCategoryId === cat.id).map(c => c.text).join(', ') || '';
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: cat.title })],
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: cards })],
              }),
            ],
          })
        );
      });
    } else {
      for (let i = 1; i <= 3; i++) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: String(i), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: '' })],
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: '' })],
              }),
            ],
          })
        );
      }
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
  } else {
    // Image drop mode
    children.push(
      new Paragraph({
        text: 'DANH SÁCH THẺ TRẢ LỜI / TỪ KHÓA CHO HÌNH ẢNH',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Lưu ý: ', bold: true, color: '059669' }),
          new TextRun({ text: 'Hình ảnh bài học và vị trí các vùng thả sẽ được tải lên và căn chỉnh trực tiếp trên giao diện ứng dụng. Tại đây thầy cô nhập danh sách các thẻ câu trả lời.' }),
        ],
        spacing: { after: 150 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: '059669', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            shading: { fill: '059669', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: 'NỘI DUNG THẺ CÂU TRẢ LỜI / TỪ KHÓA', bold: true, color: 'FFFFFF' })] })],
          }),
        ],
      }),
    ];

    const cards = existingGame?.imageAnswerCards || [];
    if (cards.length > 0) {
      cards.forEach((c, idx) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 85, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: c.text })],
              }),
            ],
          })
        );
      });
    } else {
      for (let i = 1; i <= 6; i++) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: String(i), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 85, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: '' })],
              }),
            ],
          })
        );
      }
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
  }

  // Footer note
  children.push(
    new Paragraph({ text: '', spacing: { after: 200 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: '📌 Sau khi hoàn tất, hãy nhấn nút "Tải lên file Word (.docx)" trên ứng dụng để nạp tự động toàn bộ nội dung.',
          italics: true,
          color: '64748B',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = (docTitle.trim() ? docTitle.trim().replace(/[^a-zA-Z0-9\s_À-ỹ-]/g, '') : 'mau-bai-tap') + '.docx';
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export interface ParsedWordGame {
  title: string;
  subject: string;
  instructions: string;
  timeLimitSeconds: number;
  mode: GameMode;
  matchingPairs: MatchingPair[];
  categories: CategoryGroup[];
  categorizeCards: CategorizeCard[];
  imageAnswerCards: Array<{ id: string; text: string }>;
  rawTablesCount: number;
}

/**
 * Parse a Microsoft Word (.docx) file uploaded by teacher
 */
export async function parseWordFile(file: File): Promise<ParsedWordGame> {
  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;

  // Create temporary DOM parser to extract tables and text
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  let title = '';
  let subject = '';
  let instructions = '';
  let timeLimitSeconds = 0;
  let mode: GameMode = 'matching';

  const matchingPairs: MatchingPair[] = [];
  const categories: CategoryGroup[] = [];
  const categorizeCards: CategorizeCard[] = [];
  const imageAnswerCards: Array<{ id: string; text: string }> = [];

  const tables = Array.from(doc.querySelectorAll('table'));

  // Scan metadata from first table or text paragraphs
  tables.forEach((table, tableIdx) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Check if this table is the metadata table
    let isMetaTable = false;
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '');
      if (cells.length >= 2) {
        const label = cells[0].toLowerCase();
        const val = cells[1];

        if (label.includes('tên trò chơi') || label.includes('tên bài tập')) {
          title = val;
          isMetaTable = true;
        } else if (label.includes('chủ đề') || label.includes('môn học')) {
          subject = val;
          isMetaTable = true;
        } else if (label.includes('dạng bài')) {
          if (val.includes('hình ảnh')) mode = 'image_drop';
          else if (val.includes('phân loại')) mode = 'categorize';
          else mode = 'matching';
          isMetaTable = true;
        } else if (label.includes('hướng dẫn')) {
          instructions = val;
          isMetaTable = true;
        } else if (label.includes('thời gian')) {
          const matchedNum = val.match(/\d+/);
          if (matchedNum) timeLimitSeconds = parseInt(matchedNum[0], 10);
          isMetaTable = true;
        }
      }
    });

    // If not metadata table, it is a content table
    if (!isMetaTable && rows.length > 0) {
      // Check column headers or content
      const firstRowCells = Array.from(rows[0].querySelectorAll('td, th')).map(c => c.textContent?.trim().toLowerCase() || '');
      
      const isMatchingTable = firstRowCells.some(c => c.includes('cột trái') || c.includes('ý a') || c.includes('cột 1'));
      const isCategorizeTable = firstRowCells.some(c => c.includes('tên nhóm') || c.includes('giỏ') || c.includes('nhóm'));
      const isCardTable = firstRowCells.some(c => c.includes('thẻ câu trả lời') || c.includes('từ khóa') || c.includes('câu trả lời'));

      if (isMatchingTable || (!isCategorizeTable && !isCardTable && mode === 'matching')) {
        mode = 'matching';
        // Read rows starting from row 1 (or 0 if no header)
        const startRow = (isMatchingTable || firstRowCells.some(c => c.includes('stt'))) ? 1 : 0;
        for (let i = startRow; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td')).map(c => c.textContent?.trim() || '');
          if (cells.length >= 2) {
            let left = '';
            let right = '';
            if (cells.length >= 3) {
              // STT, Left, Right
              left = cells[1];
              right = cells[2];
            } else {
              left = cells[0];
              right = cells[1];
            }

            if (left || right) {
              matchingPairs.push({
                id: 'pair_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                leftText: left,
                rightText: right,
              });
            }
          }
        }
      } else if (isCategorizeTable || mode === 'categorize') {
        mode = 'categorize';
        const startRow = (isCategorizeTable || firstRowCells.some(c => c.includes('stt'))) ? 1 : 0;
        const colors = ['#0284c7', '#16a34a', '#d97706', '#9333ea', '#e11d48', '#0d9488'];

        for (let i = startRow; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td')).map(c => c.textContent?.trim() || '');
          if (cells.length >= 2) {
            const catName = cells.length >= 3 ? cells[1] : cells[0];
            const cardsStr = cells.length >= 3 ? cells[2] : cells[1];

            if (catName) {
              const catId = 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
              categories.push({
                id: catId,
                title: catName,
                color: colors[categories.length % colors.length],
              });

              // Split cards by comma, semicolon or newline
              const cardTexts = cardsStr.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean);
              cardTexts.forEach(txt => {
                categorizeCards.push({
                  id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                  text: txt,
                  targetCategoryId: catId,
                });
              });
            }
          }
        }
      } else if (isCardTable || mode === 'image_drop') {
        mode = 'image_drop';
        const startRow = (isCardTable || firstRowCells.some(c => c.includes('stt'))) ? 1 : 0;
        for (let i = startRow; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td')).map(c => c.textContent?.trim() || '');
          const cardText = cells.length >= 2 ? cells[1] : cells[0];
          if (cardText) {
            imageAnswerCards.push({
              id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
              text: cardText,
            });
          }
        }
      }
    }
  });

  // Fallback: If no tables were detected, scan paragraphs
  if (matchingPairs.length === 0 && categories.length === 0 && imageAnswerCards.length === 0) {
    const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent?.trim() || '').filter(Boolean);
    paragraphs.forEach(p => {
      // Match patterns like "1. Quả cam - Màu cam" or "Con mèo = Bắt chuột"
      const pairMatch = p.match(/^(\d+[\.\)]\s*)?(.+?)\s*(?:-|—|–|=|:)\s*(.+)$/);
      if (pairMatch) {
        matchingPairs.push({
          id: 'pair_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          leftText: pairMatch[2].trim(),
          rightText: pairMatch[3].trim(),
        });
      }
    });
  }

  // If title was not in table, extract from first heading or file name
  if (!title) {
    const heading = doc.querySelector('h1, h2, h3');
    if (heading && !heading.textContent?.includes('BẢNG THIẾT KẾ') && !heading.textContent?.includes('THỬ TÀI')) {
      title = heading.textContent.trim();
    } else {
      title = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  return {
    title,
    subject,
    instructions,
    timeLimitSeconds,
    mode,
    matchingPairs,
    categories,
    categorizeCards,
    imageAnswerCards,
    rawTablesCount: tables.length,
  };
}
