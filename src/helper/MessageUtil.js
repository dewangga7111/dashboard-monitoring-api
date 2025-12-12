// MessageList[''] = ""
const MessageList = [];
MessageList["not.found.in.master"] = "Tidak bisa mengubah {0}, data tidak ditemukan di master";
MessageList["found.duplicate"] = "{0} : {1} sudah ada";
MessageList["found.duplicate.entry"] = "Tidak bisa menambahkan {0}, data sudah ada";
MessageList["not.found"] = "{0} tidak ditemukan";
MessageList["found"] = "{0} ditemukan";
MessageList["not.access"] = "Tidak memiliki akses terhadap data ini";
MessageList["required"] = "{0} wajib diisi";
MessageList["cant.order.data"] = "Tidak dapat mengurutkan data dengan nilai ini";
MessageList['invalid.password.pattern'] = 'Password harus minimal 8 digit, sedikitnya memiliki masing-masing 1 huruf besar, huruf kecil, angka dan simbol'
MessageList['invalid.servicename.pattern'] = 'Nama Koneksi hanya dibolehkan huruf dan angka'
MessageList['invalid.path.pattern'] = 'Format Path tidak sesuai pola yang valid'
MessageList['invalid.login'] = "Username or Password is incorrect"
MessageList['unauthorized'] = "Tidak memiliki akses"
MessageList['captcha.failed'] = "Vefifikasi captcha gagal, silahkan coba lagi"
MessageList['invalid'] = "{0} tidak valid"
MessageList['cannot.update.approved'] = "Tidak bisa mengubah data yang telah disetujui"
MessageList['cannot.delete.approved'] = "Tidak bisa menghapus data yang telah disetujui"
MessageList['not.ready.approve'] = "Status Data belum siap untuk disetujui"
MessageList['invalid.delete.owner'] = "Tidak bisa menghapus data sendiri"
MessageList['invalid.update.owner'] = "Tidak bisa mengubah status diri sendiri"
MessageList['invalid.oldpassword'] = "Password lama tidak valid"
MessageList['reset'] = 'Pengguna <b>{0}</b><br/><br/>Berikut kode OTP untuk mengubah password <b>{1}</b><br/><br/>Terima kasih,<br/>Api Gateway Management'
MessageList['invalid.otp'] = "Kode OTP tidak sesuai"
MessageList['invalid.otp.not.found'] = "Kode OTP tidak ditemukan"
MessageList['invalid.otp.expired'] = "Kode OTP telah expired"
MessageList['invalid.otp.used'] = "Kode OTP telah digunakan"
MessageList['produk.permohonan.exists'] = "Data gagal dihapus, ditemukan data terkait di {0} dan {1}"
MessageList['produk.exists'] = "Data gagal dihapus, ditemukan data terkait di {0}"
MessageList['permohonan.exists'] = "Data gagal dihapus, ditemukan data terkait di {0}"


// eslint-disable-next-line
String.prototype.format = function (args) {
  const str = this;
  return str.replace(String.prototype.format.regex, function (item) {
    const intVal = parseInt(item.substring(1, item.length - 1));
    let replace;
    if (intVal >= 0) {
      replace = args[intVal];
    } else if (intVal === -1) {
      replace = "{";
    } else if (intVal === -2) {
      replace = "}";
    } else {
      replace = "";
    }
    return replace;
  });
};
// eslint-disable-next-line
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

const GetMsg = (code, ...param) => {
  return MessageList[code].format(param);
};

module.exports = { GetMsg };
