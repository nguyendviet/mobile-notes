angular.module('git2it.service.auth', ['git2it.utils'])
    .service('authService', function($q, $_, $localstorage) {

        this.signup = function(newuser) {
            var deferred = $q.defer();

            newuser.username = newuser.email.replace("@", "_").replace(".", "_");

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

            var attributeList = [];

            var dataEmail = {
                Name: 'email',
                Value: newuser.email
            };

            var dataName = {
                Name: 'name',
                Value: newuser.name
            };

            var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
            var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName);

            attributeList.push(attributeEmail);
            attributeList.push(attributeName);

            console.log("Submitting " + newuser.name);
            userPool.signUp(newuser.username, newuser.password, attributeList, null, function(err, result) {
                if (err) {
                    console.log(err);
                    deferred.reject(err.message);
                } else {
                    deferred.resolve(result.user);
                }
            });

            return deferred.promise;

        };

        this.confirm = function(newuser) {
            var deferred = $q.defer();

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: newuser.username,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
            cognitoUser.confirmRegistration(newuser.confirmCode, true, function(err, result) {
                if (err) {
                    console.log(err);
                    deferred.reject(err);
                }
                deferred.resolve();
            });

            return deferred.promise;
        };

        this.signin = function(user) {
            var deferred = $q.defer();

            var authenticationData = {
                Username: user.email,
                Password: user.password,
            };

            var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(
                authenticationData);
            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: user.email,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

            try {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function(result) {
                        console.log(cognitoUser)
                        console.log('access token + ' + result.getIdToken().getJwtToken());
                        $localstorage.set('username', cognitoUser.getUsername());
                        deferred.resolve(result);
                    },

                    onFailure: function(err) {
                        deferred.reject(err);
                    },

                });
            } catch (e) {
                console.log(e);
                deferred.reject(e);
            }

            return deferred.promise;

        };

        this.isAuthenticated = function() {
            var deferred = $q.defer();
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            try {
                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        }
                        deferred.resolve(true);
                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };

        this.logOut = function() {

            try {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.signOut();
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                console.log(e);
                return false;
            }

        };

        this.getUserAccessToken = function() {
            var deferred = $q.defer();

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    deferred.resolve(session.idToken);
                });

            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        this.getUserAccessTokenWithUsername = function() {
            var deferred = $q.defer();

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    deferred.resolve({
                        token: session.idToken,
                        username: cognitoUser.username
                    });
                });

            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        this.getUserInfo = function() {
            var deferred = $q.defer();

            var userinfo = {
                email: "",
                name: "",
                username: ""
            }
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }

                    cognitoUser.getUserAttributes(function(err, result) {
                        if (err) {
                            console.log(err);
                            deferred.reject(err);
                        }

                        var nm = $_.where(result, {
                            Name: "name"
                        });
                        if (nm.length > 0) {
                            userinfo.name = nm[0].Value;
                        }

                        var em = $_.where(result, {
                            Name: "email"
                        });
                        if (em.length > 0) {
                            userinfo.email = em[0].Value;
                        }

                        userinfo.username = cognitoUser.getUsername();

                        deferred.resolve(userinfo);

                    });
                });
            } else {
                deferred.reject();
            }

            return deferred.promise;

        }

    });
