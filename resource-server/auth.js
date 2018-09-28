var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , OAuth2 = require('oauth').OAuth2
    , db = require('./db')
    , config = require('./config')
    , BearerStrategy = require('passport-http-bearer').Strategy
    , request = require('request');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.  The login
 * mechanism is going to use our server's client id/secret to authenticate/authorize
 * the user and get both an access and refresh token.  The sever *does not* store the
 * user's name and the server *does not* store the user's password.  Instead, using
 * the access token the server can reach endpoints that the user has been granted
 * access to.
 *
 * A cookie/session which *does not* have the access token is pushed through passport
 * onto the local user's system.  That web cookie/session enables us to not have to
 * repeatedly call the authentication/authorization sever continuously for simple static
 * HTML page loading.  However, end points that are protected still will need the access
 * token passed to them through the Authorization Bearer usage.
 */
passport.use(new LocalStrategy(
    function (username, password, done) {
        //TODO Replace this with request calls from request = require('request');
        var oauth2 = new OAuth2(config.client.clientID, config.client.clientSecret, config.authorization.url, null, config.authorization.tokenURL, null);
        oauth2.getOAuthAccessToken('', {'grant_type': 'password', 'username': username, 'password': password, 'scope': 'offline_access'},
            function (e, access_token, refresh_token, results) {
                if (access_token) {
                    //TODO scopes
                    var expirationDate = null;
                    if (results.expires_in) {
                        expirationDate = new Date(new Date().getTime() + (results.expires_in * 1000));
                    }
                    var saveAccessToken = function (err) {
                        if (err) {
                            return done(null, false);
                        }
                        return done(null, {accessToken: access_token, refreshToken: refresh_token});
                    };
                    if (refresh_token) {
                        db.refreshTokens.save(refresh_token, config.client.clientID, null, function (err) {
                            if (err) {
                                return done(null, false);
                            }
                            db.accessTokens.save(access_token, expirationDate, config.client.clientID, null, saveAccessToken);
                        });
                    } else {
                        db.accessTokens.save(access_token, expirationDate, config.client.clientID, null, saveAccessToken);
                    }
                } else {
                    return done(null, false);
                }
            }
        );
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    function (accessToken, done) {
        db.accessTokens.find(accessToken, function (err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                request.get(config.authorization.tokeninfoURL + accessToken,
                    function (error, response, body) {
                        console.log(error);
                        if(response.statusCode === 200) {
                            var jsonReturn = JSON.parse(body);
                            if (jsonReturn.error) {
                                return done(null, false);
                            } else {
                                var expirationDate = null;
                                if(jsonReturn.expires_in) {
                                    expirationDate = new Date(new Date().getTime() + (jsonReturn.expires_in * 1000));
                                }
                                //TODO scopes
                                db.accessTokens.save(accessToken, expirationDate, config.client.clientID, null, function (err) {
                                    if(err) {
                                        return done(err);
                                    }
                                    return done(null, accessToken);
                                });
                            }
                        } else {
                            return done(null, false);
                        }
                    }
                );
            } else {
                if(token.expirationDate && (new Date() > token.expirationDate)) {
                    db.accessTokens.delete(token, function(err) {
                        if(err) {
                            return done(err);
                        } else {
                            return done(null, false);
                        }
                    });
                } else {
                    return done(null, token);
                }
            }
        });
    }
));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

