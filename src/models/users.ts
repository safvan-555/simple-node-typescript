import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String },
    email: { type: String },
    phone: { type: Number },
    password: { type: String },
    create_on: { type: Number,default: new Date().getTime()}
});

var usermodel = mongoose.model('users', UserSchema);

module.exports.newUser = (data:any) => {
    let usr = new usermodel(data)
    return usr.save();
}
module.exports.getUser = (phone:Number, email:string) => {
    return usermodel.findOne({$and:[{phone:phone},{email:email}]}).lean();
}
module.exports.listUser = (match:any,skip:number,limit:number) => {
    return usermodel.find(match).sort({ _id: -1 }).skip(skip)
    .limit(limit).lean();
}
module.exports.listCount = (match:any) => {
    return usermodel.count(match);
}
