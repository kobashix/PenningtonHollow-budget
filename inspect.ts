import * as XLSX from 'xlsx';
import * as fs from 'fs';

const workbook = XLSX.readFile('New_Build_Checklist_With_Phases_Costs.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log('Headers found:', data[0]);
