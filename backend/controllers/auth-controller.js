const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service");
const { verifyOtp } = require("../services/otp-service");
const userService = require('../services/user-service');
const tokenService = require('../services/token-service') 

class AuthController {
    async sendOTP(req, res){
        const { phone } = req.body
        if(!phone){
            res.status(400).json({ message: 'Phone field is required'})
        }

        const otp = await otpService.generateOtp();

// ----------------------HASH------------------------------------------------
        const validTime = 1000*60*2 ; // 2 minute
        const expires = Date.now() + validTime
        const data = `${phone}.${otp}.${expires}` 
        const hash = hashService.hashOtp(data);

        

// ----------------------send OTP----------------------------------------------
        try {
            await otpService.sendBySms(phone, otp);
            return res.json({
                hash : `${hash}.${expires}`,
                phone,
            });
        } catch(err) {
            console.log(err);
            res.status(500).json({message : 'messae sending failed'})
        };
    }
    async verifyOtp(req, res) {
        const {otp, hash, phone} = req.body
        if(!otp || !hash || !phone){
            res.status(400).json({message : 'All feilds are required'})
        }

        const [hashedOtp, expires] = hash.split('.');
        if(Date.now() > +expires){
            res.status(400).json({message : 'OTP expires'});
        }            

        const data = `${phone}.${otp}.${expires}` ;
        const isValid = otpService.verifyOtp(hashedOtp, data)

        if(!isValid){
            res.status(400).json({message : 'Invalid OTP'})
        }

        let user ;

        try{
            user = await userService.findUser({phone})
            if(!user){
               user =  await userService.createUser({phone})
            }
        } catch(err){
            console.log(err)
            res.status(500).json({ message : 'DB Error'})
        }

//------------------TOKEN-----------------------------------------
        const { accessToken , refreshToken } = tokenService.generateTokens({_id: user._id, activated: false})

        res.cookie('refreshToken', refreshToken, {
            maxAge : 1000*60*60*24*30,
            httpOnly : true
        })

        res.json({accessToken});

    }
}

module.exports = new AuthController();