const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    req.body.sauce = JSON.parse(req.body.sauce);
    const url = req.protocol + '://' + req.get('host');
    
    const sauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        imageUrl: url + '/images/' + req.file.filename,
        description: req.body.sauce.description,
        heat: req.body.sauce.heat,
        mainPepper: req.body.sauce.mainPepper,
        manufacturer: req.body.sauce.manufacturer,
        likes: 0,
        dislikes: 0,
        usersLiked: req.body.sauce.usersLiked,
        usersDisliked: req.body.sauce.usersDisliked
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'New sauce added to database successfully!'+ req.body.sauce.userId
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    })
    .then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
}

exports.updateSauce = (req, res, next) => {
    let sauce = new Sauce({_id: req.params._id});
    const url = req.protocol + '://' + req.get('host');
    if (req.file) {
        req.body.sauce = JSON.parse(req.body.sauce);
        sauce = {
            imageUrl: url + '/images/' + req.file.filename,
            description: req.body.sauce.description,
            manufacturer: req.body.sauce.manufacturer,
            mainPepper: req.body.sauce.mainPepper,
            heat: req.body.sauce.heat,
            name: req.body.sauce.name
        };
    } else {
        Sauce.findOne({_id: req.params.id}).then(
            (sauceRes) => {
            sauce = {
                imageUrl: sauceRes.imageUrl,
                description: req.body.description,
                manufacturer: req.body.manufacturer,
                mainPepper: req.body.mainPepper,
                heat: req.body.heat,
                name: req.body.name
            };
            Sauce.updateOne({_id: req.params.id}, sauce).then(
                () => {
                    res.status(201).json({
                        message: 'Sauce updated successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );                                     
        }).catch(
            (error) => {
                res.status(404).json({
                    error: error
                });
            }
        );
    }
    Sauce.updateOne({_id: req.params.id}, sauce).then(
        () => {
            res.status(201).json({
                message: 'Sauce updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then(
        (sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({_id: req.params.id}).then(
                    () => {
                        res.status(200).json({
                            message: 'Deleted!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            });
        }
    );  
};

exports.likeSauce = (req, res, next) => {
    //haven't tested this new part yet
    let sauce = new Sauce({_id: req.params.id});
    if (req.body.like == 1){
       sauce.likes += req.body.like;
       sauce.usersLiked.push(req.body.userId);
    } else if(req.body.like == 0 && sauce.usersDisliked.includes(req.body.userId)) {
        sauce.usersDisliked.remove(req.body.userId);
        sauce.dislikes -= 1;
    } else if (req.body.like == 0 && sauce.usersLiked.includes(req.body.userId)) {
        sauce.usersLiked.remove(req.body.userId);
        sauce.likes -= 1;
    }else {
        sauce.dislikes += 1;
        sauce.usersDisliked.push(req.body.userId);
    }
    sauce = {
        likes: sauce.likes,
        usersLiked: sauce.usersLiked,
        dislikes: sauce.dislikes,
        usersDisliked: sauce.usersDisliked
    }
    Sauce.updateOne({_id: req.params.id}, sauce).then(
        () => {
            req.status(201).json({
                message: "like updated"
            });
        }
    ).catch(
        (error) => {
            req.status(400).json({
                error: error
            });
        }
    )
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}