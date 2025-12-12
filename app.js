const express = require("express");
const { MulterError } = require("multer");
const cors = require("cors");
const { errors } = require("celebrate");

const { BadRequest, NotFound } = require("./src/helper/ResponseUtil");
const { RequestLogFilter, SetHeader, SetCORS, StaticFilter } = require("./src/middleware/RequestFilter");

const app = express();
app.use(SetHeader());
app.use(cors(SetCORS()));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true })); 

// register base path '/'
app.get('/', (req, res) => res.send(`BE Up`))

// to public access attachment
app.use('/file/public',  express.static('public'));

// register static file, filtered by jwt
app.use('/static', StaticFilter, express.static('public'));

// register route filter
app.all("/*", RequestLogFilter);

// register all route under '/api/v1'
app.use("/api/v1", require('./src/routes/v1'));

// register error handler from Joi->Celebrate
app.use(errors());

// Middleware: Error handling
app.use((error, req, res, next) => {
    if (error instanceof MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            BadRequest(res, "File max size should be less than 3 MB");
        }
    }
});

app.enable('trust proxy')

app.get("*", function (req, res) {
    return NotFound(res, "Page Not Found");
});

module.exports = app;
