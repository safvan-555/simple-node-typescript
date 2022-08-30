import * as express from 'express';
const app = express.Router()
const { getUser, newUser, listUser, listCount } = require('../models/users');

const pbkdf2 = require('pbkdf2');
var pbk = require('../config.json');

const Create = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
console.log(req.body)
    if (!req.body.name) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Name is required.' });
        res.status(400);
        return
    }
    if (!req.body.email) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Email is required.' });
        res.status(400);
        return
    }

    if (!req.body.phone || !Number(req.body.phone)) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Phone is required.' });
        res.status(400);
        return
    }
    if (req.body.phone.length != 10) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Phone should be 10 digits.' });
        res.status(400);
        return
    }
    if (!req.body.password) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Password is required.' });
        res.status(400);
        return
    }
    if (req.body.password.length < 8) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Password should be greater than 8 characters.' });
        res.status(400);
        return
    }
    if (!req.body.confirm_password) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Confirm Password is required.' });
        res.status(400);
        return
    }
    if (req.body.confirm_password != req.body.password) {
        res.json({ status: false, error: 'invalid_details', error_description: 'Password should be equal.' });
        res.status(400);
        return
    }
    var pawd = pbkdf2.pbkdf2Sync(req.body.password, pbk.pbkdf2.saltRounds, pbk.pbkdf2.itration, pbk.pbkdf2.keylenght, pbk.pbkdf2.digest);
    getUser(req.body.phone, req.body.email).then((da: any) => {
        if (da) {
            res.json({ status: false, error: 'invalid_details', error_description: 'User already exists.' });
            res.status(400);
            return
        }
        var body = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: pawd,
        }
        newUser(body).then((dat: any) => {
            res.json({ status: true, message: 'Created Successfully.' });
            res.status(200);
            return
        }).catch((error: any) => {
            res.json({ status: false, error: 'invalid_details', error_description: error });
            res.status(400);
            return
        })
    }).catch((error: any) => {
        res.json({ status: false, error: 'invalid_details', error_description: error });
        res.status(400);
        return
    })
};

const Lists = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    var dd: any = {}
    dd.draw = req.body.draw;

    var sreach = req.body.search.value;

    var start = Number(Number(req.body.start) / Number(req.body.length)) + 1;
    var lim = Number(req.body.length);

    var page = start - 1;

    var skip = page * lim;

    var cont = [];
    if (sreach) {
        cont.push({
            $or: [
                { phone: RegExp(sreach, "i") },
                { name: RegExp(sreach, "i") },
                { email: RegExp(sreach, "i") },
            ],
        });
    }


    var search: any;
    if (cont.length > 1) {
        search = { $and: cont };
    } else if (cont.length == 1) {
        search = cont ? cont[0] : "";
    } else {
        search = {};
    }

    listCount(search).then((count: any) => {

        listUser(search, skip, lim).then((docs: any) => {
            let content: any = [];
            for (let i = 0; i < docs.length; i++) {
                let dar: any = {};
                dar.slno = skip + 1 + i;
                dar.name = docs[i].name
                dar.email = docs[i].email
                dar.phone = docs[i].phone
                content.push(dar);
            }
            dd.datasector = content;
            dd.recordsTotal = count;
            dd.recordsFiltered = count;
            res.status(200).json(dd);

        }).catch((error: any) => {
            res.json({ error: 'invalid_details', error_description: error });
            res.status(400);
            return
        });
    }).catch((error: any) => {
        res.json({ error: 'invalid_details', error_description: error });
        res.status(400);
        return
    })
}
export { Create, Lists };

