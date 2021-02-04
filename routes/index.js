const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStratagy = require('passport-local')
const userModal = require('./users');
const postModal = require('./posts');
const commentModal = require('./comments');
const msgModal = require('./conversation')


/**_____localStratagy Code for login____ */

passport.use(new localStratagy(userModal.authenticate()));

/* GET home page. */
router.get('/', function (req, res) {

  res.status(200).json({ 'stsus': 'index page' })
});


router.get('/profile', function (req, res) {
  userModal.findOne({ username: req.session.passport.user })
    .then((foundUser) => {
      res.status(200).json({ 'status': foundUser });
    })
});

router.post('/reg', (req, res) => {
  const newUser = new userModal({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact
  })
  userModal.register(newUser, req.body.password)
    .then(function (registerUser) {
      passport.authenticate('local')(req, res, function () {
        res.status(200).json({ 'status': 'created', 'data': registerUser });
      });
    })
})

router.post('/post', isLogggedin, (req, res) => {
  userModal.findOne({ username: req.session.passport.user })
    .then((foundUser) => {
      postModal.create({
        userid: foundUser._id,
        containt: req.body.containt
      })
        .then((createdpost) => {
          foundUser.posts.push(createdpost);
          foundUser.save()
            .then((pushedPost) => {
              res.status(200).json({ 'status': 'postCreated', 'data': pushedPost.posts })
            })

        })
    })
})

router.post('/comment/:postid', isLogggedin, (req, res) => {
  userModal.findOne({ username: req.session.passport.user })
    .then((loggedUser) => {
      postModal.findOne({ _id: req.params.postid })
        .then((foundPost) => {
          commentModal.create({
            userid: loggedUser._id,
            postid: foundPost._id,
            comment: req.body.comment
          })
            .then((commentpost) => {
              foundPost.comments.push(commentpost)
              foundPost.save()
                .then((saved) => {
                  res.status(200).json({ 'staus': 'comment Done', 'comment': commentpost, 'commentedpost': saved })
                })
            })

        })
    })
})
/** reaction route */

router.get('/post/:postid/react', isLogggedin, (req, res) => {
  userModal.findOne({ username: req.session.passport.user })
    .then((loggedUser) => {
      postModal.findOne({ _id: req.params.postid })
        .then((foundPost) => {
          if (!foundPost.reacts.includes(loggedUser._id)) {
            foundPost.reacts.push(loggedUser._id)
          } else {
            const index = foundPost.reacts.indexOf(loggedUser._id);
            foundPost.reacts.splice(index, 1)
          }
          foundPost.save()
            .then((reacted) => {
              res.status(200).json({ 'status': 'reation Done', 'data': reacted })
            })
        })
    })

})




router.post('/message/:userid', (req, res) => {
  userModal.findOne({ username: req.session.passport.user })
    .then((loggedUser) => {
      userModal.findOne({ _id: req.params.userid })
        .then((sentUser) => {
          console.log(sentUser.chatid, 'loggeduser') //consloe loggedusr
          console.log(loggedUser.chatid, 'sentUser')  //console sentUser
          var chatId = getCommon(loggedUser.chatid, sentUser.chatid);

          if(loggedUser._id != req.params.userid){

            if (chatId.length == 0) {
              msgModal.create({
                member1: loggedUser._id,
                member2: req.params.userid,
              })
                .then((chatdata) => {
                  chatdata.messages.push({
                    auther: loggedUser.username,
                    msgbody: req.body.message
                  })
                  chatdata.save()
                    .then((messagedone) => {
                      loggedUser.chatid.push(chatdata._id)
                      loggedUser.save()
                        .then((u) => {
                          sentUser.chatid.push(chatdata._id)
                          sentUser.save()
                            .then((alldone) => {
                              res.status(200).json({ 'status': messagedone })
                            })
                        })
                    })
                })
  
            } else {
              msgModal.findOne({ _id: chatId })
                .then((chatdata) => {
                  chatdata.messages.push({
                    auther: loggedUser.username,
                    msgbody: req.body.message
                  })
                  chatdata.save()
                    .then((messagedone) => {
                      res.status(200).json({ 'status': messagedone })
                    })
  
                })
  
            }


          }else{
            res.status(503).json({'status':'reciver id and sender id both are same checkOut please'})
          }

          


        })
    })
})











/*router.post('/message/:userid', (req, res) => {
  userModal.findOne({ username: req.session.passport.user })
    .then((loggedUser) => {
      if (loggedUser._id != req.params.userid) {
        msgModal.create({
          sender: loggedUser._id,
          reciver: req.params.userid,
        })
          .then((chatCreated) => {
            chatCreated.messages.push({
              auther: loggedUser.username,
              msgbody: req.body.message
            })
            chatCreated.save()
          .then((u)=>{
            res.status(200).json({'status':u})
          })
          })
          
      }else{
        console.log('err')
      }
 
    })
})
*/


/*________login code_______*/

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (userLogin) { });

/**_______logOut Code_______*/

router.get('/logout', function (req, res) {
  req.logOut();
  res.redirect('/');
})

/*________middleWares For protecting Routes________*/

function getCommon(arr1, arr2) {
  var common = [];                   // Array to contain common elements
  for (var i = 0; i < arr1.length; ++i) {
    for (var j = 0; j < arr2.length; ++j) {
      if (arr1[i].toString() == arr2[j].toString()) {       // If element is in both the arrays
        common.push(arr1[i]);        // Push to common array
      }
    }
  }
  console.log(common, 'common')
  return common;
  // Return the common elements
}




/*var arr1 = ['65121515155545', '96265111212ff9', 55, 223, 17, 93, 23];
var arr2 = [45,5,'65121515155545'];
// Get common elements of arr1, arr2
var commonElements = getCommon(arr1, arr2);*/



function isLogggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/')
  }
};

function redirectToProfile(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/profile')
  }
  else {
    return next();
  }
};


module.exports = router;
