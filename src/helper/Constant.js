const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const REGEX_SERVICE_NAME = /^[\w -]{1,100}$/  // all word character, no symbol, space and -, 1 to 100 characters
const REGEX_PATH = /^([\/]{1}[a-z0-9.]+)+(\/?){1}$|^([\/]{1})$/ // /abc/def

const ROLE_PETUGAS = 'petugas'
const ROLE_MANAJER = 'manajer'
const ROLE_PEMOHON = 'pemohon'
const ROLE_SA = 'superadmin'
const ROLE_ADMIN = 'admin'
const ROLE_LEADER = 'leader'
const ROLE_SPV = 'spv'
const ROLE_OPT = 'operator'

const STS_PERMOHONAN_REGISTERED = '01'
const STS_PERMOHONAN_VERIFIED = '02'
const STS_PERMOHONAN_APPROVED = '03'
const STS_PERMOHONAN_REJECTED = '04'

const STS_USER_TDK_AKTIF = '00'
const STS_USER_AKTIF = '01'
const STS_USER_DIHAPUS = '99'

const ACTION_CREATE = 'create'
const ACTION_READ = 'read'
const ACTION_UPDATE = 'update'
const ACTION_DELETE = 'delete'
const ACTION_APPROVE = 'approve'

// credential / request location
const QUERY_PARAM = 'Q'
const PATH_PARAM = 'P'
const BODY_PARAM = 'B'
const HEADER_PARAM = 'H'
const BASIC_AUTH_PARAM = 'A'

// req type
const REQ_TYPE_FORM = 'form'
const REQ_TYPE_URLENC = 'urlenc'
const REQ_TYPE_JSON = 'json'
const REQ_TYPE_TEXT = 'text'
const REQ_TYPE_XML = 'xml'

const FUNCTION_ID_SUMBER_DATA = "F101"
const FUNCTION_ID_GALERI_PRODUK = "F201"
const FUNCTION_ID_PERMOHONAN = "F301"
const FUNCTION_ID_LOG = "F401"
const FUNCTION_ID_USER_MASTER = "F501"
const FUNCTION_ID_BRANCH_MASTER = "F502"
const FUNCTION_ID_ROLE_PERMISSION = 'F503'
const FUNCTION_ID_IP_BLACKLIST_PERMISSION = 'F504'
const FUNCTION_ID_ORGANIZATION = 'F505'
const FUNCTION_ID_SYSTEM_MASTER = 'F601'
const FUNCTION_ID_DASHBOARD = 'F701'
const FUNCTION_ID_PEMELIHARAAN = 'F801'

const PREFIX_DEL = '_DEL'

// attachment
const ATTACHMENT_TABLE_CODE = {
    DOC_PERMOHONAN: 'DOC_PERMOHONAN'
}

const PUBLIC_PATH = {
    DOC_PERMOHONAN: './public/doc_permohonan',
    STATIC_DOC_PERMOHONAN: '/static/doc_permohonan'
}

// notif
const NOTIF = {
    STATUS : {
        UNREAD : 'U',
        READ : 'R',
        DOWNLOAD : 'D',
    },
    TYPE : {
        INFO : 'I',
        ERROR : 'E',
        WARNING : 'W',
    },
    ACTION_TYPE : {
        REGISTERED : 'R',
        VERIFICATION : 'V',
        APPROVAL : 'A',
        REMINDER : 'RI',
    },
    MSG : {
        REGISTERED : 'R',
        VERIFICATION : 'V',
        APPROVAL : 'A',
        REMINDER : 'RI',
    }
}

const Constant = {
    REGEX_PASSWORD,
    REGEX_SERVICE_NAME,
    REGEX_PATH,

    ROLE_PETUGAS,
    ROLE_MANAJER,
    ROLE_PEMOHON,
    ROLE_SA,
    ROLE_ADMIN,
    ROLE_LEADER,
    ROLE_SPV,
    ROLE_OPT,

    STS_PERMOHONAN_REGISTERED,
    STS_PERMOHONAN_VERIFIED,
    STS_PERMOHONAN_APPROVED,
    STS_PERMOHONAN_REJECTED,

    STS_USER_TDK_AKTIF,
    STS_USER_AKTIF,
    STS_USER_DIHAPUS,

    QUERY_PARAM,
    PATH_PARAM,
    BODY_PARAM,
    HEADER_PARAM,
    BASIC_AUTH_PARAM,

    REQ_TYPE_FORM,
    REQ_TYPE_JSON,
    REQ_TYPE_URLENC,    

    FUNCTION_ID_SUMBER_DATA,
    FUNCTION_ID_GALERI_PRODUK,
    FUNCTION_ID_PERMOHONAN,
    FUNCTION_ID_LOG,
    FUNCTION_ID_USER_MASTER,
    FUNCTION_ID_BRANCH_MASTER,
    FUNCTION_ID_ROLE_PERMISSION,
    FUNCTION_ID_IP_BLACKLIST_PERMISSION,
    FUNCTION_ID_ORGANIZATION,
    FUNCTION_ID_SYSTEM_MASTER,
    FUNCTION_ID_DASHBOARD,
    FUNCTION_ID_PEMELIHARAAN,
    
    ACTION_CREATE,
    ACTION_READ,
    ACTION_UPDATE,
    ACTION_DELETE,
    ACTION_APPROVE,

    PREFIX_DEL,

    ATTACHMENT_TABLE_CODE,
    PUBLIC_PATH,

    NOTIF,
}

Object.freeze(Constant)
module.exports = Constant