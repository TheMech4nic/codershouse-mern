const crypto = require('crypto')

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken, {
    lazyLoading: true
})
 
class OtpService {
    async generate(){
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }
    
    async sendBySms(phone, otp){
        return await twilio.messages.create({
            to: phone,
            from : process.env.SMS_FROM_NUMBER,
        })
    }

    verifyOtp(){}

}

module.exports = new OtpService();