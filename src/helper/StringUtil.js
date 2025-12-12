const moment = require('moment')
const { v4: uuidv4 } = require( "uuid")
const slugify = require('slugify')

class StringUtil {
    addWild(txt) {
        return `%${txt}%`
    }
    formatDateToDbStamp(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    }
    formatDateOnly = (date) => {
        if(date) {
            return moment(date).format('MMM D, YYYY')
        } 
        return ''        
    }
    formatDate = (date) => {
        if(date) {
            return moment(date).format('MMM D, YYYY h:mm A')
        } else {
            return ''
        }
    }
    formatDateToString = (date, format='YYYY-MM-DD', locale) => {
        if(date) {
            if(locale){
                moment.locale(locale)
                return moment(date).locale(locale).format(format)
            }
            return moment(date).format(format)
        } else {
            return ''
        }
    }
    timestamp = () => {
        return moment().format('YYYYMMDDHHmmss')        
    }
    addIdentityData(obj, date, by, isAdd = true) {
        let formatedDt = this.formatDateToDbStamp(date)
        if(isAdd) {
            obj.created_by = by        
            obj.created_dt = formatedDt
        }
        obj.updated_by = by
        obj.updated_dt = formatedDt
    }
    generateUUID() {
        return uuidv4()
    }
    slugIt(txt) {
        return slugify(txt, '-')
    }
    validIpV4(text) {
        if(!text) return false
        let ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(text)
    }
    validIpV6(text) {
        if(!text) return false
        let ipv6Regex = /^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
        return ipv6Regex.test(text)
    }
    validIpAddress(text) {
        return this.validIpV4(text) || this.validIpV6(text)
    }
    getWeekDates(date) {
        const inputDate = new Date(date);
        const dayOfWeek = inputDate.getDay();
        const monday = new Date(inputDate);
        monday.setDate(inputDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to get Monday
    
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            weekDates.push(currentDay.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        }
    
        return weekDates;
    }
    getMonthOfDates(date) {
        const january = new Date(date)
        january.setMonth(0)

        const months = []
        for(let i=0; i<12; i++) {
            const currMonth = new Date(january)
            currMonth.setMonth(january.getMonth() + i)
            months.push(currMonth.toISOString().split('T')[0].substring(0, 7))
        }
        return months
    }
}

module.exports = new StringUtil()