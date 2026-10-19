// Exercise ZeroWall's actual editable PPTX engine; no model or synthetic app output.
import { createOfficeKitEngine } from '../../zerowallscience/plugins/dsh-ppt-maker/src/core/engine/officekit.ts';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dir = join(root, 'public/samples'); await mkdir(dir, { recursive: true });
const ink = '#193C42', cyan = '#007D91', pale = '#EDF6F4';
const text = (id, value, bounds, size = 22, color = ink) => ({ elementId: id, elementType: 'text', bounds, content: { text: value, fontSize: size, fontFamily: 'Microsoft YaHei', color } });
const shape = (id, bounds, color = pale) => ({ elementId: id, elementType: 'shape', shapeName: 'roundRect', bounds, fill: { type: 'solid', color } });
const common = (n, title) => [text('kicker', 'ZEROWALL SCIENCE / RESEARCH', [48, 25, 700, 28], 12, cyan), text('title', title, [48, 70, 860, 65], 38), text('footer', `官网演示材料 · 不代表研究结论                                           ${n} / 03`, [48, 493, 860, 28], 12, '#657E83')];
const pages = [
 { background: { type: 'solid', color: '#FAFCFB' }, elements: [...common(1, '医学研究背景与问题'), text('question', '如何把一个研究问题，\n转化为可检查的分析与证据？', [50, 185, 450, 100], 27), text('body', '组织公开数据、分析方法和研究限制，\n保留每一步的输入、参数与输出。', [50, 315, 470, 95], 21, '#526E73'), { elementId: 'art', elementType: 'image', bounds: [555, 155, 350, 300], src: 'design/generated/medicine.png', fit: { mode: 'contain' } }] },
 { background: { type: 'solid', color: '#FAFCFB' }, elements: [...common(2, '研究设计与分析流程'), ...['公开数据', '质量控制', '分析与核查'].flatMap((label, i) => [shape(`step-${i}`, [48 + i * 298, 190, 270, 170]), text(`number-${i}`, `0${i + 1}`, [68 + i * 298, 205, 220, 40], 18, cyan), text(`label-${i}`, label, [68 + i * 298, 265, 220, 50], 27)]), text('limit', '明确样本范围、变量定义和参数，再进入结果解释。', [48, 405, 860, 45], 22, '#526E73')] },
 { background: { type: 'solid', color: '#FAFCFB' }, elements: [...common(3, '结果组织与研究限制'), { elementId: 'native-chart', elementType: 'chart', bounds: [48, 170, 470, 270], data: { cols: ['Category', 'Value'], rows: [['A',44],['B',75],['C',58],['D',90]] }, series: [{ type: 'bar', name: '演示数值', encode: { x: 'Category', y: 'Value' } }] }, { elementId: 'native-table', elementType: 'table', bounds: [570, 195, 340, 180], rows: [[{text:'内容'},{text:'状态'}],[{text:'研究图表'},{text:'可编辑'}],[{text:'数据表格'},{text:'可编辑'}]], style: { fontSize: 20, color: ink } }, text('data-disclosure', 'A–D 为演示数据，无科学推断含义。', [48, 445, 860, 30], 15, '#657E83')] }
];
const engine = createOfficeKitEngine(); const warnings = [];
const model = { deck: { profile: 'generate', title: '医学研究汇报 · 可编辑示例', size: [960, 540], export: { fontEmbed: 'off', transition: 'fade', animations: 'off' }, pages: ['01','02','03'] }, pages };
const built = await engine.buildDeck(model, { projectDir: root, loadMedia: src => readFile(join(root, src)), warnings });
const bytes = await engine.saveDeck(built.native);
await writeFile(join(dir, 'zerowall-editable-research.pptx'), bytes);
await writeFile(join(root, 'design/pptx-export-receipt.json'), JSON.stringify({ generatedAt: new Date().toISOString(), exporter: 'ZeroWall Science dsh-ppt-maker createOfficeKitEngine', softwareVersion: '8.4.0', pageCount: built.slides.length, fonts: built.fontsUsed, warnings, disclosure: 'Illustrative material and data', bytes: bytes.length }, null, 2));
console.log({ pages: built.slides.length, bytes: bytes.length, warnings });
