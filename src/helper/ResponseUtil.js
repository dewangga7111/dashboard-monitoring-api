const { GetMsg } = require("../helper/MessageUtil");

const Ok = (res, message, data) => {  
  createMsg(res, 200, message, data);
};

const DataCreated = (res, message = 'Data Created', data) => {
  createMsg(res, 201, message, data);
};

const DataUpdated = (res, message = 'Data Updated') => {
  createMsg(res, 200, message, undefined);
};

const DataDeleted = (res, message = 'Data Deleted') => {
  createMsg(res, 200, message, undefined);
};

const BadRequest = (res, message = 'Bad Request') => {
  createMsg(res, 400, message, undefined);
};

const NotFound = (res, message = 'Not Found') => {
  createMsg(res, 404, message, undefined);
};

const Unauthorized = (res, message = 'Unauthorized') => {
  createMsg(res, 401, message, undefined);
};

const Forbidden = (res, message = 'Forbidden') => {
  createMsg(res, 403, message, undefined);
};

const InternalServerErr = (res, message = 'Internal Server Error') => {
  createMsg(res, 500, message, undefined);
};

const SearchOk = (res, searchResult) => {
  const { page, per_page, total_rows, total_pages, result } = searchResult
  res.append(
    "Access-Control-Expose-Headers",
    "Page, Per-Page, Total-Rows, Total-Pages"
  );
  res.append("Page", page);
  res.append("Per-Page", per_page);
  res.append("Total-Rows", total_rows);
  res.append("Total-Pages", total_pages);

  let message = result.length > 0 ? GetMsg("found", 'Data') : GetMsg("not.found", 'Data');
  createMsg(res, 200, message, result);
};

const createMsg = (res, status_code, message = "", data) => {
  res.status(status_code).send({    
    message,
    data,
  });
};

const sendExcelBufferResponse = (res, buffer, filename) => {
  res.append("Access-Control-Expose-Headers", "Filename");
  res.append(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.attachment(filename);
  res.append("Filename", filename);
  res.send(buffer);
};

const SendBuffer = (res, buffer, filename) => {
  res.append('Access-Control-Expose-Headers', 'Filename');    
  res.attachment(filename);
  res.append('Filename', filename);
  res.send(buffer);
};


module.exports = {
  Ok,
  BadRequest,
  DataCreated,
  DataUpdated,
  DataDeleted,
  Unauthorized,
  Forbidden,
  InternalServerErr,
  SearchOk,
  NotFound,
  createMsg,
  sendExcelBufferResponse,
  SendBuffer,
};
