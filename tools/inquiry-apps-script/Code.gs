/**
 * SC4SAP inquiry form receiver (redesign/contact/inquiry.html).
 *
 * Bound to a Google Sheet: each inquiry is appended as a row on the
 * "문의" sheet and a notice goes to NOTIFY_TO. Setup:
 *   1. Create a Google Sheet, open Extensions > Apps Script, paste this file.
 *   2. Deploy > New deployment > Web app.
 *      Execute as: Me · Who has access: Anyone.
 *   3. Copy the /exec URL into data-endpoint on the form.
 * After editing this file, deploy again (Manage deployments > Edit >
 * New version) or the URL keeps serving the old code.
 */

var NOTIFY_TO = 'sc4sap.dev@gmail.com';
var SHEET_NAME = '문의';

// Column order of the sheet; keys match the form's field names.
var FIELDS = [
  ['receivedAt', '접수 시각'],
  ['name', '이름'],
  ['company', '회사명'],
  ['title', '부서 · 직책'],
  ['email', '업무 이메일'],
  ['phone', '연락처'],
  ['industry', '업종'],
  ['size', '임직원 규모'],
  ['sapVersion', 'SAP 버전'],
  ['cbo', 'CBO 규모'],
  ['modules', '운영 모듈'],
  ['deploy', '설치 · 보안 요건'],
  ['goals', '관심 업무'],
  ['seats', '사용 예정 인원'],
  ['timeline', '희망 도입 시점'],
  ['message', '문의 내용'],
  ['source', '알게 된 경로'],
  ['agreePrivacy', '개인정보 동의'],
  ['agreeMarketing', '마케팅 수신 동의']
];
var REQUIRED = ['name', 'company', 'email', 'phone', 'industry', 'size', 'sapVersion', 'goals'];
var MAX_LEN = 5000;

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: 'bad-json' });
  }

  // The hidden "website" field is left empty by people and filled by bots.
  if (data.website) return reply({ ok: true });

  var missing = REQUIRED.filter(function (k) { return !text(data[k]); });
  if (missing.length || data.agreePrivacy !== true) return reply({ ok: false, error: 'missing', fields: missing });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(data.email))) return reply({ ok: false, error: 'email' });

  data.receivedAt = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet().appendRow(FIELDS.map(function (f) { return cell(data[f[0]]); }));
  } finally {
    lock.releaseLock();
  }

  notify(data);
  return reply({ ok: true });
}

function sheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sh = book.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = book.insertSheet(SHEET_NAME);
    sh.appendRow(FIELDS.map(function (f) { return f[1]; }));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
  }
  return sh;
}

function notify(data) {
  var rows = FIELDS.map(function (f) {
    return '<tr><th align="left" style="padding:6px 12px 6px 0;color:#71717A;font-weight:600;white-space:nowrap;vertical-align:top">' +
      esc(f[1]) + '</th><td style="padding:6px 0;white-space:pre-wrap">' + esc(text(data[f[0]]) || '-') + '</td></tr>';
  }).join('');
  MailApp.sendEmail({
    to: NOTIFY_TO,
    replyTo: text(data.email),
    subject: '[SC4SAP 도입 문의] ' + text(data.company) + ' · ' + text(data.name),
    htmlBody: '<table style="font:14px/1.6 sans-serif;color:#111113;border-collapse:collapse">' + rows + '</table>'
  });
}

// Lists become "a, b"; booleans read as 동의 / 미동의; everything is capped.
function text(v) {
  if (v === true) return '동의';
  if (v === false) return '미동의';
  if (Array.isArray(v)) v = v.join(', ');
  return v == null ? '' : String(v).trim().slice(0, MAX_LEN);
}

// A value starting with = + - @ would run as a formula in the sheet.
function cell(v) {
  var s = text(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
