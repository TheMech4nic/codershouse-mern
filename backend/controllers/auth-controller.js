const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service")

class AuthController {
    async sendOTP(req, res){
        const { phone } = req.body
        if(!phone){
            res.status(400).json({ message: 'Phone field is required'})
        }

        const otp = await otpService.generate();

// ----------------------HASH------------------------------------------------
        const validTime = 1000*60*2 ; // 2 minute
        const expires = Date.now() + validTime
        const data = `${phone}.${otp}.${expires}` 
        const hash = hashService.hashOtp(data);

        res.json({ hash : hash})

// ----------------------send OTP----------------------------------------------
        try {
            await otpService.sendBySms(phone, otp);
            res.json({
                hash : `${hash}.${expires}`,
                phone,
            });
        } catch(err) {
            console.log(err);
            res.status(500).json({message : 'messae sending failed'})
        }
    }
}

module.exports = new AuthController();