module.exports = function(app, db, passport, ObjectId, upload) {


/********************
=====Base routes=====
*********************/

    // Load root index ===================================================
    app.get('/', function(req, res) {
      res.render('index.ejs', {
        message: req.flash('loginMessage')
      })
      // res.redirect('/dashboard')
    })

    app.get('/user/:uID', function(req, res) {
      db.collection('users').findOne({_id: ObjectId(req.params.uID)}, (err,result) => {
        console.log("===========")
        console.log(req.params.uID)
        console.log(result)

        if(err) return console.log(err)
        db.collection('posts').find({authorID: ObjectId(req.params.uID)}).toArray((err2, result2) => {
          if(err) return console.log(err)
          console.log('posts++++++++')
          console.log(result2)
          res.render('user.ejs', {
            user: result,
            posts: result2
          })
        })
      })
    })

    app.get('/feed', isLoggedIn, (req, res) => {
      db.collection('posts').find().toArray((err, result) => {
        if(err) return console.log(err)
        res.render('feed.ejs' , {
          user: req.user,
          posts: result
        })
      })
    })

    app.get('/post/:postID', isLoggedIn, (req, res) => {
      db.collection('posts').findOne({ _id: ObjectId(req.params.postID) },(err, result) => {
        if(err) return console.log(err)
        db.collection('comments').find({postID: `${result._id}`}).toArray((err2, result2)=>{
          if(err2) return console.log(err2)
          console.log('getting comments')
          console.log(result._id)
          console.log(result2)
          res.render('post.ejs' , {
            post: result,
            comments: result2,
            user: req.user
          })
        })

      })
    })

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
      res.render('signup.ejs', {
        message: req.flash('signupMessage')
      })
    })



    /**************************
    =====Dashboard routes=====
    **************************/

    app.post('/newPost' , upload.single('theImage'),(req,res) => {

        console.log(req.file)
        db.collection('posts').insertOne({
          title: req.body.title,
          authorName: req.user.local.email,
          authorID: req.user._id,
          path: req.file.path,
          body: req.body.body
        }, (err, result) => {
          if(err) return console.log(err)
          console.log('new order saved')
          res.redirect('/feed')
        })
    })

    app.post('/post/comment' , isLoggedIn,(req,res) => {
        console.log(req.body)
        db.collection('comments').insertOne({
          postID: req.body.postID,
          authorName: req.user.local.email,
          authorID: req.user._id,
          commentBody: req.body.commentBody
        }, (err, result) => {
          if (err){console.log(err)
            // res.redirect('/dashboard')
            return res.status(500).send({
              message: 'This is an error!'
            })
          } else {
            return res.status(201).send({
              message: "Onboarding Complete"
            })
          }
        })
      })



    app.put('/complete', isLoggedIn, (req, res) => {
      console.log(`Completing order ${req.body._id}`)
      let baristaNew = !req.body.complete? req.user.local.email : ''
      db.collection('orders').findOneAndUpdate({
        _id: ObjectId(req.body._id)
      }, {
        $set: {
          complete: !req.body.complete,
          barista: baristaNew
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if(err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/clear', isLoggedIn, (req, res) => {
      console.log(`Clearing order ${req.body._id}`)
      db.collection('orders').findOneAndUpdate({
        _id:ObjectId(req.body._id)
      }, {
        $set: {
          clear: true
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if(err) return res.send(err)
        res.redirect('/barista')
      })
    })

    app.get('/dashboard', function(req, res) {
      db.collection('foodAid').find().toArray((err, result) => {
        if(err) return console.log(err)
        res.render('dashboard.ejs', {
          foodaid: result,
          title: 'Dashboard'
        })
      })
    })



    app.put('/request', function(req, res) {
      db.collection.findOneAndUpdate({
        _id:req.body._id
      }, {
        $set:
          {
            status: 'request',
            requestor: req.body.userID
          }
      }, {
        sort: {_id: -1},
        upsert:true
      }, (err, result) => {
        if(err) return res.send(err)
        res.send(result)
      })
    })

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/feed', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/login-manager', passport.authenticate('local-login', {
        successRedirect : '/manager', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/feed', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
