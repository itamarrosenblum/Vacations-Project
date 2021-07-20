const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));

require('dotenv').config();
const {cloudinary} = require('./cloudinary');
const {Admin, User, Vacation, Follower, Op, sequelize, Model, DataTypes,} = require('./database');

app.use(async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (req.method === 'POST') { // Post requests
            if (req.path === '/account') { // New account validator
                const isUser = await User.findOne({where: {username: username}});
                if (!isUser) {
                    req.body.token = `member-${Math.random().toString(36).substr(7)}`;
                    next();
                } else {
                    res.send({status: '401'});
                }
            } else if (req.path === '/session') { // Log in validtor
                const isUser = await User.findOne({where: {
                    username: username, 
                    password: password
                }});

                const isAdmin = await Admin.findOne({where: {
                    username: username, 
                    password: password
                }});

                if (isUser || isAdmin) {
                    req.body.token = isUser ? isUser.token : isAdmin.token;
                    next();
                } else {
                    res.send({status: '401'});
                } 
            } else if (req.path === '/vacation') {
               next();
            } else if (req.path === '/favorite') {
                const {userToken, vacationId} = req.body;
                const isUser = await User.findOne({where: {token: userToken}});

                const isFollowed = await Follower.findOne({where: {
                    userId: isUser.id,
                    vacationId: vacationId
                }});

                if (!isFollowed) {
                    req.body.userId = isUser.id;
                    next();
                }
             } else if (req.path === '/search') { 
                 next()
             }
        } else if (req.method === 'GET') { // Get requests
            next();
        } else if (req.method === 'PUT') { // Put requests
            if (req.path === '/vacation') {
                next();
            }
        } else if (req.method === 'DELETE') { // Delete requests
            if (req.path === '/favorite') {
                const {userToken, vacationId} = req.body;

                const isUser = await User.findOne({where: {token: userToken}});
                const isFollowed = await Follower.findOne({where: {
                    userId: isUser.id,
                    vacationId: vacationId
                }});
                
                if (isFollowed) {
                    req.body.userId = isUser.id;
                    next();
                }
            } else if (req.path === '/vacation') {
                next();
            }
        }
    } catch (err) {
        console.error(err);
    }
});

app.get('/vacation/:token', async (req, res) => { // Get favorite vacations
    try {
        const isUser = await User.findOne({
            attributes: ['username'], 
            where: {token: req.params.token}}
        );

        const vacation = JSON.parse(JSON.stringify(
            await Vacation.findAll({
                attributes: [
                    'id', 
                    'destination', 
                    'description', 
                    'image', 
                    'from', 
                    'until', 
                    'price'
                ],
                include: {
                    model: User,
                    attributes: ['username'],
                    required: false
            }})
        ));
        
        if (isUser) { 
            vacation.forEach(e => {
                e.users.forEach(k => {
                    (k.username === isUser.username) ? e.isFollowing = true : null;
                });
            });
        }

        const arrFavorites = vacation.filter(e => e.isFollowing);
        const arrNeutral = vacation.filter(e => e.isFollowing === undefined);
        const arr = (arrFavorites.length > 0) ? [...arrFavorites, ...arrNeutral] : vacation;

        res.send({status: '200', vacations: arr});
    } catch (err) {
        res.status(400).send({ status: '400', err });
        console.error(err);
    }
});

app.post('/account', async (req, res) => { // Create new account
    try {
        const {firstName, lastName, username, password, token} = req.body;

        const createUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: password,
            token: token
        });
        res.send({status: '200'});
    } catch (err) {
        console.error(err);
    }
});

app.post('/session', (req, res) => { // Log in request
    const {token} = req.body;
    res.send({status: '200', token: token});
});

app.get('/session/:token', async (req, res) => { // Send user info
    try {
        const isUser = await User.findOne({
            attributes: ['username', 'firstName', 'lastName'],
            where: {token: req.params.token}
        });
        res.send({status: '200', user: isUser});
    } catch (err) {
        console.error(err)
    }
});

app.post('/vacation', async (req, res) => { // Create new vacation
    try {
        const {destination, description, image, from, until, price} = req.body;

        const uploadResponse = await cloudinary.uploader.upload(
        image, {
            upload_preset: 'vacationProject'
        });

        const createVacation = await Vacation.create({
            destination: destination,
            description: description,
            image: uploadResponse.public_id,
            from: from,
            until: until, 
            price: price
        });
        res.send({status: '200'});
    } catch (err) {
        console.error(err);
    }
});

app.put('/vacation', async (req, res) => { // Update vacation
    try {
        const {image, id} = req.body;
        const isVacation = await Vacation.findOne({where: {id: id}});
        console.log(req.body)
        if(isVacation) {
            const arrKey = Object.keys(req.body);
            const arrValue = Object.values(req.body);

            const uploadResponse = image ? 
                await cloudinary.uploader.upload(
                    image, {
                        upload_preset: 'vacationProject'
                }) : null;

            arrKey.forEach((arrKey, index) => {
                if (arrKey === 'image') {
                    isVacation[arrKey] = uploadResponse.public_id;
                } else if (arrKey === 'from' || arrKey === 'until') {
                    isVacation[arrKey] = arrValue[index];
                } else {
                    isVacation[arrKey] = arrValue[index];
                }
            });
           await isVacation.save();
        }
        res.send({status: '200'});
    } catch (err) {
        console.error(err);
    }
});

app.delete('/vacation', async (req, res) => { // Delete vacation
    try {
        const isVacation = await Vacation.findOne({where: {id: req.body.id}});
        await isVacation.destroy();
        res.send({status: '200'});
    } catch (err) {
        console.error(err);
    }
});

app.post('/favorite', async (req, res) => { // Add to favorites
    try {
        const {userId, vacationId} = req.body;

        const addFavorites = await Follower.create({
            userId: userId,
            vacationId: vacationId
        });
        res.send({status: '200'});
       
    } catch (err) {
        console.error(err);
    }
});

app.delete('/favorite', async (req, res) => { // Remove from favorites
    try {
        const {userId, vacationId} = req.body;

        const removeFavorites = await Follower.findOne({where : {
            userId: userId,
            vacationId: vacationId
        }});
        await removeFavorites.destroy();
        res.send({status: '200'});
    } catch (err) {
        console.error(err);
    }
});

app.post('/search', async (req, res) => { // Search vacation results
    try {
        const {description, from, until, token} = req.body
        const isUser = await User.findOne({
            attributes: ['username'], 
            where: {token: token}}
        );

        const vacation = JSON.parse(JSON.stringify(
            await Vacation.findAll({
                attributes: [
                    'id', 
                    'destination', 
                    'description', 
                    'image', 
                    'from', 
                    'until', 
                    'price'
                ],
                include: {
                    model: User,
                    attributes: ['username'],
                    required: false
            }})
        ));

        if (isUser) {
            vacation.forEach(e => {
                e.users.forEach(k => {
                    (k.username === isUser.username)
                    ? e.isFollowing = true : null;
                });
            });
        }
 
        const arrFavorites = vacation.filter(e => e.isFollowing);
        const arrNeutral = vacation.filter(e => e.isFollowing === undefined);
        const arr = (arrFavorites) ? [...arrFavorites, ...arrNeutral] : vacation;
       
        const found = arr.filter(e => 
            `${e.from}` === `${from}` 
            && `${e.until}` === `${until}` 
            && e.description.toLowerCase().includes(description.toLowerCase())
        );
        res.send({status: '200', vacations: found});
    } catch (err) {
        console.error(err);
    }
});

app.get('/analytics', async (req, res) => { // Send Analytics
    try {
        const vacation  = await Vacation.findAll({
            attributes: ['destination'],
            include: {
                model: User,
                attributes: ['username'],
                required: false
        }});

        const found = vacation.filter(e => e.users.length > 0)
        res.send({status: '200', vacation: found});
    } catch (err) {
        res.status(400).send({ status: '400', err });
        console.error(err);
    }
});

app.listen(3001, () => {    
    console.log('This server is listening to port 3001');
})