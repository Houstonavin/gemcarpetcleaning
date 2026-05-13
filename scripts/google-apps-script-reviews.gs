/**
 * Gem Cleaning — Reviews webhook (paste into Google Apps Script Editor)
 *
 * IMPORTANT: Use a spreadsheet-bound script — open your Sheet → Extensions → Apps Script.
 * Deploy as Web App: Execute as "Me", Who has access: "Anyone".
 *
 * Script property (Project Settings → Script properties):
 *   GEM_SCRIPT_TOKEN  = same value as GEM_APPS_SCRIPT_SECRET on your Node server (.env)
 */
const SHEET_NAME = 'Reviews';

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'Rating', 'Service', 'Name', 'Comments', 'Approved']);
  }
  return sh;
}

function expectToken_(e, isPost) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty('GEM_SCRIPT_TOKEN');
  if (!expected) {
    return jsonOut_(500, {
      ok: false,
      error: 'GEM_SCRIPT_TOKEN is not set in Script properties.',
    });
  }
  let token = '';
  if (isPost) {
    try {
      var body = JSON.parse(e.postData.contents);
      token = body && body.secret ? String(body.secret) : '';
    } catch (ignore) {
      token = '';
    }
  } else {
    token = e.parameter && e.parameter.token ? String(e.parameter.token) : '';
  }
  if (token !== expected) {
    return jsonOut_(403, { ok: false, error: 'Forbidden' });
  }
  return null;
}

function doPost(e) {
  const forbidden = expectToken_(e, true);
  if (forbidden) {
    return forbidden;
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_err) {
    return jsonOut_(400, { ok: false, error: 'Invalid JSON body' });
  }

  var ratingNum = Number(body.rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return jsonOut_(400, { ok: false, error: 'rating must be 1–5' });
  }

  var serviceStr = body.service ? String(body.service).trim() : '';
  if (!serviceStr) {
    return jsonOut_(400, { ok: false, error: 'service is required' });
  }

  var nameStr = body.name ? String(body.name).trim().slice(0, 200) : '';
  var commentsStr = body.comments ? String(body.comments).trim().slice(0, 2000) : '';

  var sheet = getOrCreateSheet_();
  sheet.appendRow([
    new Date(),
    ratingNum,
    serviceStr,
    nameStr,
    commentsStr,
    'pending',
  ]);

  return jsonOut_(200, { ok: true });
}

function doGet(e) {
  const forbidden = expectToken_(e, false);
  if (forbidden) {
    return forbidden;
  }

  var sheet = getOrCreateSheet_();
  var values = sheet.getDataRange().getValues();
  if (!values.length) {
    return jsonOut_(200, { ok: true, reviews: [] });
  }

  var header = values[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });
  var idxTs = header.indexOf('timestamp');
  var idxRating = header.indexOf('rating');
  var idxService = header.indexOf('service');
  var idxName = header.indexOf('name');
  var idxComments = header.indexOf('comments');
  var idxApproved = header.indexOf('approved');

  if (idxRating < 0 || idxService < 0) {
    return jsonOut_(500, { ok: false, error: 'Sheet must have Rating and Service columns.' });
  }

  var reviews = [];
  for (var i = values.length - 1; i >= 1; i--) {
    var row = values[i];
    var approvedCell = idxApproved >= 0 ? String(row[idxApproved] || '').trim().toLowerCase() : 'yes';
    if (approvedCell !== 'yes') {
      continue;
    }

    var ts = idxTs >= 0 ? row[idxTs] : '';
    if (ts instanceof Date) {
      ts = ts.toISOString();
    } else {
      ts = ts ? String(ts) : '';
    }

    reviews.push({
      ts: ts,
      rating: Number(row[idxRating]) || 0,
      service: idxService >= 0 ? String(row[idxService] || '') : '',
      name: idxName >= 0 ? String(row[idxName] || '') : '',
      comments: idxComments >= 0 ? String(row[idxComments] || '') : '',
    });

    if (reviews.length >= 100) {
      break;
    }
  }

  return jsonOut_(200, { ok: true, reviews: reviews });
}

function jsonOut_(status, obj) {
  // Apps Script Web Apps always return HTTP 200 to the client; carry status inside body for debugging.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
