const schedule = require('node-schedule')
const { getOne } = require('./src/model/System')
const PermohonanController = require('./src/controller/PermohonanController')

const scheduler = {
    jobDisablePermohonan: async () => {
        const timing = await getOne({ category: 'SYSTEM', sub_category: 'SCHEDULLER', code: 'DISABLED_PERMOHONAN' })
        if(!timing) {
            throw new Error("System Master [cat: SYSTEM, sub_cat: SCHEDULLER, code: DISABLED_PERMOHONAN] tidak ditemukan")
        }
        var job = schedule.scheduleJob(timing.value, async() => {
            console.log(`${new Date()} - disabled permohonan scheduler`)
            const result = await PermohonanController.doScheduleDisablePermohonan();
            console.log(result)
        })
        return job
    },
    jobUpdateCurrentKuotaPermohonan: async () => {
        const timing = await getOne({ category: 'SYSTEM', sub_category: 'SCHEDULLER', code: 'RESET_KUOTA_PERMOHONAN' })
        if(!timing) {
            throw new Error("System Master [cat: SYSTEM, sub_cat: SCHEDULLER, code: RESET_KUOTA_PERMOHONAN] tidak ditemukan")
        }
        var job = schedule.scheduleJob(timing.value, async() => {
            console.log(`${new Date()} - update current kuota permohonan scheduler`)
            const result = await PermohonanController.doScheduleCurrentKuotaPermohonan();
            console.log(result)
        })
        return job
    },
    jobNotifReminderPermohonan: async () => {
        const timing = await getOne({ category: 'SYSTEM', sub_category: 'SCHEDULLER', code: 'NOTIF_PERMOHONAN' })
        if(!timing) {
            throw new Error("System Master [cat: SYSTEM, sub_cat: SCHEDULLER, code: NOTIF_PERMOHONAN] tidak ditemukan")
        }
        var job = schedule.scheduleJob(timing.value, async() => {
            console.log(`${new Date()} - reminder notif permohonan scheduler`)
            const result = await PermohonanController.doScheduleReminderNotif();
            console.log(result)
        })
        return job
    },
}

module.exports = scheduler
